import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  inferArgTypes,
  inferControl,
  mergeStoryArgs,
  storyId,
  titleSlug,
  uniquifyStoryIds,
} from "./ir.ts";
import { invalidateFor } from "./invalidate.ts";
import type { StoryIR } from "./types.ts";

describe("titleSlug", () => {
  it("slugs ascii titles", () => {
    assert.equal(titleSlug("Resume / Default"), "resume-default");
  });

  it("keeps non-ascii letters", () => {
    assert.equal(titleSlug("주의"), "주의");
  });
});

describe("storyId", () => {
  it("uses the path without .story.typ", () => {
    assert.equal(storyId("stories/callout.story.typ", "Warning"), "stories/callout--warning");
  });
});

describe("inferArgTypes", () => {
  it("infers from JSON types and keeps explicit controls", () => {
    assert.equal(inferControl(true), "boolean");
    assert.equal(inferControl(3), "number");
    assert.equal(inferControl("#239DAD"), "color");
    assert.equal(inferControl("주의"), "text");
    const inferred = inferArgTypes(
      { title: "주의", count: 1, on: false, fill: "#fff" },
      { title: { control: "text" } },
    );
    assert.equal(inferred.title.control, "text");
    assert.equal(inferred.count.control, "number");
    assert.equal(inferred.on.control, "boolean");
    assert.equal(inferred.fill.control, "color");
  });
});

describe("mergeStoryArgs", () => {
  it("adds new defaults, keeps overrides, and drops removed keys", () => {
    assert.deepEqual(
      mergeStoryArgs(
        { title: "Test", t: 23 },
        { title: "edited" },
      ),
      { title: "edited", t: 23 },
    );
    assert.deepEqual(
      mergeStoryArgs({ title: "Test" }, { title: "x", gone: true }),
      { title: "x" },
    );
  });
});

describe("uniquifyStoryIds", () => {
  it("suffixes colliding ids", () => {
    const story = (id: string, file: string): StoryIR => ({
      id,
      file,
      title: "Warning",
      args: {},
      argTypes: {},
      page: null,
    });
    const result = uniquifyStoryIds([
      story("stories/callout--warning", "stories/a.story.typ"),
      story("stories/callout--warning", "stories/b.story.typ"),
    ]);
    assert.equal(result.stories[1]?.id, "stories/callout--warning--2");
    assert.equal(result.errors.length, 1);
  });
});

describe("invalidateFor", () => {
  it("recompiles on args and re-extracts on file changes", () => {
    assert.equal(invalidateFor("args"), "compile");
    assert.equal(invalidateFor("story-file"), "extract-file");
    assert.equal(invalidateFor("source"), "extract-all");
    assert.equal(invalidateFor("config"), "extract-all");
  });
});
