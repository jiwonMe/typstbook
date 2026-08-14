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
