import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fontPathArgs, loadTypstbookConfig, parseTomlFontPaths } from "./config.ts";

describe("parseTomlFontPaths", () => {
  it("reads font-paths under [tool.typstbook]", () => {
    const paths = parseTomlFontPaths(`
[package]
name = "demo"

[tool.typstbook]
font-paths = ["fonts", "../shared"]
`);
    assert.deepEqual(paths, ["fonts", "../shared"]);
  });
});

describe("loadTypstbookConfig", () => {
  it("merges typst.toml and typstbook.config.json", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-config-"));
    await writeFile(
      join(root, "typst.toml"),
      `[package]\nname = "x"\n\n[tool.typstbook]\nfont-paths = ["fonts"]\n`,
      "utf8",
    );
    await writeFile(
      join(root, "typstbook.config.json"),
      JSON.stringify({ "font-paths": ["extra"] }),
      "utf8",
    );
    const config = await loadTypstbookConfig(root);
    assert.deepEqual(config.fontPaths, [join(root, "fonts"), join(root, "extra")]);
    assert.deepEqual(fontPathArgs(config.fontPaths), [
      "--font-path",
      join(root, "fonts"),
      "--font-path",
      join(root, "extra"),
    ]);
  });
});
