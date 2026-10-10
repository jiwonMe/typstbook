import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { acceptStorySnapshot, runStoryChecks } from "./checks.ts";
import { readSnapshotPages, snapshotDirFor, writeSnapshotPages } from "./snapshot.ts";
import { ensureHelperPackagePath, findTypstBinary } from "./typst.ts";
import type { StoryIR } from "./types.ts";

async function scaffoldStory(): Promise<{ root: string; story: StoryIR }> {
  const root = await mkdtemp(join(tmpdir(), "typstbook-accept-"));
  await mkdir(join(root, "src"), { recursive: true });
  await mkdir(join(root, "stories"), { recursive: true });
  await writeFile(
    join(root, "typst.toml"),
    `[package]\nname = "accept-demo"\nversion = "0.1.0"\nentrypoint = "src/lib.typ"\n`,
    "utf8",
  );
  await writeFile(join(root, "src", "lib.typ"), "#let mark(label) = text(label)\n", "utf8");
  await writeFile(
    join(root, "stories", "mark.stories.typ"),
    `#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": mark

#story(
  title: "Mark",
  args: (label: "alpha"),
  arg-types: (label: (control: "text")),
  page: (width: 80pt, height: 40pt, margin: 4pt),
  checks: (snapshot: true),
  render: (args) => mark(args.label),
)
`,
    "utf8",
  );
  const story: StoryIR = {
    id: "stories/mark--mark",
    file: "stories/mark.stories.typ",
    title: "Mark",
    description: null,
    args: { label: "alpha" },
    argTypes: { label: { control: "text" } },
    page: { width: "80pt", height: "40pt", margin: "4pt" },
    checks: { snapshot: true, pages: null, width: null, height: null },
    source: null,
    docs: null,
    matrix: null,
    matrixCells: [],
  };
  return { root, story };
}

describe("acceptStorySnapshot", () => {
  it("writes a baseline and clears a prior mismatch", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const { root, story } = await scaffoldStory();
    const options = {
      typst,
      packageRoot: root,
      packagePath: await ensureHelperPackagePath(),
    };
    try {
      const first = await runStoryChecks(options, story);
      assert.equal(first.snapshot?.status, "new");
      const accepted = await acceptStorySnapshot(options, story);
      assert.equal(accepted.status, "pass");
      assert.equal(accepted.snapshot?.status, "match");
      const pages = await readSnapshotPages(snapshotDirFor(root, story.id));
      assert.equal(pages?.length, 1);

      await writeSnapshotPages(snapshotDirFor(root, story.id), ["<svg></svg>"]);
      const drifted = await runStoryChecks(options, story);
      assert.equal(drifted.snapshot?.status, "changed");
      const fixed = await acceptStorySnapshot(options, story);
      assert.equal(fixed.snapshot?.status, "match");
      const baseline = await readFile(join(snapshotDirFor(root, story.id), "page-001.svg"), "utf8");
      assert.match(baseline, /<svg/i);
      assert.notEqual(baseline, "<svg></svg>");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
