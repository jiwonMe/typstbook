import assert from "node:assert/strict";
import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { runCheck } from "./check.ts";
import { snapshotDirFor } from "./snapshot.ts";
import { ensureHelperPackagePath, findTypstBinary } from "./typst.ts";

const examplesRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "examples",
);

async function copyDemoPkg(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "typstbook-check-"));
  await cp(join(examplesRoot, "demo-pkg"), root, { recursive: true });
  // demo-pkg carries committed baseline snapshots; start each test from a
  // clean slate regardless of what is checked in.
  await rm(join(root, "__snapshots__"), { recursive: true, force: true });
  return root;
}

describe("runCheck", () => {
  it("reports every story as new when no snapshots exist", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const root = await copyDemoPkg();
    try {
      const report = await runCheck({
        typst,
        packageRoot: root,
        packagePath: await ensureHelperPackagePath(),
        update: false,
      });
      assert.equal(report.fileErrors.length, 0);
      assert.equal(report.results.length, 6);
      assert.ok(report.results.every((r) => r.status === "new"));
      assert.equal(report.ok, false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("writes snapshots with update and then matches on rerun", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const root = await copyDemoPkg();
    try {
      const packagePath = await ensureHelperPackagePath();
      const updateReport = await runCheck({
        typst,
        packageRoot: root,
        packagePath,
        update: true,
      });
      assert.equal(updateReport.ok, true);
      assert.ok(updateReport.results.every((r) => r.status === "new"));

      const checkReport = await runCheck({
        typst,
        packageRoot: root,
        packagePath,
        update: false,
      });
      assert.equal(checkReport.ok, true);
      assert.ok(checkReport.results.every((r) => r.status === "match"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("flags a story as changed when its stored snapshot no longer matches", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const root = await copyDemoPkg();
    try {
      const packagePath = await ensureHelperPackagePath();
      await runCheck({ typst, packageRoot: root, packagePath, update: true });

      const staleDir = snapshotDirFor(root, "stories/callout--warning");
      await writeFile(join(staleDir, "page-001.svg"), "<svg>stale</svg>", "utf8");

      const report = await runCheck({
        typst,
        packageRoot: root,
        packagePath,
        update: false,
      });
      assert.equal(report.ok, false);
      const changed = report.results.find(
        (r) => r.storyId === "stories/callout--warning",
      );
      assert.equal(changed?.status, "changed");
      assert.deepEqual(changed?.diffPages, [1]);
      const others = report.results.filter(
        (r) => r.storyId !== "stories/callout--warning",
      );
      assert.ok(others.every((r) => r.status === "match"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
