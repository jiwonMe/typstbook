import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { evaluateChecks } from "./checks.ts";
import { loadTypstbookConfig } from "./config.ts";
import { extractAllStories } from "./extractor.ts";
import { collectFontReport } from "./fonts.ts";
import { compileStory, compileStoryToPdf } from "./render.ts";
import { readSnapshotPages, snapshotDirFor } from "./snapshot.ts";
import { discoverPackageTokens } from "./tokens.ts";
import type { StaticSiteData, StaticStory, StoryCheckRun } from "./types.ts";

export type StaticBuildOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
  uiRoot: string;
  outDir: string;
  fontPaths?: string[];
};

export async function buildStaticSite(
  options: StaticBuildOptions,
): Promise<StaticSiteData> {
  if (resolve(options.outDir) === resolve(options.packageRoot)) {
    throw new Error(
      "typstbook: --out must not be the package root (it is replaced on every build).",
    );
  }

  const config = await loadTypstbookConfig(options.packageRoot);
  const fontPaths = options.fontPaths ?? config.fontPaths;
  const renderOptions = { ...options, fontPaths };
  const extracted = await extractAllStories(options);
  const tokens = await discoverPackageTokens(options.typst, options.packageRoot);
  const fonts = await collectFontReport(options.typst, options.packageRoot, config, tokens);
  const stories: StaticStory[] = [];
  const checks: StoryCheckRun[] = [];
  for (const story of extracted.stories) {
    const request = {
      file: story.file,
      title: story.title,
      args: story.args,
      page: story.page,
    };
    const [compiled, pdfResult] = await Promise.all([
      compileStory(renderOptions, request),
      compileStoryToPdf(renderOptions, request),
    ]);
    stories.push({
      ...story,
      pages: compiled.pages,
      diagnostics: compiled.diagnostics,
      pdf: pdfResult.pdf ? pdfResult.pdf.toString("base64") : null,
    });
    const expected =
      compiled.pages.length > 0
        ? await readSnapshotPages(snapshotDirFor(options.packageRoot, story.id))
        : null;
    const { assertions, snapshot } = evaluateChecks({
      checks: story.checks,
      pages: compiled.pages,
      diagnostics: compiled.diagnostics,
      expected,
    });
    checks.push({
      storyId: story.id,
      file: story.file,
      title: story.title,
      status: assertions.every((item) => item.status === "pass") ? "pass" : "fail",
      assertions,
      diagnostics: compiled.diagnostics,
      // Static builds keep assertion text only — embedding every SVG twice bloats the site.
      snapshot: snapshot
        ? { status: snapshot.status, expected: null, actual: [], diffPages: snapshot.diffPages }
        : null,
    });
  }
  const data: StaticSiteData = { stories, errors: extracted.errors, tokens, fonts, checks };

  await writeStaticSite(options.uiRoot, options.outDir, data);
  return data;
}

/** Escapes `<` so the JSON payload can't break out of the inline <script> tag. */
function inlineDataScript(data: StaticSiteData): string {
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script>window.__TYPSTBOOK_STATIC__=${payload};</script>`;
}

export async function writeStaticSite(
  uiRoot: string,
  outDir: string,
  data: StaticSiteData,
): Promise<void> {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await cp(uiRoot, outDir, { recursive: true });

  const indexPath = join(outDir, "index.html");
  const html = await readFile(indexPath, "utf8");
  const bootstrap = inlineDataScript(data);
  const injected = html.includes("<head>")
    ? html.replace("<head>", `<head>\n${bootstrap}`)
    : `${bootstrap}\n${html}`;
  await writeFile(indexPath, injected, "utf8");
}
