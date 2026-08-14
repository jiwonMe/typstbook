import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalEntrySource } from "./extractor.ts";
import {
  hasPreviewFile,
  isPreviewPath,
  previewIncludeLine,
} from "./preview.ts";

describe("preview helpers", () => {
  it("builds an optional include line", () => {
    assert.equal(previewIncludeLine(false), "");
    assert.equal(previewIncludeLine(true), '#include "/preview.typ"\n');
    assert.equal(isPreviewPath("preview.typ"), true);
    assert.equal(isPreviewPath("stories/preview.typ"), false);
  });

  it("detects package-root preview.typ", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-preview-"));
    assert.equal(await hasPreviewFile(root), false);
    await writeFile(join(root, "preview.typ"), "#set text(size: 12pt)\n");
    assert.equal(await hasPreviewFile(root), true);
  });

  it("puts preview before the story in eval entries", () => {
    const source = evalEntrySource("stories/callout.story.typ", true);
    const previewAt = source.indexOf('#include "/preview.typ"');
    const storyAt = source.indexOf('#include "/stories/callout.story.typ"');
    assert.ok(previewAt >= 0);
    assert.ok(storyAt > previewAt);
  });
});
