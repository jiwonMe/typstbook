import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  argsFromDocs,
  detectStoryFunction,
  enrichStoryWithDocs,
  parseFunctionDocs,
  parseSignatureParams,
  parseTidyComment,
} from "./autodocs.ts";

const SAMPLE = `
/// A bordered callout for notes.
///
/// - title (str): Heading shown above the body.
/// - variant (str): Visual tone.
/// - body (content): Main message.
/// -> content
#let callout(title: "Note", variant: "info", body) = {
  body
}

#let bare(x) = x
`;

describe("parseTidyComment", () => {
  it("reads description, params, and return type", () => {
    const parsed = parseTidyComment(
      "A bordered callout.\n\n- title (str): Heading.\n-> content",
    );
    assert.equal(parsed.description, "A bordered callout.");
    assert.equal(parsed.returnType, "content");
    assert.equal(parsed.params.get("title"), "Heading.");
    assert.equal(parsed.types.get("title"), "str");
  });
});

describe("parseSignatureParams", () => {
  it("keeps named defaults and positional content params", () => {
    const params = parseSignatureParams('title: "Note", variant: "info", body');
    assert.equal(params.length, 3);
    assert.equal(params[0]?.default, '"Note"');
    assert.equal(params[2]?.positional, true);
    assert.equal(params[2]?.type, "content");
  });
});

describe("parseFunctionDocs", () => {
  it("attaches tidy comments to #let functions", () => {
    const docs = parseFunctionDocs(SAMPLE, "src/lib.typ");
    assert.equal(docs.length, 2);
    assert.equal(docs[0]?.name, "callout");
    assert.equal(docs[0]?.params.find((p) => p.name === "title")?.description, "Heading shown above the body.");
    assert.equal(docs[0]?.returnType, "content");
  });
});

describe("enrichStoryWithDocs", () => {
  it("detects the story function and fills omitted args", () => {
    const docs = parseFunctionDocs(SAMPLE);
    const source = "(args) => {\n    callout(title: args.title, variant: args.variant, args.body)\n  }";
    assert.equal(detectStoryFunction(source, docs)?.name, "callout");
    const enriched = enrichStoryWithDocs(
      { args: {}, argTypes: {}, source },
      docs,
    );
    assert.equal(enriched.docs?.name, "callout");
    assert.equal(enriched.args.title, "Note");
    assert.equal(enriched.args.variant, "info");
    assert.equal(enriched.argTypes.body?.control, "markup");
    const generated = argsFromDocs(docs[0]!);
    assert.equal(generated.args.title, "Note");
  });
});
