import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { discoverPackageDocs, enrichStoryWithDocs } from "./autodocs.ts";
import { parseChecks } from "./checks.ts";
import { expandMatrix, parseMatrix } from "./matrix.ts";
import type { ArgType, ExtractResult, FileError, FunctionDoc, StoryIR } from "./types.ts";
import { inferArgTypes, storyId, uniquifyStoryIds } from "./ir.ts";
import { discoverStoryFiles } from "./discover.ts";
import { hasPreviewFile, previewSetupSource } from "./preview.ts";
import { extractStorySnippets } from "./source-extract.ts";
import { diagnosticsFromStderr, HELPER_PACKAGE_SPEC, runTypst } from "./typst.ts";

export type ExtractorOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
};

type RawStory = {
  title?: unknown;
  description?: unknown;
  args?: unknown;
  "arg-types"?: unknown;
  page?: unknown;
  checks?: unknown;
  matrix?: unknown;
  "has-render"?: unknown;
};

export const EVAL_EXPRESSION =
  "query(<typstbook-story>).map(it => it.value)";

export function evalEntrySource(
  storyFilePosix: string,
  includePreview = false,
): string {
  return `#import "${HELPER_PACKAGE_SPEC}": emit-stories
${previewSetupSource(includePreview)}#include "/${storyFilePosix}"
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
      control === "color" ||
      control === "markup"
    ) {
      result[key] = {
        control,
        options: Array.isArray(entry.options) ? entry.options : undefined,
        min: typeof entry.min === "number" ? entry.min : undefined,
        max: typeof entry.max === "number" ? entry.max : undefined,
        step: typeof entry.step === "number" ? entry.step : undefined,
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
    const matrix = parseMatrix(raw.matrix);
    stories.push({
      id: storyId(file, raw.title),
      file,
      title: raw.title,
      description: typeof raw.description === "string" ? raw.description : null,
      args,
      argTypes: inferArgTypes(args, asArgTypes(raw["arg-types"])),
      page: raw.page ?? null,
      checks: parseChecks(raw.checks),
      source: null,
      docs: null,
      matrix,
      matrixCells: expandMatrix(matrix),
    });
  }
  return { stories, errors };
}

async function attachSource(
  packageRoot: string,
  file: string,
  stories: StoryIR[],
  packageDocs: FunctionDoc[] = [],
): Promise<StoryIR[]> {
  let snippets: Map<string, string>;
  try {
    const text = await readFile(join(packageRoot, file), "utf8");
    snippets = extractStorySnippets(text);
  } catch {
    snippets = new Map();
  }
  return stories.map((story) => {
    const source = snippets.get(story.title) ?? null;
    const enriched = enrichStoryWithDocs({ ...story, source }, packageDocs);
    return {
      ...story,
      source,
      args: enriched.args,
      argTypes: inferArgTypes(enriched.args, enriched.argTypes),
      docs: enriched.docs,
    };
  });
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

  const extracted = storiesFromEvalJson(file, result.stdout);
  const packageDocs = await discoverPackageDocs(options.packageRoot);
  return {
    ...extracted,
    stories: await attachSource(
      options.packageRoot,
      file,
      extracted.stories,
      packageDocs,
    ),
  };
}

export async function extractAllStories(
  options: ExtractorOptions,
): Promise<ExtractResult> {
  const files = await discoverStoryFiles(options.packageRoot);
  const includePreview = await hasPreviewFile(options.packageRoot);
  const packageDocs = await discoverPackageDocs(options.packageRoot);
  const stories: StoryIR[] = [];
  const errors: FileError[] = [];

  for (const file of files) {
    const extracted = await extractStoryFileWithDocs(
      options,
      file,
      includePreview,
      packageDocs,
    );
    stories.push(...extracted.stories);
    errors.push(...extracted.errors);
  }

  const unique = uniquifyStoryIds(stories);
  return {
    stories: unique.stories,
    errors: [...errors, ...unique.errors],
  };
}

async function extractStoryFileWithDocs(
  options: ExtractorOptions,
  file: string,
  includePreview: boolean,
  packageDocs: FunctionDoc[],
): Promise<ExtractResult> {
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
    evalEntrySource(file, includePreview),
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

  const extracted = storiesFromEvalJson(file, result.stdout);
  return {
    ...extracted,
    stories: await attachSource(
      options.packageRoot,
      file,
      extracted.stories,
      packageDocs,
    ),
  };
}
