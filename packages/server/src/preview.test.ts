import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalEntrySource } from "./extractor.ts";
import {
  hasPreviewFile,
  isPreviewPath,
  previewSetupSource,
} from "./preview.ts";

describe("preview helpers", () => {
  it("builds an optional show: preview setup", () => {
    assert.equal(previewSetupSource(false), "");
    assert.match(previewSetupSource(true), /#import "\/preview\.typ": preview/);
    assert.match(previewSetupSource(true), /#show: preview/);
    assert.equal(isPreviewPath("preview.typ"), true);
    assert.equal(isPreviewPath("stories/preview.typ"), false);
  });

  it("detects package-root preview.typ", async () => {
    const root = await mkdtemp(join(tmpdir(), "typstbook-preview-"));
    assert.equal(await hasPreviewFile(root), false);
    await writeFile(
      join(root, "preview.typ"),
      "#let preview(body) = {\n  set text(size: 12pt)\n  body\n}\n",
    );
    assert.equal(await hasPreviewFile(root), true);
  });

  it("applies preview before the story in eval entries", () => {
    const source = evalEntrySource("stories/callout.stories.typ", true);
    const showAt = source.indexOf("#show: preview");
    const storyAt = source.indexOf('#include "/stories/callout.stories.typ"');
    assert.ok(showAt >= 0);
    assert.ok(storyAt > showAt);
  });
});
