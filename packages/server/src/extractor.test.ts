import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractAllStories, storiesFromEvalJson } from "./extractor.ts";
import {
  ensureHelperPackagePath,
  findTypstBinary,
} from "./typst.ts";

const demoRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "examples",
  "demo-pkg",
);

describe("storiesFromEvalJson", () => {
  it("maps eval metadata into Story IR", () => {
    const { stories, errors } = storiesFromEvalJson(
      "stories/callout.stories.typ",
      JSON.stringify([
        {
          title: "Warning",
          description: "A reusable warning callout.",
          args: { title: "주의", variant: "warning" },
          "arg-types": {
            variant: { control: "select", options: ["info", "warning"] },
          },
          page: { paper: "a6" },
          "has-render": true,
        },
      ]),
    );
    assert.equal(errors.length, 0);
    assert.equal(stories[0]?.id, "stories/callout--warning");
    assert.equal(stories[0]?.description, "A reusable warning callout.");
    assert.equal(stories[0]?.argTypes.variant?.control, "select");
    assert.equal(stories[0]?.argTypes.title?.control, "text");
  });

  it("carries min/max/step through for number controls", () => {
    const { stories } = storiesFromEvalJson(
      "stories/test.stories.typ",
      JSON.stringify([
        {
          title: "Test",
          args: { t: 23 },
          "arg-types": {
            t: { control: "number", min: 0, max: 100, step: 5 },
          },
          "has-render": true,
        },
      ]),
    );
    assert.equal(stories[0]?.argTypes.t?.control, "number");
    assert.equal(stories[0]?.argTypes.t?.min, 0);
    assert.equal(stories[0]?.argTypes.t?.max, 100);
    assert.equal(stories[0]?.argTypes.t?.step, 5);
  });

  it("defaults description to null when omitted", () => {
    const { stories } = storiesFromEvalJson(
      "stories/callout.stories.typ",
      JSON.stringify([{ title: "Info", "has-render": true }]),
    );
    assert.equal(stories[0]?.description, null);
  });
});

describe("extractAllStories", () => {
  it("extracts demo-pkg stories via typst eval", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const extracted = await extractAllStories({
      typst,
      packageRoot: demoRoot,
      packagePath: await ensureHelperPackagePath(),
    });
    assert.equal(extracted.errors.length, 0, extracted.errors.map((e) => e.message).join("\n"));
    const ids = extracted.stories.map((story) => story.id).sort();
    assert.deepEqual(ids, [
      "stories/callout--info",
      "stories/callout--warning",
      "stories/math--numbered-equation",
      "stories/resume--resume-default",
      "stories/test--test",
    ]);
  });
});
