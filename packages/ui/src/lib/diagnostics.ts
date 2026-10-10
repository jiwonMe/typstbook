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

export const EMPTY_FONTS: FontReport = {
  available: [],
  referenced: [],
  fontPaths: [],
};

export function formatDiagnosticLocation(diag: Diagnostic): string {
  if (diag.file && diag.line != null && diag.column != null) {
    return `${diag.file}:${diag.line}:${diag.column}`;
  }
  if (diag.file) {
    return diag.file;
  }
  return "(unknown)";
}

export function vscodeFileUrl(
  file: string,
  line?: number | null,
  column?: number | null,
): string {
  const path = file.startsWith("/") ? file : `/${file}`;
  if (line != null) {
    return `vscode://file${path}:${line}${column != null ? `:${column}` : ""}`;
  }
  return `vscode://file${path}`;
}
