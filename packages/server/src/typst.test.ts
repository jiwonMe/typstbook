import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ensureHelperPackagePath,
  parseTypstVersion,
} from "./typst.ts";

describe("parseTypstVersion", () => {
  it("parses typst --version output", () => {
    assert.deepEqual(parseTypstVersion("typst 0.15.1 (unknown commit)"), {
      major: 0,
      minor: 15,
    });
    assert.equal(parseTypstVersion("not a version"), null);
  });
});

describe("ensureHelperPackagePath", () => {
  it("installs @preview/typstbook into the Typst package cache", async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), "typstbook-cache-"));
    await ensureHelperPackagePath({ cacheDir });
    const dest = join(cacheDir, "preview", "typstbook", "0.1.0", "typst.toml");
    assert.equal(existsSync(dest), true, `expected helper at ${dest}`);
  });
});
