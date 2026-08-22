import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { initPackage, packageNameFromDir } from "./init.ts";

describe("packageNameFromDir", () => {
  it("kebab-cases and rejects leading digits", () => {
    assert.equal(packageNameFromDir("My Package"), "my-package");
    assert.equal(packageNameFromDir("123exam"), "pkg-123exam");
    assert.equal(packageNameFromDir("---"), "my-package");
    assert.equal(packageNameFromDir("kice-korean"), "kice-korean");
  });
});

describe("initPackage", () => {
  it("scaffolds a new package", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-init-"));
    const result = await initPackage(join(root, "Demo Pkg"));
    assert.deepEqual(result.created, [
      "typst.toml",
      "src/lib.typ",
      "preview.typ",
      "stories/hello.stories.typ",
    ]);
    assert.deepEqual(result.skipped, []);
    const toml = await readFile(join(result.root, "typst.toml"), "utf8");
    assert.match(toml, /name = "demo-pkg"/);
    const story = await readFile(join(result.root, "stories/hello.stories.typ"), "utf8");
    assert.match(story, /#import "\/src\/lib\.typ": callout/);
    assert.match(story, /#story\(/);
  });

  it("does not overwrite existing files", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-init-"));
    await writeFile(join(root, "typst.toml"), "[package]\nname = \"kept\"\n");
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src/lib.typ"), "#let kept() = []\n");
    const result = await initPackage(root);
    assert.equal(result.created.includes("typst.toml"), false);
    assert.equal(result.created.includes("src/lib.typ"), false);
    assert.ok(result.created.includes("preview.typ"));
    assert.ok(result.created.includes("stories/hello.stories.typ"));
    assert.equal(await readFile(join(root, "typst.toml"), "utf8"), "[package]\nname = \"kept\"\n");
    const story = await readFile(join(root, "stories/hello.stories.typ"), "utf8");
    assert.doesNotMatch(story, /callout/);
    assert.match(story, /Hello, typstbook/);
  });
});
