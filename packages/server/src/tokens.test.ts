import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  classifyToken,
  dedupeTokens,
  discoverPackageTokens,
  entrypointFromManifest,
  flattenTokenTree,
} from "./tokens.ts";
import { findTypstBinary } from "./typst.ts";

const demoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "examples", "demo-pkg");

describe("classifyToken", () => {
  it("recognizes colors, lengths, fonts, and skips functions", () => {
    assert.equal(classifyToken("palette.warning.border", 'rgb("#d97706")'), "color");
    assert.equal(classifyToken("space.inset", "12pt"), "length");
    assert.equal(classifyToken("fonts.body", "Libertinus Serif"), "font");
    assert.equal(classifyToken("callout", "callout"), null);
    assert.equal(classifyToken("scale", 1.25), "number");
  });
});

describe("flattenTokenTree", () => {
  it("flattens nested dictionaries and drops functions outside a tokens module", () => {
    const tokens = flattenTokenTree("src/lib.typ", {
      callout: "callout",
      "role-color": 'rgb("#555555")',
      note: "hello",
    });
    assert.deepEqual(
      tokens.map((token) => token.name),
      ["role-color"],
    );
  });

  it("keeps plain values from tokens.typ and prefers that module when deduping", () => {
    const tokens = dedupeTokens([
      ...flattenTokenTree("src/lib.typ", { palette: { info: 'rgb("#239dad")' } }),
      ...flattenTokenTree("src/tokens.typ", {
        palette: { info: 'rgb("#239dad")' },
        space: { inset: "12pt" },
      }),
    ]);
    assert.equal(tokens.find((token) => token.name === "palette.info")?.module, "src/tokens.typ");
    assert.equal(tokens.find((token) => token.name === "space.inset")?.kind, "length");
  });
});

describe("entrypointFromManifest", () => {
  it("reads the entrypoint string", () => {
    assert.equal(entrypointFromManifest('[package]\nentrypoint = "src/lib.typ"\n'), "src/lib.typ");
  });
});

describe("discoverPackageTokens", () => {
  it("reads demo-pkg colors, lengths, and fonts", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const tokens = await discoverPackageTokens(typst, demoRoot);
    const border = tokens.find((token) => token.name === "palette.warning.border");
    assert.equal(border?.kind, "color");
    assert.match(border?.value ?? "", /d97706/i);
    assert.ok(tokens.some((token) => token.kind === "length" && token.name === "space.inset"));
    assert.ok(tokens.some((token) => token.kind === "font"));
  });
});
