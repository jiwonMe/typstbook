import { spawn } from "node:child_process";
import { isAbsolute, resolve } from "node:path";

export type OpenEditorRequest = {
  file: string;
  line?: number | null;
  column?: number | null;
};

/**
 * Best-effort open in `$EDITOR` / `$VISUAL`. VS Code / Cursor understand
 * `path:line:column`; other editors get the path alone.
 */
export function openInEditor(
  packageRoot: string,
  request: OpenEditorRequest,
): { ok: boolean; detail: string } {
  const absolute = isAbsolute(request.file)
    ? request.file
    : resolve(packageRoot, request.file);
  const editor = process.env.TYPSTBOOK_EDITOR || process.env.VISUAL || process.env.EDITOR;
  if (!editor) {
    return {
      ok: false,
      detail: "Set $EDITOR, $VISUAL, or TYPSTBOOK_EDITOR to open files from Problems.",
    };
  }
  const target =
    request.line != null
      ? `${absolute}:${request.line}${request.column != null ? `:${request.column}` : ""}`
      : absolute;
  const child = spawn(editor, [target], {
    detached: true,
    stdio: "ignore",
    shell: false,
  });
  child.unref();
  child.on("error", () => {
    // Fire-and-forget; the UI already has a vscode:// fallback.
  });
  return { ok: true, detail: target };
}

/** Browser deep-link used when a local editor command is unavailable. */
export function vscodeFileUrl(
  packageRoot: string,
  request: OpenEditorRequest,
): string {
  const absolute = isAbsolute(request.file)
    ? request.file
    : resolve(packageRoot, request.file);
  const path = absolute.startsWith("/") ? absolute : `/${absolute}`;
  if (request.line != null) {
    return `vscode://file${path}:${request.line}${request.column != null ? `:${request.column}` : ""}`;
  }
  return `vscode://file${path}`;
}
