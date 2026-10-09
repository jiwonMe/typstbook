import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileStory, compileStoryToPdf, renderWrapperSource } from "./render.ts";
import {
  ensureHelperPackagePath,
  findTypstBinary,
} from "./typst.ts";

const examplesRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "examples",
);
const demoRoot = join(examplesRoot, "demo-pkg");
const kiceRoot = join(examplesRoot, "kice-korean");

function svgSize(svg: string): { width: number; height: number } {
  return {
    width: Number(/width="([\d.]+)pt"/.exec(svg)?.[1]),
    height: Number(/height="([\d.]+)pt"/.exec(svg)?.[1]),
  };
}

describe("renderWrapperSource", () => {
  it("includes the story file and decodes args", () => {
    const source = renderWrapperSource("stories/callout.stories.typ");
    assert.match(source, /#include "\/stories\/callout\.stories\.typ"/);
    assert.match(source, /decode-args/);
    assert.doesNotMatch(source, /#include "\/preview\.typ"/);
  });

  it("optionally wraps stories with package-root preview.typ", () => {
    const source = renderWrapperSource("stories/callout.stories.typ", true);
    assert.match(source, /#import "\/preview\.typ": preview/);
    assert.match(source, /#show: preview/);
    assert.match(source, /#include "\/stories\/callout\.stories\.typ"/);
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
        file: "stories/callout.stories.typ",
        title: "Warning",
        args: { title: "주의", variant: "warning" },
        page: { paper: "a6", margin: "12pt" },
      },
    );
    assert.equal(compiled.pages.length, 1, compiled.diagnostics.join("\n"));
    assert.match(compiled.pages[0] ?? "", /<svg/i);
  });

  it("overrides the story page with a preview viewport", async (t) => {
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
        file: "stories/callout.stories.typ",
        title: "Warning",
        args: { title: "주의", variant: "warning" },
        page: { paper: "a6", margin: "12pt" },
        viewport: { paper: "a4" },
      },
    );
    assert.equal(compiled.pages.length, 1, compiled.diagnostics.join("\n"));
    const size = svgSize(compiled.pages[0] ?? "");
    assert.ok(Math.abs(size.width - 595.28) < 1, `expected A4 width, got ${size.width}`);
  });

  it("applies the story page paper size to compiled SVG", async (t) => {
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
        file: "stories/callout.stories.typ",
        title: "Warning",
        args: { title: "주의", variant: "warning" },
        page: { paper: "a6", margin: "12pt" },
      },
    );
    assert.equal(compiled.pages.length, 1, compiled.diagnostics.join("\n"));
    const { width, height } = svgSize(compiled.pages[0] ?? "");
    // A6 is 105mm × 148mm. Default A4 would be ~595 × 842.
    assert.ok(width > 297 && width < 298, `expected A6 width, got ${width}`);
    assert.ok(height > 419 && height < 420, `expected A6 height, got ${height}`);
  });

  it("applies an A5 story page size", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const compiled = await compileStory(
      {
        typst,
        packageRoot: kiceRoot,
        packagePath: await ensureHelperPackagePath(),
      },
      {
        file: "stories/passage.stories.typ",
        title: "단일 지문",
        args: {
          from: 1,
          to: 2,
          lead: "다음 글을 읽고 물음에 답하시오.",
          content: "짧은 본문",
        },
        page: { paper: "a5", margin: "16pt" },
      },
    );
    assert.equal(compiled.pages.length, 1, compiled.diagnostics.join("\n"));
    const { width, height } = svgSize(compiled.pages[0] ?? "");
    assert.ok(width > 419 && width < 420, `expected A5 width, got ${width}`);
    assert.ok(height > 595 && height < 596, `expected A5 height, got ${height}`);
  });

  it("lets a preview viewport override the story page", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const options = {
      typst,
      packageRoot: demoRoot,
      packagePath: await ensureHelperPackagePath(),
    };
    const request = {
      file: "stories/resume.stories.typ",
      title: "Resume / Default",
      args: { name: "홍길동", role: "Engineer" },
      page: { paper: "a5", margin: "16pt" },
    };
    const compiled = await compileStory(options, request);
    assert.equal(compiled.pages.length, 1, compiled.diagnostics.join("\n"));
    const base = svgSize(compiled.pages[0] ?? "");
    assert.ok(base.width > 419 && base.width < 420, `expected A5 width, got ${base.width}`);
    const overridden = await compileStory(options, { ...request, viewport: { paper: "a4" } });
    assert.equal(overridden.pages.length, 1, overridden.diagnostics.join("\n"));
    const next = svgSize(overridden.pages[0] ?? "");
    assert.ok(Math.abs(next.width - 595.28) < 1, `expected A4 width, got ${next.width}`);
  });
});

describe("compileStoryToPdf", () => {
  it("compiles a demo story to a PDF buffer", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const compiled = await compileStoryToPdf(
      {
        typst,
        packageRoot: demoRoot,
        packagePath: await ensureHelperPackagePath(),
      },
      {
        file: "stories/callout.stories.typ",
        title: "Warning",
        args: { title: "주의", variant: "warning" },
        page: { paper: "a6", margin: "12pt" },
      },
    );
    assert.ok(compiled.pdf, compiled.diagnostics.join("\n"));
    assert.equal(compiled.pdf?.subarray(0, 5).toString(), "%PDF-");
  });

  it("reports diagnostics instead of a buffer on a compile error", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const compiled = await compileStoryToPdf(
      {
        typst,
        packageRoot: demoRoot,
        packagePath: await ensureHelperPackagePath(),
      },
      {
        file: "stories/callout.stories.typ",
        title: "does-not-exist",
        args: {},
        page: null,
      },
    );
    assert.equal(compiled.pdf, null);
    assert.ok(compiled.diagnostics.join("\n").length > 0);
  });
});
