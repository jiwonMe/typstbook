import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateChecks, lengthToPt, parseChecks, svgPageSize } from "./checks.ts";

const PAGE = `<svg width="297.637795276pt" height="419.527559055pt"></svg>`;

describe("parseChecks", () => {
  it("reads snapshot, page count, and lengths", () => {
    assert.deepEqual(parseChecks({ snapshot: true, pages: 1, width: "105mm", height: "148mm" }), {
      snapshot: true,
      pages: 1,
      width: "105mm",
      height: "148mm",
    });
  });

  it("drops lengths that are not Typst units and treats a missing snapshot as enabled", () => {
    assert.deepEqual(parseChecks({ pages: 2, width: "wide" }), {
      snapshot: true,
      pages: 2,
      width: null,
      height: null,
    });
    assert.equal(parseChecks(null), null);
  });
});

describe("lengthToPt", () => {
  it("converts mm and pt", () => {
    assert.equal(lengthToPt("12pt"), 12);
    assert.ok(Math.abs((lengthToPt("105mm") ?? 0) - 297.6378) < 0.01);
    assert.equal(lengthToPt("nope"), null);
  });
});

describe("evaluateChecks", () => {
  it("passes a snapshot, page count, and A6 size", () => {
    const results = evaluateChecks({
      checks: { snapshot: true, pages: 1, width: "105mm", height: "148mm" },
      pages: [PAGE],
      diagnostics: [],
      expected: [PAGE],
    });
    assert.deepEqual(
      results.map((item) => item.status),
      ["pass", "pass", "pass", "pass"],
    );
    assert.equal(svgPageSize(PAGE)?.width, "297.637795276pt");
  });

  it("fails when the snapshot or the page count disagrees", () => {
    const results = evaluateChecks({
      checks: { snapshot: true, pages: 2, width: null, height: null },
      pages: [PAGE],
      diagnostics: [],
      expected: ["<svg width=\"1pt\" height=\"1pt\"></svg>"],
    });
    assert.equal(results[0]?.status, "fail");
    assert.match(results[0]?.detail ?? "", /Page 1/);
    assert.equal(results[1]?.status, "fail");
    assert.match(results[1]?.detail ?? "", /Expected 2/);
  });

  it("reports a missing snapshot and a compile failure", () => {
    const missing = evaluateChecks({
      checks: null,
      pages: [PAGE],
      diagnostics: [],
      expected: null,
    });
    assert.equal(missing[0]?.name, "Snapshot");
    assert.equal(missing[0]?.status, "fail");

    const failed = evaluateChecks({
      checks: null,
      pages: [],
      diagnostics: ["error: boom"],
      expected: null,
    });
    assert.equal(failed.length, 1);
    assert.match(failed[0]?.detail ?? "", /boom/);
  });
});
