import { loadTypstbookConfig } from "./config.ts";
import { extractAllStories } from "./extractor.ts";
import { compileStory } from "./render.ts";
import {
  diffSnapshot,
  readSnapshotPages,
  snapshotDirFor,
  writeSnapshotPages,
} from "./snapshot.ts";
import type { CheckReport, StoryCheckResult } from "./types.ts";

export type CheckOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
  update: boolean;
  fontPaths?: string[];
};

export async function runCheck(options: CheckOptions): Promise<CheckReport> {
  const config = await loadTypstbookConfig(options.packageRoot);
  const renderOptions = {
    ...options,
    fontPaths: options.fontPaths ?? config.fontPaths,
  };
  const extracted = await extractAllStories(options);
  const results: StoryCheckResult[] = [];

  for (const story of extracted.stories) {
    const compiled = await compileStory(renderOptions, {
      file: story.file,
      title: story.title,
      args: story.args,
      page: story.page,
    });

    if (compiled.pages.length === 0) {
      results.push({
        storyId: story.id,
        file: story.file,
        title: story.title,
        status: "compile-error",
        diagnostics: compiled.diagnostics,
        diffPages: [],
      });
      continue;
    }

    const dir = snapshotDirFor(options.packageRoot, story.id);
    const expected = await readSnapshotPages(dir);
    const diff = diffSnapshot(expected, compiled.pages);
    if (options.update) {
      await writeSnapshotPages(dir, compiled.pages);
    }
    results.push({
      storyId: story.id,
      file: story.file,
      title: story.title,
      status: diff.status,
      diagnostics: compiled.diagnostics,
      diffPages: diff.diffPages,
    });
  }

  const ok =
    extracted.errors.length === 0 &&
    results.every((result) =>
      options.update
        ? result.status !== "compile-error"
        : result.status === "match",
    );

  return { fileErrors: extracted.errors, results, update: options.update, ok };
}

function resultLine(result: StoryCheckResult, update: boolean): string {
  switch (result.status) {
    case "match":
      return update
        ? `= ${result.storyId} (unchanged)`
        : `✓ ${result.storyId}`;
    case "new":
      return update
        ? `+ ${result.storyId} (snapshot created)`
        : `✗ ${result.storyId} (no snapshot yet -- run \`typstbook test --update\`)`;
    case "changed":
      return update
        ? `~ ${result.storyId} (snapshot updated, ${result.diffPages.length} page(s) differed)`
        : `✗ ${result.storyId} (${result.diffPages.length} page(s) differ from snapshot)`;
    case "compile-error": {
      const detail = result.diagnostics.join("\n    ");
      return `✗ ${result.storyId} (compile failed)${detail ? `\n    ${detail}` : ""}`;
    }
    default: {
      const _exhaustive: never = result.status;
      return _exhaustive;
    }
  }
}

export function formatCheckReport(report: CheckReport): string[] {
  const lines: string[] = [];
  for (const error of report.fileErrors) {
    lines.push(`✗ ${error.file}: ${error.message}`);
  }
  for (const result of report.results) {
    lines.push(resultLine(result, report.update));
  }

  const newCount = report.results.filter((r) => r.status === "new").length;
  const changedCount = report.results.filter((r) => r.status === "changed").length;
  const failedCount = report.results.filter(
    (r) => r.status === "compile-error",
  ).length;
  const summary = [`${report.results.length} stories checked`];
  if (newCount) summary.push(`${newCount} new`);
  if (changedCount) summary.push(`${changedCount} changed`);
  if (failedCount) summary.push(`${failedCount} failed`);
  lines.push(summary.join(", "));

  return lines;
}
