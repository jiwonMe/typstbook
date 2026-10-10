import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { CompileResult } from "./types.ts";
import { findTypstBinary } from "./typst.ts";
import { selectFreshNames, TypstPreviewWatch, watchDiagnostics } from "./watch-preview.ts";

describe("watchDiagnostics", () => {
  it("drops watch status and keeps warnings", () => {
    assert.deepEqual(
      watchDiagnostics("watching file.typ\nwriting to out.svg\n\n[12:00:00] compiled successfully in 1 ms\n"),
      [],
    );
    const warnings = watchDiagnostics("warning: unknown font family: bookk\n  ┌─ story.typ:1:0\n");
    assert.match(warnings[0] ?? "", /unknown font family/);
  });

  it("keeps short-format diagnostics as separate lines", () => {
    assert.deepEqual(
      watchDiagnostics(
        "watching wrapper.typ\npreview.typ:7:16: warning: unknown font family: bookk\nstories/a.typ:2:1: error: expected expression\n",
      ),
      [
        "preview.typ:7:16: warning: unknown font family: bookk",
        "stories/a.typ:2:1: error: expected expression",
      ],
    );
  });
});

describe("selectFreshNames", () => {
  it("drops a page that the latest compile did not rewrite", () => {
    const names = selectFreshNames(
      new Map([
        ["page-1.svg", { mtimeMs: 10, size: 4 }],
        ["page-2.svg", { mtimeMs: 10, size: 4 }],
      ]),
      [
        { name: "page-1.svg", mtimeMs: 20, size: 5 },
        { name: "page-2.svg", mtimeMs: 10, size: 4 },
      ],
    );
    assert.deepEqual(names, ["page-1.svg"]);
  });

  it("keeps every page when the compiler did not touch the files", () => {
    const names = selectFreshNames(
      new Map([["page-1.svg", { mtimeMs: 10, size: 4 }]]),
      [{ name: "page-1.svg", mtimeMs: 10, size: 4 }],
    );
    assert.deepEqual(names, ["page-1.svg"]);
  });
});

async function waitFor(
  updates: CompileResult[],
  predicate: (result: CompileResult) => boolean,
): Promise<CompileResult> {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const found = updates.find(predicate);
    if (found) {
      return found;
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`timed out waiting for a preview update (${updates.length} received)`);
}

describe("TypstPreviewWatch", () => {
  it("recompiles in one process and drops a stale later page", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const root = await mkdtemp(join(tmpdir(), "typstbook-watch-pkg-"));
    await writeFile(join(root, "body.typ"), "Hello\n", "utf8");
    const watch = new TypstPreviewWatch({ typst, packageRoot: root, packagePath: root });
    const updates: CompileResult[] = [];
    watch.onUpdate = (result) => updates.push(result);
    try {
      await watch.push("#set page(width: 80pt, height: 40pt)\n#include \"/body.typ\"\n#pagebreak()\nSecond\n");
      const two = await waitFor(updates, (result) => result.pages.length === 2 && result.pages[0]?.includes('width="80pt"'));
      assert.equal(two.pages.length, 2);
      const pid = watch.pid;
      assert.ok(pid);

      await watch.push("#set page(width: 90pt, height: 30pt)\n#include \"/body.typ\"\nOnly\n");
      const one = await waitFor(
        updates,
        (result) => result.pages.length === 1 && /width="90(?:\.0+)?pt"/.test(result.pages[0] ?? ""),
      );
      assert.equal(one.pages.length, 1);
      assert.equal(watch.pid, pid);

      const beforeNudge = updates.length;
      await writeFile(join(root, "body.typ"), "Changed\n", "utf8");
      await watch.nudge();
      const deadline = Date.now() + 15000;
      while (updates.length <= beforeNudge && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      assert.ok(updates.length > beforeNudge, "a dependency nudge should compile again");
      assert.equal(updates.at(-1)?.pages.length, 1);
      assert.equal(watch.pid, pid);
    } finally {
      await watch.stop();
    }
  });
});
