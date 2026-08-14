import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseTypstVersion } from "./typst.ts";

describe("parseTypstVersion", () => {
  it("parses typst --version output", () => {
    assert.deepEqual(parseTypstVersion("typst 0.15.1 (unknown commit)"), {
      major: 0,
      minor: 15,
    });
    assert.equal(parseTypstVersion("not a version"), null);
  });
});
