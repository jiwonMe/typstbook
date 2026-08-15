import { access } from "node:fs/promises";
import { join } from "node:path";

export const PREVIEW_FILE = "preview.typ";

export async function hasPreviewFile(packageRoot: string): Promise<boolean> {
  try {
    await access(join(packageRoot, PREVIEW_FILE));
    return true;
  } catch {
    return false;
  }
}

/** Typst `#include` set rules do not leak to later content; wrap via `#show: preview`. */
export function previewSetupSource(includePreview: boolean): string {
  if (!includePreview) {
    return "";
  }
  return `#import "/${PREVIEW_FILE}": preview
#show: preview
`;
}

export function isPreviewPath(relativePosix: string): boolean {
  return relativePosix === PREVIEW_FILE;
}
