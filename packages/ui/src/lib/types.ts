export type ControlType = "text" | "number" | "boolean" | "select" | "color";

export type ArgType = {
  control: ControlType;
  options?: unknown[];
};

export type StoryIR = {
  id: string;
  file: string;
  title: string;
  args: Record<string, unknown>;
  argTypes: Record<string, ArgType>;
  page: unknown;
};

export type FileError = {
  file: string;
  message: string;
};

export type ServerMessage =
  | { type: "stories"; stories: StoryIR[]; errors: FileError[] }
  | { type: "preview"; storyId: string; pages: string[]; diagnostics: string[] }
  | {
      type: "preview-error";
      storyId: string;
      diagnostics: string[];
      lastGoodPages: string[];
    };

export type ClientMessage =
  | { type: "select"; storyId: string }
  | { type: "set-args"; storyId: string; args: Record<string, unknown> };

export function mergeStoryArgs(
  defaults: Record<string, unknown>,
  current: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (Object.prototype.hasOwnProperty.call(current, key)) {
      merged[key] = current[key];
    }
  }
  return merged;
}

export function shortPath(file: string): string {
  return file.replace(/\.story\.typ$/i, "").replace(/^stories\//, "");
}

export function groupStories(stories: StoryIR[]): Map<string, StoryIR[]> {
  const groups = new Map<string, StoryIR[]>();
  for (const story of stories) {
    const list = groups.get(story.file) ?? [];
    list.push(story);
    groups.set(story.file, list);
  }
  return groups;
}
