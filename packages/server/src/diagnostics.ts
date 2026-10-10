import { isAbsolute, relative, resolve } from "node:path";

export type DiagnosticSeverity = "error" | "warning";

export type Diagnostic = {
  severity: DiagnosticSeverity;
  message: string;
  /** Package-relative path when it can be resolved, otherwise the path Typst printed. */
  file: string | null;
  line: number | null;
  column: number | null;
  /** Story that was compiling when this diagnostic was produced, if any. */
  storyId: string | null;
  raw: string;
};

const SHORT_LINE =
  /^(?<file>.+?):(?<line>\d+):(?<column>\d+):\s*(?<severity>error|warning):\s*(?<message>.+)$/i;
const HUMAN_HEAD = /^(?<severity>error|warning):\s*(?<message>.+)$/i;
const HUMAN_LOC = /^\s*[┌├└│].*?─\s*(?<file>.+?):(?<line>\d+):(?<column>\d+)\s*$/;
const FONT_FAMILY = /unknown font family:\s*(.+)$/i;

/** Parse Typst `--diagnostic-format short` lines, with a human-format fallback. */
export function parseDiagnostics(
  texts: string[],
  options: { storyId?: string | null; packageRoot?: string | null } = {},
): Diagnostic[] {
  const out: Diagnostic[] = [];
  for (const text of texts) {
    for (const block of splitDiagnosticBlocks(text)) {
      const parsed = parseOne(block, options.storyId ?? null);
      if (parsed) {
        out.push(relocate(parsed, options.packageRoot ?? null));
      }
    }
  }
  return out;
}

export function splitDiagnosticBlocks(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  const lines = trimmed.split(/\r?\n/);
  if (lines.every((line) => SHORT_LINE.test(line) || line.trim() === "")) {
    return lines.map((line) => line.trim()).filter(Boolean);
  }
  const blocks: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (HUMAN_HEAD.test(line) && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [line];
      continue;
    }
    current.push(line);
  }
  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }
  return blocks;
}

function parseOne(raw: string, storyId: string | null): Diagnostic | null {
  const short = raw.match(SHORT_LINE);
  if (short?.groups) {
    return {
      severity: short.groups.severity.toLowerCase() as DiagnosticSeverity,
      message: short.groups.message.trim(),
      file: short.groups.file,
      line: Number(short.groups.line),
      column: Number(short.groups.column),
      storyId,
      raw,
    };
  }
  const lines = raw.split(/\r?\n/);
  const head = lines[0]?.match(HUMAN_HEAD);
  if (!head?.groups) {
    return {
      severity: /warning/i.test(raw) ? "warning" : "error",
      message: raw.trim(),
      file: null,
      line: null,
      column: null,
      storyId,
      raw,
    };
  }
  let file: string | null = null;
  let line: number | null = null;
  let column: number | null = null;
  for (const item of lines.slice(1)) {
    const loc = item.match(HUMAN_LOC);
    if (loc?.groups) {
      file = loc.groups.file;
      line = Number(loc.groups.line);
      column = Number(loc.groups.column);
      break;
    }
  }
  return {
    severity: head.groups.severity.toLowerCase() as DiagnosticSeverity,
    message: head.groups.message.trim(),
    file,
    line,
    column,
    storyId,
    raw,
  };
}

function relocate(diag: Diagnostic, packageRoot: string | null): Diagnostic {
  if (!diag.file || !packageRoot) {
    return diag;
  }
  try {
    const absolute = isAbsolute(diag.file) ? diag.file : resolve(process.cwd(), diag.file);
    const rel = relative(packageRoot, absolute).split("\\").join("/");
    if (rel && !rel.startsWith("..")) {
      return { ...diag, file: rel };
    }
  } catch {
    // Keep Typst's original path.
  }
  return diag;
}

export function missingFontFromDiagnostic(diag: Diagnostic): string | null {
  const match = diag.message.match(FONT_FAMILY);
  return match?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null;
}

/** Prefer short one-liners so the UI can list file:line:col cleanly. */
export function formatDiagnosticLocation(diag: Diagnostic): string {
  if (diag.file && diag.line != null && diag.column != null) {
    return `${diag.file}:${diag.line}:${diag.column}`;
  }
  if (diag.file) {
    return diag.file;
  }
  return "(unknown)";
}
