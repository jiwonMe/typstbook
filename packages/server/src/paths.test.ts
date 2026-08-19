import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { isBuiltUi, resolveHelperPackageDir, resolveUiRoot } from "./paths.ts";

describe("resolveHelperPackageDir", () => {
  it("finds the monorepo Typst helper", () => {
    const dir = resolveHelperPackageDir();
    assert.equal(existsSync(join(dir, "typst.toml")), true);
    assert.equal(existsSync(join(dir, "src", "lib.typ")), true);
  });
});

describe("resolveUiRoot", () => {
  it("finds the monorepo Vite UI when running from source", () => {
    const dir = resolveUiRoot();
    assert.equal(existsSync(join(dir, "vite.config.ts")), true);
    assert.equal(isBuiltUi(dir), false);
  });
});
