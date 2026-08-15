import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { CompileRequest, CompileResult } from "./types.ts";
import { diagnosticsFromStderr, runTypst } from "./typst.ts";
import { titleSlug, toPosix } from "./ir.ts";
import { hasPreviewFile, previewSetupSource } from "./preview.ts";

export type RenderOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
};

export function renderWrapperSource(
  storyFilePosix: string,
  includePreview = false,
): string {
  return `#import "@preview/typstbook:0.1.0": render-story, decode-args
${previewSetupSource(includePreview)}#include "/${storyFilePosix}"
#let args = decode-args(sys.inputs.at("args"))
#render-story(sys.inputs.at("title"), args)
`;
}

function outputDirFor(file: string, title: string): string {
  const safe = `${toPosix(file).replaceAll("/", "__")}--${titleSlug(title)}`;
  return join(tmpdir(), "typstbook-render", safe);
}

export async function compileStory(
  options: RenderOptions,
  request: CompileRequest,
): Promise<CompileResult> {
  const outDir = outputDirFor(request.file, request.title);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const output = join(outDir, "page-{p}.svg");
  const includePreview = await hasPreviewFile(options.packageRoot);

  const result = await runTypst(
    options.typst,
    [
      "compile",
      "--root",
      options.packageRoot,
      "--package-path",
      options.packagePath,
      "--input",
      `args=${JSON.stringify(request.args)}`,
      "--input",
      `title=${request.title}`,
      "-",
      output,
    ],
    renderWrapperSource(toPosix(request.file), includePreview),
  );

  if (result.code !== 0) {
    return {
      pages: [],
      diagnostics: diagnosticsFromStderr(result.stderr),
    };
  }

  const names = (await readdir(outDir))
    .filter((name) => name.endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const pages = await Promise.all(
    names.map((name) => readFile(join(outDir, name), "utf8")),
  );
  return {
    pages,
    diagnostics: diagnosticsFromStderr(result.stderr),
  };
}
