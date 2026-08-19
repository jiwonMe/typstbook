import { watch } from "chokidar";
import { createServer } from "node:http";
import { extname, join, relative, resolve } from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import { extractAllStories, extractStoryFile } from "./extractor.ts";
import { invalidateFor } from "./invalidate.ts";
import { compileStory } from "./render.ts";
import type {
  ClientMessage,
  FileError,
  ServerMessage,
  StoryIR,
} from "./types.ts";
import { mergeStoryArgs, toPosix } from "./ir.ts";
import { isBuiltUi, resolveUiRoot } from "./paths.ts";
import { isPreviewPath } from "./preview.ts";
import { serveStatic } from "./static.ts";
import { ensureHelperPackagePath, requireTypstBinary } from "./typst.ts";

const WORKBENCH_WS_PATH = "/__typstbook_ws";

export type WorkbenchOptions = {
  packageRoot: string;
  port?: number;
};

export class Workbench {
  private readonly packageRoot: string;
  private readonly port: number;
  private typst = "";
  private packagePath = "";
  private stories: StoryIR[] = [];
  private errors: FileError[] = [];
  private readonly argsById = new Map<string, Record<string, unknown>>();
  private readonly lastGoodPages = new Map<string, string[]>();
  private selectedId: string | null = null;
  private readonly clients = new Set<WebSocket>();
  private compiling = false;
  private compileQueued = false;
  private compileTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly compileDebounceMs = 80;

  constructor(options: WorkbenchOptions) {
    this.packageRoot = resolve(options.packageRoot);
    this.port = options.port ?? 4400;
  }

