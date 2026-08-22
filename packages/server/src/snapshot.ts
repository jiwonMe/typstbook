import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const SNAPSHOT_DIR_NAME = "__snapshots__";

export type SnapshotDiffStatus = "match" | "new" | "changed";

export type SnapshotDiff = {
  status: SnapshotDiffStatus;
  diffPages: number[];
};

export function snapshotDirFor(packageRoot: string, storyId: string): string {
  return join(packageRoot, SNAPSHOT_DIR_NAME, ...storyId.split("/"));
}

function pageFileName(index: number): string {
  return `page-${String(index + 1).padStart(3, "0")}.svg`;
}

export async function readSnapshotPages(dir: string): Promise<string[] | null> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return null;
  }
  const svgNames = names
    .filter((name) => name.endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (svgNames.length === 0) {
    return null;
  }
  return Promise.all(svgNames.map((name) => readFile(join(dir, name), "utf8")));
}

export async function writeSnapshotPages(
  dir: string,
  pages: string[],
): Promise<void> {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await Promise.all(
    pages.map((svg, index) => writeFile(join(dir, pageFileName(index)), svg, "utf8")),
  );
}

/** `expected` is `null` when no snapshot has been written yet. */
export function diffSnapshot(
  expected: string[] | null,
  actual: string[],
): SnapshotDiff {
  if (expected === null) {
    return { status: "new", diffPages: [] };
  }
  const diffPages: number[] = [];
  const max = Math.max(expected.length, actual.length);
  for (let i = 0; i < max; i++) {
    if (expected[i] !== actual[i]) {
      diffPages.push(i + 1);
    }
  }
  return { status: diffPages.length === 0 ? "match" : "changed", diffPages };
}
