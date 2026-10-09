export type ControlType = "text" | "number" | "boolean" | "select" | "color";

export type ArgType = {
  control: ControlType;
  options?: unknown[];
  min?: number;
  max?: number;
  step?: number;
};

export type StoryChecks = {
  snapshot: boolean;
  pages: number | null;
  width: string | null;
  height: string | null;
};

export type StoryIR = {
  id: string;
  file: string;
  title: string;
  description: string | null;
  args: Record<string, unknown>;
  argTypes: Record<string, ArgType>;
  page: unknown;
  checks: StoryChecks | null;
  source: string | null;
};

export type TokenKind = "color" | "length" | "font" | "number" | "string" | "boolean";

export type PackageToken = {
  name: string;
  kind: TokenKind;
  value: string;
  module: string;
};

export type ViewportSpec = {
  paper?: string;
  width?: string;
  height?: string;
};

export type AssertionResult = {
  name: string;
  status: "pass" | "fail";
  detail: string;
};

export type StoryCheckRun = {
  storyId: string;
  file: string;
  title: string;
  status: "pass" | "fail";
  assertions: AssertionResult[];
  diagnostics: string[];
};

export type FileError = {
  file: string;
  message: string;
};

export type ServerMessage =
  | { type: "stories"; stories: StoryIR[]; errors: FileError[]; tokens?: PackageToken[] }
  | { type: "preview"; storyId: string; pages: string[]; diagnostics: string[] }
  | {
      type: "preview-error";
      storyId: string;
      diagnostics: string[];
      lastGoodPages: string[];
    }
  | { type: "check-results"; results: StoryCheckRun[] };

export type ClientMessage =
  | { type: "select"; storyId: string }
  | { type: "set-args"; storyId: string; args: Record<string, unknown> }
  | { type: "set-viewport"; viewport: ViewportSpec | null }
  | { type: "run-checks"; storyId: string | null };

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
  return file.replace(/\.stories\.typ$/i, "").replace(/^stories\//, "");
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
