import type { Diagnostic, FontReport } from "@/lib/diagnostics";
export type { Diagnostic, FontInfo, FontReport, FontStatus } from "@/lib/diagnostics";
export { EMPTY_FONTS, formatDiagnosticLocation, vscodeFileUrl } from "@/lib/diagnostics";

export type ControlType = "text" | "number" | "boolean" | "select" | "color" | "markup";

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

export type SnapshotCompare = {
  status: "match" | "new" | "changed";
  expected: string[] | null;
  actual: string[];
  diffPages: number[];
};

export type StoryCheckRun = {
  storyId: string;
  file: string;
  title: string;
  status: "pass" | "fail";
  assertions: AssertionResult[];
  diagnostics: string[];
  snapshot?: SnapshotCompare | null;
};

export type FileError = {
  file: string;
  message: string;
};

export type ServerMessage =
  | {
      type: "stories";
      stories: StoryIR[];
      errors: FileError[];
      tokens?: PackageToken[];
      fonts?: FontReport;
    }
  | {
      type: "preview";
      storyId: string;
      pages: string[];
      diagnostics: string[];
      problems?: Diagnostic[];
    }
  | {
      type: "preview-error";
      storyId: string;
      diagnostics: string[];
      problems?: Diagnostic[];
      lastGoodPages: string[];
    }
  | { type: "check-results"; results: StoryCheckRun[] }
  | { type: "fonts"; fonts: FontReport }
  | {
      type: "snapshot-accepted";
      storyId: string;
      ok: boolean;
      detail: string;
      result?: StoryCheckRun;
    };

export type ClientMessage =
  | { type: "select"; storyId: string }
  | { type: "set-args"; storyId: string; args: Record<string, unknown> }
  | { type: "set-viewport"; viewport: ViewportSpec | null }
  | { type: "run-checks"; storyId: string | null }
  | { type: "open-editor"; file: string; line?: number | null; column?: number | null }
  | { type: "accept-snapshot"; storyId: string };

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
