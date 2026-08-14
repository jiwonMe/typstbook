import type { ArgType, ExtractResult, FileError, StoryIR } from "./types.ts";
import { inferArgTypes, storyId, uniquifyStoryIds } from "./ir.ts";
import { discoverStoryFiles } from "./discover.ts";
import { hasPreviewFile, previewIncludeLine } from "./preview.ts";
import { diagnosticsFromStderr, runTypst } from "./typst.ts";

export type ExtractorOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
};

type RawStory = {
  title?: unknown;
  args?: unknown;
  "arg-types"?: unknown;
  page?: unknown;
  "has-render"?: unknown;
};

export const EVAL_EXPRESSION =
  "query(<typstbook-story>).map(it => it.value)";

export function evalEntrySource(
  storyFilePosix: string,
  includePreview = false,
): string {
  return `#import "@preview/typstbook:0.1.0": emit-stories
${previewIncludeLine(includePreview)}#include "/${storyFilePosix}"
#emit-stories()
`;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asArgTypes(value: unknown): Record<string, ArgType> {
  const record = asRecord(value);
  const result: Record<string, ArgType> = {};
  for (const [key, raw] of Object.entries(record)) {
    const entry = asRecord(raw);
    const control = entry.control;
    if (
      control === "text" ||
      control === "number" ||
      control === "boolean" ||
      control === "select" ||
      control === "color"
    ) {
      result[key] = {
        control,
        options: Array.isArray(entry.options) ? entry.options : undefined,
      };
    }
  }
  return result;
}

export function storiesFromEvalJson(
  file: string,
  jsonText: string,
): { stories: StoryIR[]; errors: FileError[] } {
  const errors: FileError[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      stories: [],
      errors: [
        {
          file,
          message: `typst eval returned invalid JSON:\n${jsonText}`,
        },
      ],
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      stories: [],
      errors: [{ file, message: "typst eval did not return an array" }],
    };
  }

  const stories: StoryIR[] = [];
  for (const item of parsed) {
    const raw = item as RawStory;
    if (typeof raw.title !== "string" || raw.title.length === 0) {
      errors.push({ file, message: "Story is missing a title" });
      continue;
    }
    if (raw["has-render"] !== true) {
      errors.push({
        file,
        message: `Story "${raw.title}" has no render function`,
      });
    }
    const args = asRecord(raw.args);
    stories.push({
      id: storyId(file, raw.title),
      file,
      title: raw.title,
      args,
      argTypes: inferArgTypes(args, asArgTypes(raw["arg-types"])),
      page: raw.page ?? null,
    });
  }
  return { stories, errors };
}

export async function extractStoryFile(
  options: ExtractorOptions,
  file: string,
  includePreview?: boolean,
): Promise<ExtractResult> {
  const withPreview =
    includePreview ?? (await hasPreviewFile(options.packageRoot));
  const result = await runTypst(
    options.typst,
    [
      "eval",
      EVAL_EXPRESSION,
      "--in",
      "-",
      "--root",
      options.packageRoot,
      "--package-path",
      options.packagePath,
    ],
    evalEntrySource(file, withPreview),
  );

  if (result.code !== 0) {
    return {
      stories: [],
      errors: [
        {
          file,
          message:
            diagnosticsFromStderr(result.stderr).join("\n") ||
            `typst eval failed with code ${result.code}`,
        },
      ],
    };
  }

  return storiesFromEvalJson(file, result.stdout);
}

export async function extractAllStories(
  options: ExtractorOptions,
): Promise<ExtractResult> {
  const files = await discoverStoryFiles(options.packageRoot);
  const includePreview = await hasPreviewFile(options.packageRoot);
  const stories: StoryIR[] = [];
  const errors: FileError[] = [];

  for (const file of files) {
    const extracted = await extractStoryFile(options, file, includePreview);
    stories.push(...extracted.stories);
    errors.push(...extracted.errors);
  }

  const unique = uniquifyStoryIds(stories);
  return {
    stories: unique.stories,
    errors: [...errors, ...unique.errors],
  };
}
