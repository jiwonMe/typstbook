export type ControlType = "text" | "number" | "boolean" | "select" | "color" | "markup";

export type DiagnosticSeverity = "error" | "warning";

export type Diagnostic = {
  severity: DiagnosticSeverity;
  message: string;
  file: string | null;
  line: number | null;
  column: number | null;
  storyId: string | null;
  raw: string;
};

export type FontStatus = "available" | "missing";

export type FontInfo = {
  family: string;
  status: FontStatus;
  sources: string[];
};

export type FontReport = {
  available: string[];
  referenced: FontInfo[];
  fontPaths: string[];
};

export type ArgType = {
  control: ControlType;
  options?: unknown[];
  min?: number;
  max?: number;
  step?: number;
};

/** JSON-serializable checks declared on `#story(checks: ...)`. */
export type StoryChecks = {
  /** Compare the default-args render to the committed SVG snapshot. */
  snapshot: boolean;
  /** Expected page count, or null when the story does not assert one. */
  pages: number | null;
  /** Expected first-page width, such as `105mm`, or null. */
  width: string | null;
  /** Expected first-page height, or null. */
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
  /** Verbatim `render:` source (falls back to the whole `#story(...)` call), or null if it could not be isolated. */
  source: string | null;
};

export type TokenKind = "color" | "length" | "font" | "number" | "string" | "boolean";

export type PackageToken = {
  /** Dotted path inside the module, such as `palette.warning.border`. */
  name: string;
  kind: TokenKind;
  /** Typst's JSON representation (`rgb("#d97706")`, `12pt`, a font name, …). */
  value: string;
  /** Package-relative module that exported the binding. */
  module: string;
};

/** Preview page override. `paper` is a Typst paper name; width/height are length strings. */
export type ViewportSpec = {
  paper?: string;
  width?: string;
  height?: string;
};

export type AssertionStatus = "pass" | "fail";

export type AssertionResult = {
  name: string;
  status: AssertionStatus;
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

export type ExtractResult = {
  stories: StoryIR[];
  errors: FileError[];
};

export type CompileRequest = {
  file: string;
  title: string;
  args: Record<string, unknown>;
  page: unknown;
  /** Preview-only page override. Omitted for snapshot checks and PDF export. */
  viewport?: ViewportSpec | null;
};

export type CompileResult = {
  pages: string[];
  diagnostics: string[];
};

export type ServerMessage =
  | {
      type: "stories";
      stories: StoryIR[];
      errors: FileError[];
      tokens: PackageToken[];
      fonts: FontReport;
    }
  | {
      type: "preview";
      storyId: string;
      pages: string[];
      diagnostics: string[];
      problems: Diagnostic[];
    }
  | {
      type: "preview-error";
      storyId: string;
      diagnostics: string[];
      problems: Diagnostic[];
      lastGoodPages: string[];
    }
  | { type: "check-results"; results: StoryCheckRun[] }
  | { type: "fonts"; fonts: FontReport };

export type ClientMessage =
  | { type: "select"; storyId: string }
  | { type: "set-args"; storyId: string; args: Record<string, unknown> }
  | { type: "set-viewport"; viewport: ViewportSpec | null }
  | { type: "run-checks"; storyId: string | null }
  | { type: "open-editor"; file: string; line?: number | null; column?: number | null };

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
  /** Base64-encoded PDF compiled with the story's default args, or null if that compile failed. */
  pdf: string | null;
};

export type StaticSiteData = {
  stories: StaticStory[];
  errors: FileError[];
  tokens: PackageToken[];
  fonts: FontReport;
  /** Checks evaluated against default args at build time. */
  checks: StoryCheckRun[];
};
