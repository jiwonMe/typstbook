import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { extractStorySnippets } from "./source-extract.ts";
import { substituteArgs, typstLiteral } from "./snippet.ts";

const examplesRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "examples",
);

describe("typstLiteral", () => {
  it("quotes strings and escapes special characters", () => {
    assert.equal(typstLiteral("hi"), '"hi"');
    assert.equal(typstLiteral('a "quote"'), '"a \\"quote\\""');
    assert.equal(typstLiteral("line\nbreak"), '"line\\nbreak"');
  });

  it("renders numbers and booleans bare", () => {
    assert.equal(typstLiteral(23), "23");
    assert.equal(typstLiteral(true), "true");
    assert.equal(typstLiteral(false), "false");
  });

  it("renders null/undefined as none", () => {
    assert.equal(typstLiteral(null), "none");
    assert.equal(typstLiteral(undefined), "none");
  });

  it("renders a color-controlled string as rgb(...)", () => {
    assert.equal(typstLiteral("#239DAD", "color"), 'rgb("#239DAD")');
  });

  it("renders arrays, with a trailing comma for a single element", () => {
    assert.equal(typstLiteral([1, 2, 3]), "(1, 2, 3)");
    assert.equal(typstLiteral([1]), "(1,)");
    assert.equal(typstLiteral([]), "()");
  });

  it("renders dictionaries, quoting non-identifier keys", () => {
    assert.equal(typstLiteral({ a: 1, b: "x" }), '(a: 1, b: "x")');
    assert.equal(typstLiteral({ "weird key": 1 }), '("weird key": 1)');
    assert.equal(typstLiteral({}), "(:)");
  });
});

describe("substituteArgs", () => {
  it("replaces args.foo dot-access with a live literal", () => {
    const result = substituteArgs("callout(title: args.title)", { title: "Hi" }, {});
    assert.equal(result, 'callout(title: "Hi")');
  });

  it("replaces args.at(\"foo\") for hyphenated keys", () => {
    const result = substituteArgs(
      'set text(size: args.at("font-size"))',
      { "font-size": 12 },
      {},
    );
    assert.equal(result, "set text(size: 12)");
  });

  it("leaves unknown keys untouched", () => {
    const result = substituteArgs("f(args.missing)", {}, {});
    assert.equal(result, "f(args.missing)");
  });

  it("substitutes the real callout Warning snippet end-to-end", async () => {
    const text = await readFile(
      join(examplesRoot, "demo-pkg", "stories", "callout.stories.typ"),
      "utf8",
    );
    const snippet = extractStorySnippets(text).get("Warning");
    assert.ok(snippet);
    const result = substituteArgs(
      snippet ?? "",
      { title: "커스텀", variant: "error" },
      { variant: { control: "select", options: ["info", "warning", "error"] } },
    );
    assert.match(result, /callout\(title: "커스텀", variant: "error"\)/);
  });

  it("substitutes the real numbered-equation snippet's args.at(...) usage", async () => {
    const text = await readFile(
      join(examplesRoot, "demo-pkg", "stories", "math.stories.typ"),
      "utf8",
    );
    const snippet = extractStorySnippets(text).get("Numbered equation");
    assert.ok(snippet);
    const result = substituteArgs(
      snippet ?? "",
      { "show-number": false },
      { "show-number": { control: "boolean" } },
    );
    assert.match(result, /numbering: if false \{ "\(1\)" \} else \{ none \}/);
  });
});
