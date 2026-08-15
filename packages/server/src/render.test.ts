import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileStory, renderWrapperSource } from "./render.ts";
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

describe("renderWrapperSource", () => {
  it("includes the story file and decodes args", () => {
    const source = renderWrapperSource("stories/callout.story.typ");
    assert.match(source, /#include "\/stories\/callout\.story\.typ"/);
    assert.match(source, /decode-args/);
    assert.doesNotMatch(source, /#include "\/preview\.typ"/);
  });

  it("optionally wraps stories with package-root preview.typ", () => {
    const source = renderWrapperSource("stories/callout.story.typ", true);
    assert.match(source, /#import "\/preview\.typ": preview/);
    assert.match(source, /#show: preview/);
    assert.match(source, /#include "\/stories\/callout\.story\.typ"/);
  });
});

describe("compileStory", () => {
  it("compiles a demo story to SVG pages", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const compiled = await compileStory(
      {
        typst,
        packageRoot: demoRoot,
        packagePath: await ensureHelperPackagePath(),
      },
      {
        file: "stories/callout.story.typ",
        title: "Warning",
        args: { title: "주의", variant: "warning" },
        page: { paper: "a6", margin: "12pt" },
      },
    );
    assert.equal(compiled.pages.length, 1, compiled.diagnostics.join("\n"));
    assert.match(compiled.pages[0] ?? "", /<svg/i);
  });
});
