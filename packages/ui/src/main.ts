import "./style.css";
import type {
  ArgType,
  ClientMessage,
  FileError,
  ServerMessage,
  StoryIR,
} from "./types.ts";

const root = document.querySelector("#app");
if (!(root instanceof HTMLElement)) {
  throw new Error("#app is missing");
}
const app = root;

const state = {
  stories: [] as StoryIR[],
  errors: [] as FileError[],
  selectedId: new URLSearchParams(location.search).get("path"),
  args: {} as Record<string, unknown>,
  pages: [] as string[],
  lastGoodPages: [] as string[],
  diagnostics: [] as string[],
  previewError: false,
  zoom: 1,
  pageIndex: 0,
};

const socket = new WebSocket(
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`,
);

function send(message: ClientMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function setPath(id: string): void {
  const url = new URL(location.href);
  url.searchParams.set("path", id);
  history.replaceState(null, "", url);
}

function selectStory(id: string, resetArgs = true): void {
  const story = state.stories.find((item) => item.id === id);
  if (!story) {
    return;
  }
  state.selectedId = id;
  if (resetArgs) {
    state.args = { ...story.args };
  }
  state.pageIndex = 0;
  setPath(id);
  send({ type: "select", storyId: id });
  render();
}

function setArg(name: string, value: unknown): void {
  state.args = { ...state.args, [name]: value };
  if (state.selectedId) {
    send({ type: "set-args", storyId: state.selectedId, args: state.args });
  }
  render();
}

function groupedStories(): Map<string, StoryIR[]> {
  const groups = new Map<string, StoryIR[]>();
  for (const story of state.stories) {
    const list = groups.get(story.file) ?? [];
    list.push(story);
    groups.set(story.file, list);
  }
  return groups;
}

function shortPath(file: string): string {
  return file.replace(/\.story\.typ$/i, "").replace(/^stories\//, "");
}

function toolbarButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderControl(
  name: string,
  argType: ArgType,
  value: unknown,
): HTMLElement {
  const field = document.createElement("div");
  field.className = "field";
  const label = document.createElement("label");
  label.textContent = name;

  const control = argType.control;
  switch (control) {
    case "boolean": {
      field.classList.add("boolean");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(value);
      input.addEventListener("change", () => setArg(name, input.checked));
      field.append(input, label);
      return field;
    }
    case "number": {
      const input = document.createElement("input");
      input.type = "number";
      input.value = String(value ?? 0);
      input.addEventListener("change", () => setArg(name, Number(input.value)));
      field.append(label, input);
      return field;
    }
    case "select": {
      const select = document.createElement("select");
      for (const option of argType.options ?? []) {
        const item = document.createElement("option");
        item.value = String(option);
        item.textContent = String(option);
        if (String(option) === String(value)) {
          item.selected = true;
        }
        select.append(item);
      }
      select.addEventListener("change", () => setArg(name, select.value));
      field.append(label, select);
      return field;
    }
    case "color": {
      const input = document.createElement("input");
      input.type = "color";
      input.value = typeof value === "string" ? value : "#5e6ad2";
      input.addEventListener("input", () => setArg(name, input.value));
      field.append(label, input);
      return field;
    }
    case "text": {
      if (value && typeof value === "object") {
        const textarea = document.createElement("textarea");
        textarea.value = JSON.stringify(value, null, 2);
        textarea.addEventListener("change", () => {
          try {
            setArg(name, JSON.parse(textarea.value));
          } catch {
            setArg(name, textarea.value);
          }
        });
        field.append(label, textarea);
        return field;
      }
      const input = document.createElement("input");
      input.type = "text";
      input.value = String(value ?? "");
      input.addEventListener("change", () => setArg(name, input.value));
      field.append(label, input);
      return field;
    }
    default: {
      const _exhaustive: never = control;
      return _exhaustive;
    }
  }
}

function render(): void {
  app.replaceChildren();

  const selected = state.stories.find((story) => story.id === state.selectedId);

  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  const brand = document.createElement("div");
  brand.className = "brand";
  brand.innerHTML =
    '<span class="brand-mark" aria-hidden="true"></span><strong>typstbook</strong><span class="badge">local</span>';
  sidebar.append(brand);

  for (const [file, stories] of groupedStories()) {
    const group = document.createElement("div");
    group.className = "file-group";
    const label = document.createElement("div");
    label.className = "file-label";
    label.textContent = shortPath(file);
    group.append(label);
    for (const story of stories) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "story-btn";
      if (story.id === state.selectedId) {
        button.classList.add("active");
      }
      button.innerHTML = '<span class="dot" aria-hidden="true"></span>';
      const title = document.createElement("span");
      title.className = "label";
      title.textContent = story.title;
      button.append(title);
      button.addEventListener("click", () => selectStory(story.id));
      group.append(button);
    }
    const fileErrors = state.errors.filter((error) => error.file === file);
    for (const error of fileErrors) {
      const item = document.createElement("div");
      item.className = "file-error";
      item.textContent = error.message;
      group.append(item);
    }
    sidebar.append(group);
  }

  const looseErrors = state.errors.filter(
    (error) => !state.stories.some((story) => story.file === error.file),
  );
  for (const error of looseErrors) {
    const item = document.createElement("div");
    item.className = "file-error";
    item.textContent = `${error.file}: ${error.message}`;
    sidebar.append(item);
  }

  const canvas = document.createElement("main");
  canvas.className = "canvas";
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";

  const titleBlock = document.createElement("div");
  titleBlock.className = "toolbar-title";
  const path = document.createElement("div");
  path.className = "path";
  path.textContent = selected ? shortPath(selected.file) : "No story selected";
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = selected?.title ?? "typstbook";
  titleBlock.append(path, name);
  toolbar.append(titleBlock);

  const zoomGroup = document.createElement("div");
  zoomGroup.className = "toolbar-group";
  zoomGroup.append(
    toolbarButton("−", () => {
      state.zoom = Math.max(0.25, state.zoom - 0.25);
      render();
    }),
  );
  const zoomLabel = document.createElement("span");
  zoomLabel.className = "meta";
  zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
  zoomGroup.append(zoomLabel);
  zoomGroup.append(
    toolbarButton("+", () => {
      state.zoom = Math.min(3, state.zoom + 0.25);
      render();
    }),
  );
  toolbar.append(zoomGroup);

  const pages = state.previewError ? state.lastGoodPages : state.pages;
  if (pages.length > 1) {
    const pageGroup = document.createElement("div");
    pageGroup.className = "toolbar-group";
    pageGroup.append(
      toolbarButton("‹", () => {
        state.pageIndex = Math.max(0, state.pageIndex - 1);
        render();
      }),
    );
    const pageLabel = document.createElement("span");
    pageLabel.className = "meta";
    pageLabel.textContent = `${state.pageIndex + 1}/${pages.length}`;
    pageGroup.append(pageLabel);
    pageGroup.append(
      toolbarButton("›", () => {
        state.pageIndex = Math.min(pages.length - 1, state.pageIndex + 1);
        render();
      }),
    );
    toolbar.append(pageGroup);
  }
  canvas.append(toolbar);

  const stage = document.createElement("div");
  stage.className = "stage";
  const stack = document.createElement("div");
  stack.className = "stage-stack";
  if (state.diagnostics.length > 0) {
    const overlay = document.createElement("pre");
    overlay.className = "overlay";
    overlay.textContent = state.diagnostics.join("\n\n");
    stack.append(overlay);
  }
  const pageSvg = pages[state.pageIndex];
  if (pageSvg) {
    const page = document.createElement("div");
    page.className = state.previewError ? "page stale" : "page";
    page.style.transform = `scale(${state.zoom})`;
    page.style.transformOrigin = "top center";
    page.innerHTML = pageSvg;
    stack.append(page);
  } else if (state.diagnostics.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = state.stories.length
      ? "Select a story to preview."
      : "No stories found. Add a *.story.typ file and wait for refresh.";
    stack.append(empty);
  }
  stage.append(stack);
  canvas.append(stage);

  const controls = document.createElement("section");
  controls.className = "controls";
  const header = document.createElement("div");
  header.className = "controls-header";
  const heading = document.createElement("h2");
  heading.textContent = "Controls";
  const count = document.createElement("span");
  count.className = "count";
  const argCount = selected ? Object.keys(selected.argTypes).length : 0;
  count.textContent = String(argCount);
  header.append(heading, count);
  controls.append(header);

  if (selected) {
    for (const [name, argType] of Object.entries(selected.argTypes)) {
      controls.append(renderControl(name, argType, state.args[name]));
    }
    if (argCount === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "This story has no args.";
      controls.append(empty);
    }
  }

  app.append(sidebar, canvas, controls);
}

socket.addEventListener("open", () => {
  if (state.selectedId) {
    send({ type: "select", storyId: state.selectedId });
  }
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data)) as ServerMessage;
  switch (message.type) {
    case "stories":
      state.stories = message.stories;
      state.errors = message.errors;
      if (
        !state.selectedId ||
        !state.stories.some((story) => story.id === state.selectedId)
      ) {
        const first = state.stories[0];
        if (first) {
          selectStory(first.id);
          return;
        }
      } else if (state.selectedId) {
        const current = state.stories.find(
          (story) => story.id === state.selectedId,
        );
        if (current && Object.keys(state.args).length === 0) {
          state.args = { ...current.args };
        }
      }
      render();
      break;
    case "preview":
      if (message.storyId !== state.selectedId) {
        return;
      }
      state.pages = message.pages;
      state.lastGoodPages = message.pages;
      state.diagnostics = message.diagnostics;
      state.previewError = false;
      state.pageIndex = Math.min(
        state.pageIndex,
        Math.max(0, message.pages.length - 1),
      );
      render();
      break;
    case "preview-error":
      if (message.storyId !== state.selectedId) {
        return;
      }
      state.diagnostics = message.diagnostics;
      state.lastGoodPages = message.lastGoodPages;
      state.previewError = true;
      render();
      break;
    default: {
      const _exhaustive: never = message;
      return _exhaustive;
    }
  }
});

render();
