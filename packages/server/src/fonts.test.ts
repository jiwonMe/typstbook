import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFontReport, extractFontReferences } from "./fonts.ts";

describe("extractFontReferences", () => {
  it("reads string, tuple, and named fallback stacks", () => {
    const fonts = extractFontReferences(`
#let sans = ("Toss Product Sans", "sans-serif")
#let serif = ("Bookk Myungjo", "Times New Roman")
#set text(font: "Inter")
#set text(font: ("JetBrains Mono", "monospace"))
`);
    assert.deepEqual(
      fonts.sort(),
      [
        "Bookk Myungjo",
        "Inter",
        "JetBrains Mono",
        "Times New Roman",
        "Toss Product Sans",
        "monospace",
        "sans-serif",
      ].sort(),
    );
  });
});

describe("buildFontReport", () => {
  it("marks referenced families missing when not installed", () => {
    const report = buildFontReport(
      ["Inter", "Liberation Sans"],
      new Map([
        ["Inter", ["preview.typ"]],
        ["Bookk Myungjo", ["preview.typ"]],
      ]),
      [{ name: "serif", kind: "font", value: '"Bookk Myungjo"', module: "src/tokens.typ" }],
      [],
      ["/fonts"],
    );
    assert.equal(report.referenced[0]?.family, "Bookk Myungjo");
    assert.equal(report.referenced[0]?.status, "missing");
    assert.equal(report.referenced.find((item) => item.family === "Inter")?.status, "available");
    assert.deepEqual(report.fontPaths, ["/fonts"]);
  });
});