  async start(): Promise<string> {
    this.typst = await requireTypstBinary();
    this.packagePath = await ensureHelperPackagePath();
    await this.reloadAll();

    const httpServer = createServer();
    const uiRoot = resolveUiRoot();
    if (isBuiltUi(uiRoot)) {
      httpServer.on("request", (req, res) => {
        serveStatic(uiRoot, req, res);
      });
    } else {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: uiRoot,
        configFile: join(uiRoot, "vite.config.ts"),
        server: {
          middlewareMode: true,
          // Keep Vite HMR off `/ws` — that path used to collide with our socket
          // and caused endless full-page reloads ("server connection lost").
          hmr: {
            server: httpServer,
            path: "/vite-hmr",
          },
        },
        appType: "spa",
      });
      httpServer.on("request", (req, res) => {
        vite.middlewares(req, res);
      });
    }

    const wss = new WebSocketServer({ noServer: true });
    httpServer.on("upgrade", (request, socket, head) => {
      const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
      if (pathname !== WORKBENCH_WS_PATH) {
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });

    wss.on("connection", (socket) => {
      this.clients.add(socket);
      this.send(socket, {
        type: "stories",
        stories: this.stories,
        errors: this.errors,
      });
      socket.on("message", (data) => {
        this.onClientMessage(String(data));
      });
      socket.on("close", () => {
        this.clients.delete(socket);
      });
    });

    this.watchFiles();

    await new Promise<void>((resolveListen) => {
      httpServer.listen(this.port, resolveListen);
    });
    return `http://127.0.0.1:${this.port}`;
  }

  private watchFiles(): void {
    const watcher = watch(this.packageRoot, {
      ignoreInitial: true,
      ignored: (path) =>
        path.includes("node_modules") ||
        path.includes(`${join(this.packageRoot, ".git")}`) ||
        path.includes("/.git/"),
    });

    const handle = (fullPath: string) => {
      const rel = toPosix(relative(this.packageRoot, fullPath));
      if (rel.startsWith("..")) {
        return;
      }
      const ext = extname(fullPath);
      const reason =
        rel === "typst.toml" ||
        rel.endsWith("/typst.toml") ||
        isPreviewPath(rel)
          ? "config"
          : rel.endsWith(".story.typ")
            ? "story-file"
            : ext === ".typ"
              ? "source"
              : null;
      if (!reason) {
        return;
      }
      void this.handleInvalidate(reason, rel);
    };

    watcher.on("add", handle);
    watcher.on("change", handle);
    watcher.on("unlink", handle);
  }

  private async handleInvalidate(
    reason: "story-file" | "source" | "config",
    file: string,
  ): Promise<void> {
    const action = invalidateFor(reason);
    switch (action) {
      case "compile":
        this.scheduleCompile();
        break;
      case "extract-file":
        await this.reloadFile(file);
        this.scheduleCompile();
        break;
      case "extract-all":
        await this.reloadAll();
        this.scheduleCompile();
        break;
      default: {
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  }

  private onClientMessage(raw: string): void {
    let message: ClientMessage;
    try {
      message = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }
    switch (message.type) {
      case "select":
        this.selectedId = message.storyId;
        {
          const story = this.stories.find((item) => item.id === message.storyId);
          if (story) {
            this.argsById.set(
              message.storyId,
              mergeStoryArgs(story.args, this.argsById.get(message.storyId)),
            );
          }
        }
        void this.scheduleCompile();
        break;
      case "set-args":
        this.argsById.set(message.storyId, message.args);
        if (this.selectedId === message.storyId) {
          void this.scheduleCompile();
        }
        break;
      default: {
        const _exhaustive: never = message;
        return _exhaustive;
      }
    }
  }

  private async reloadAll(): Promise<void> {
    const extracted = await extractAllStories({
      typst: this.typst,
      packageRoot: this.packageRoot,
      packagePath: this.packagePath,
    });
    this.stories = extracted.stories;
    this.errors = extracted.errors;
    this.syncArgs();
    this.broadcast({
      type: "stories",
      stories: this.stories,
      errors: this.errors,
    });
  }

  private async reloadFile(file: string): Promise<void> {
    if (!file.endsWith(".story.typ")) {
      await this.reloadAll();
      return;
    }
    const extracted = await extractStoryFile(
      {
        typst: this.typst,
        packageRoot: this.packageRoot,
        packagePath: this.packagePath,
      },
      file,
    );
    this.stories = [
      ...this.stories.filter((story) => story.file !== file),
      ...extracted.stories,
    ];
    this.errors = [
      ...this.errors.filter((error) => error.file !== file),
      ...extracted.errors,
    ];
    this.syncArgs();
    this.broadcast({
      type: "stories",
      stories: this.stories,
      errors: this.errors,
    });
  }

  private syncArgs(): void {
    const ids = new Set(this.stories.map((story) => story.id));
    for (const id of this.argsById.keys()) {
      if (!ids.has(id)) {
        this.argsById.delete(id);
        this.lastGoodPages.delete(id);
      }
    }
    for (const story of this.stories) {
      this.argsById.set(
        story.id,
        mergeStoryArgs(story.args, this.argsById.get(story.id)),
      );
    }
    if (this.selectedId && !ids.has(this.selectedId)) {
      this.selectedId = this.stories[0]?.id ?? null;
    }
  }

  private scheduleCompile(): void {
    if (this.compileTimer) {
      clearTimeout(this.compileTimer);
    }
    this.compileTimer = setTimeout(() => {
      this.compileTimer = null;
      void this.compileSelected();
    }, this.compileDebounceMs);
  }

  private async compileSelected(): Promise<void> {
    if (!this.selectedId) {
      return;
    }
    if (this.compiling) {
      this.compileQueued = true;
      return;
    }
    this.compiling = true;
    const storyId = this.selectedId;
    try {
      const story = this.stories.find((item) => item.id === storyId);
      if (!story) {
        this.broadcast({
          type: "preview-error",
          storyId,
          diagnostics: [`Unknown story: ${storyId}`],
          lastGoodPages: this.lastGoodPages.get(storyId) ?? [],
        });
        return;
      }
      const args = mergeStoryArgs(story.args, this.argsById.get(storyId));
      this.argsById.set(storyId, args);
      const compiled = await compileStory(
        {
          typst: this.typst,
          packageRoot: this.packageRoot,
          packagePath: this.packagePath,
        },
        {
          file: story.file,
          title: story.title,
          args,
          page: story.page,
        },
      );
      if (compiled.pages.length === 0) {
        this.broadcast({
          type: "preview-error",
          storyId,
          diagnostics: compiled.diagnostics,
          lastGoodPages: this.lastGoodPages.get(storyId) ?? [],
        });
        return;
      }
      this.lastGoodPages.set(storyId, compiled.pages);
      this.broadcast({
        type: "preview",
        storyId,
        pages: compiled.pages,
        diagnostics: compiled.diagnostics,
      });
    } finally {
      this.compiling = false;
      if (this.compileQueued) {
        this.compileQueued = false;
        void this.compileSelected();
      }
    }
  }

  private broadcast(message: ServerMessage): void {
    for (const client of this.clients) {
      this.send(client, message);
    }
  }

  private send(client: WebSocket, message: ServerMessage): void {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
