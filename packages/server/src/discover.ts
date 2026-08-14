import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { toPosix } from "./ir.ts";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".typst-packages",
  ".cursor",
]);

export async function discoverStoryFiles(root: string): Promise<string[]> {
  const found: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) {
          continue;
        }
        await walk(full);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".story.typ")) {
        found.push(toPosix(relative(root, full)));
      }
    }
  }

  await walk(root);
  found.sort();
  return found;
}
