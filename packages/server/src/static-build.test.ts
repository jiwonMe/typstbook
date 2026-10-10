import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildStaticSite, writeStaticSite } from "./static-build.ts";
import { ensureHelperPackagePath, findTypstBinary } from "./typst.ts";
import type { StaticSiteData } from "./types.ts";

const demoRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "examples",
  "demo-pkg",
);

const FAKE_INDEX_HTML = `<!doctype html>
<html>
  <head><title>typstbook</title></head>
  <body><div id="root"></div><script type="module" src="/assets/main.js"></script></body>
</html>
`;

async function makeFakeUiRoot(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "typstbook-fakeui-"));
  await writeFile(join(dir, "index.html"), FAKE_INDEX_HTML, "utf8");
  await mkdir(join(dir, "assets"), { recursive: true });
  await writeFile(join(dir, "assets", "main.js"), "console.log('ui')", "utf8");
  return dir;
}

const emptyFonts = { available: [] as string[], referenced: [], fontPaths: [] as string[] };
const emptyData: StaticSiteData = {
  stories: [],
  errors: [],
  tokens: [],
  fonts: emptyFonts,
  checks: [],
};

describe("writeStaticSite", () => {
  it("copies UI assets and injects the data bootstrap script", async () => {
    const uiRoot = await makeFakeUiRoot();
    const outParent = await mkdtemp(join(tmpdir(), "typstbook-out-"));
    const outDir = join(outParent, "site");
    const data: StaticSiteData = {
      stories: [
        {
          id: "stories/a--warning",
          file: "stories/a.stories.typ",
          title: "Warning",
          description: null,
          args: { title: "hi" },
          argTypes: { title: { control: "text" } },
          page: null,
          checks: null,
          source: null,
          docs: null,
          pages: ["<svg>ok</svg>"],
          diagnostics: [],
          pdf: null,
        },
      ],
      errors: [],
      tokens: [],
      fonts: emptyFonts,
      checks: [],
    };
    try {
      await writeStaticSite(uiRoot, outDir, data);
      const assetContent = await readFile(join(outDir, "assets", "main.js"), "utf8");
      assert.equal(assetContent, "console.log('ui')");

      const html = await readFile(join(outDir, "index.html"), "utf8");
      assert.match(html, /window\.__TYPSTBOOK_STATIC__=/);
      assert.match(html, /"stories\/a--warning"/);
      assert.match(html, /<script type="module" src="\/assets\/main\.js">/);
    } finally {
      await rm(uiRoot, { recursive: true, force: true });
      await rm(outParent, { recursive: true, force: true });
    }
  });

  it("escapes '<' so embedded content cannot break out of the script tag", async () => {
    const uiRoot = await makeFakeUiRoot();
    const outParent = await mkdtemp(join(tmpdir(), "typstbook-out-"));
    const outDir = join(outParent, "site");
    const data: StaticSiteData = {
      stories: [],
      errors: [
        { file: "x.stories.typ", message: "</script><script>alert(1)</script>" },
      ],
      tokens: [],
      fonts: emptyFonts,
      checks: [],
    };
    try {
      await writeStaticSite(uiRoot, outDir, data);
      const html = await readFile(join(outDir, "index.html"), "utf8");
      assert.doesNotMatch(html, /<script>alert\(1\)/);
      assert.match(html, /\\u003cscript>alert\(1\)/);
    } finally {
      await rm(uiRoot, { recursive: true, force: true });
      await rm(outParent, { recursive: true, force: true });
    }
  });

  it("replaces a pre-existing outDir on rebuild", async () => {
    const uiRoot = await makeFakeUiRoot();
    const parent = await mkdtemp(join(tmpdir(), "typstbook-out-"));
    const outDir = join(parent, "site");
    try {
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, "stale.txt"), "old", "utf8");
      await writeStaticSite(uiRoot, outDir, emptyData);
      await assert.rejects(() => readFile(join(outDir, "stale.txt"), "utf8"));
    } finally {
      await rm(uiRoot, { recursive: true, force: true });
      await rm(parent, { recursive: true, force: true });
    }
  });
});

describe("buildStaticSite", () => {
  it("refuses to build into the package root", async () => {
    const uiRoot = await makeFakeUiRoot();
    try {
      await assert.rejects(
        () =>
          buildStaticSite({
            typst: "typst",
            packageRoot: "/pkg",
            packagePath: "/pkg-cache",
            uiRoot,
            outDir: "/pkg",
          }),
        /must not be the package root/,
      );
    } finally {
      await rm(uiRoot, { recursive: true, force: true });
    }
  });

  it("extracts, compiles, and writes a static site for demo-pkg", async (t) => {
    const typst = findTypstBinary();
    if (!typst) {
      t.skip("typst is not on PATH");
      return;
    }
    const uiRoot = await makeFakeUiRoot();
    const outParent = await mkdtemp(join(tmpdir(), "typstbook-build-"));
    const outDir = join(outParent, "site");
    try {
      const data = await buildStaticSite({
        typst,
        packageRoot: demoRoot,
        packagePath: await ensureHelperPackagePath(),
        uiRoot,
        outDir,
      });
      assert.equal(data.errors.length, 0);
      assert.equal(data.stories.length, 5);
      assert.ok(data.stories.every((s) => s.pages.length > 0));
      assert.ok(
        data.stories.every((s) => s.pdf && Buffer.from(s.pdf, "base64").subarray(0, 5).toString() === "%PDF-"),
      );

      const html = await readFile(join(outDir, "index.html"), "utf8");
      assert.match(html, /window\.__TYPSTBOOK_STATIC__=/);
    } finally {
      await rm(uiRoot, { recursive: true, force: true });
      await rm(outParent, { recursive: true, force: true });
    }
  });
});
