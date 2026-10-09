import assert from "node:assert/strict";
import { test } from "node:test";
import { canvasBackground } from "./backgrounds";
import { distanceMm, formatMm, isPageFill, keepOutlineBox, pageSizeLabel, tokenSwatch } from "./measure";
import { customViewport, viewportButtonLabel } from "./viewport";

test("custom viewport accepts Typst lengths and rejects bare numbers", () => {
  assert.deepEqual(customViewport("210mm", "297mm"), { width: "210mm", height: "297mm" });
  assert.equal(customViewport("210", "297mm"), null);
  assert.equal(viewportButtonLabel("custom", { width: "210mm", height: "297mm" }), "210mm × 297mm");
  assert.equal(viewportButtonLabel("a4", { paper: "a4" }), "A4");
});

test("canvas backgrounds cover the presets", () => {
  assert.deepEqual(canvasBackground("canvas", "#fff"), {});
  assert.equal(canvasBackground("dark", "#fff").backgroundColor, "#1e1e1e");
  assert.match(canvasBackground("checker", "#fff").backgroundImage ?? "", /linear-gradient/);
  assert.equal(canvasBackground("custom", "#336699").backgroundColor, "#336699");
  assert.equal(canvasBackground("custom", "red").backgroundColor, "#ffffff");
});

test("measure helpers convert page units and keep shape boxes", () => {
  assert.equal(pageSizeLabel("297.637795276pt", "419.527559055pt"), "105.0 mm × 148.0 mm");
  assert.ok(Math.abs(distanceMm(0, 0, 72, 0) - 25.4) < 0.001);
  assert.equal(formatMm(72), "25.4 mm");
  assert.equal(keepOutlineBox({ x: 0, y: 0, width: 10, height: 4 }, true, false), true);
  assert.equal(keepOutlineBox({ x: 0, y: 0, width: 10, height: 4 }, true, true), false);
  assert.equal(keepOutlineBox({ x: 0, y: 0, width: 1, height: 4 }, true, false), false);
  assert.equal(tokenSwatch('rgb("#d97706")'), "#d97706");
  assert.equal(isPageFill({ x: 0, y: 0, width: 100, height: 100 }, 100, 100), true);
  assert.equal(isPageFill({ x: 12, y: 12, width: 80, height: 40 }, 100, 140), false);
});
