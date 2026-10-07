import assert from "node:assert/strict";
import { test } from "node:test";
import { fitZoom, MIN_ZOOM, MAX_ZOOM } from "./preview-fit";

test("width fit follows available width without limiting tall documents", () => {
  assert.equal(fitZoom("width", 600, 300, 800, 2400), 0.75);
  assert.equal(fitZoom("width", 400, 300, 800, 2400), 0.5);
});
test("page fit respects both dimensions and works for landscape pages", () => {
  assert.equal(fitZoom("page", 600, 300, 800, 1200), 0.25);
  assert.equal(fitZoom("page", 600, 900, 1200, 800), 0.5);
});
test("unmeasured content is ignored and extreme zooms stay bounded", () => {
  assert.equal(fitZoom("page", 600, 0, 800, 1200), null);
  assert.equal(fitZoom("width", 600, 900, 0, 0), null);
  assert.equal(fitZoom("page", 1, 1, 800, 1200), MIN_ZOOM);
  assert.equal(fitZoom("width", 10000, 10000, 100, 100), MAX_ZOOM);
});
