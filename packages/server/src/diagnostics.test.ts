import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDiagnosticLocation,
  missingFontFromDiagnostic,
  parseDiagnostics,
} from "./diagnostics.ts";

describe("parseDiagnostics", () => {
  it("parses short-format lines with file:line:col", () => {
    const [diag] = parseDiagnostics([
      "stories/callout.stories.typ:12:4: error: expected expression",
    ]);
    assert.equal(diag?.severity, "error");
    assert.equal(diag?.file, "stories/callout.stories.typ");
    assert.equal(diag?.line, 12);
    assert.equal(diag?.column, 4);
    assert.equal(diag?.message, "expected expression");
    assert.equal(formatDiagnosticLocation(diag!), "stories/callout.stories.typ:12:4");
  });

  it("parses human-format blocks and missing fonts", () => {
    const [diag] = parseDiagnostics([
      [
        "warning: unknown font family: bookk myungjo",
        "  ┌─ preview.typ:7:16",
        "  │",
        '7 │   set text(font: serif)',
        "  │                 ^^^^^",
      ].join("\n"),
    ]);
    assert.equal(diag?.severity, "warning");
    assert.equal(diag?.file, "preview.typ");
    assert.equal(diag?.line, 7);
    assert.equal(missingFontFromDiagnostic(diag!), "bookk myungjo");
  });

  it("attaches the compiling story id", () => {
    const [diag] = parseDiagnostics(["a.typ:1:1: warning: unused"], {
      storyId: "stories/a--demo",
    });
    assert.equal(diag?.storyId, "stories/a--demo");
  });
});
