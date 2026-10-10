import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { expandMatrix, parseMatrix } from "./matrix.ts";

describe("parseMatrix / expandMatrix", () => {
  it("expands a 2×2 variant matrix", () => {
    const matrix = parseMatrix({
      variant: ["info", "warning"],
      size: ["s", "l"],
    });
    const cells = expandMatrix(matrix);
    assert.equal(cells.length, 4);
    assert.equal(cells[0]?.label, "variant=info, size=s");
    assert.equal(cells[3]?.id, "variant=warning|size=l");
    assert.deepEqual(cells[2]?.args, { variant: "warning", size: "s" });
  });

  it("returns null for empty or invalid matrices", () => {
    assert.equal(parseMatrix(null), null);
    assert.equal(parseMatrix({ variant: [] }), null);
    assert.deepEqual(expandMatrix(null), []);
  });
});
