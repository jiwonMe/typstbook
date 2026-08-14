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

export function previewIncludeLine(includePreview: boolean): string {
  return includePreview ? `#include "/${PREVIEW_FILE}"\n` : "";
}

export function isPreviewPath(relativePosix: string): boolean {
  return relativePosix === PREVIEW_FILE;
}
