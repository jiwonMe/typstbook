export type ControlType = "text" | "number" | "boolean" | "select" | "color";

export type ArgType = {
  control: ControlType;
  options?: unknown[];
};

export type StoryIR = {
  id: string;
  file: string;
  title: string;
  description: string | null;
  args: Record<string, unknown>;
  argTypes: Record<string, ArgType>;
  page: unknown;
  /** Verbatim `render:` source (falls back to the whole `#story(...)` call), or null if it could not be isolated. */
  source: string | null;
};

export type FileError = {
  file: string;
  message: string;
};

export type ExtractResult = {
  stories: StoryIR[];
  errors: FileError[];
};

export type CompileRequest = {
  file: string;
  title: string;
  args: Record<string, unknown>;
  page: unknown;
};

export type CompileResult = {
  pages: string[];
  diagnostics: string[];
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

export type InvalidateReason = "args" | "story-file" | "source" | "config";

export type InvalidateAction = "compile" | "extract-file" | "extract-all";

export type StorySnapshotStatus = "match" | "new" | "changed" | "compile-error";

export type StoryCheckResult = {
  storyId: string;
  file: string;
  title: string;
  status: StorySnapshotStatus;
  diagnostics: string[];
  diffPages: number[];
};

export type CheckReport = {
  fileErrors: FileError[];
  results: StoryCheckResult[];
  update: boolean;
  ok: boolean;
};

export type StaticStory = StoryIR & {
  pages: string[];
  diagnostics: string[];
};

export type StaticSiteData = {
  stories: StaticStory[];
  errors: FileError[];
};
