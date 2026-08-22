import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { extractAllStories } from "./extractor.ts";
import { compileStory } from "./render.ts";
import type { StaticSiteData, StaticStory } from "./types.ts";

export type StaticBuildOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
  uiRoot: string;
  outDir: string;
};

export async function buildStaticSite(
  options: StaticBuildOptions,
): Promise<StaticSiteData> {
  if (resolve(options.outDir) === resolve(options.packageRoot)) {
    throw new Error(
      "typstbook: --out must not be the package root (it is replaced on every build).",
    );
  }

  const extracted = await extractAllStories(options);
  const stories: StaticStory[] = [];
  for (const story of extracted.stories) {
    const compiled = await compileStory(options, {
      file: story.file,
      title: story.title,
      args: story.args,
      page: story.page,
    });
    stories.push({
      ...story,
      pages: compiled.pages,
      diagnostics: compiled.diagnostics,
    });
  }
  const data: StaticSiteData = { stories, errors: extracted.errors };

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
