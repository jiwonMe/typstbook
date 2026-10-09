import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { CompileRequest, CompileResult, ViewportSpec } from "./types.ts";
import { diagnosticsFromStderr, HELPER_PACKAGE_SPEC, runTypst } from "./typst.ts";
import { toPosix } from "./ir.ts";
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
  return `#import "${HELPER_PACKAGE_SPEC}": render-story, decode-args
${previewSetupSource(includePreview)}#include "/${storyFilePosix}"
#let args = decode-args(sys.inputs.at("args"))
#let viewport = if "viewport" in sys.inputs { decode-args(sys.inputs.at("viewport")) } else { none }
#render-story(sys.inputs.at("title"), args, viewport: viewport)
`;
}

/** Wrapper whose args and viewport live in the file, so `typst watch` can recompile them. */
export function watchWrapperSource(
  storyFilePosix: string,
  title: string,
  args: Record<string, unknown>,
  viewport: ViewportSpec | null,
  includePreview = false,
): string {
  const argsLiteral = `json(bytes(${JSON.stringify(JSON.stringify(args))}))`;
  const viewportLiteral = viewport
    ? `json(bytes(${JSON.stringify(JSON.stringify(viewport))}))`
    : "none";
  return `#import "${HELPER_PACKAGE_SPEC}": render-story
${previewSetupSource(includePreview)}#include "/${storyFilePosix}"
#let args = ${argsLiteral}
#let viewport = ${viewportLiteral}
#render-story(${JSON.stringify(title)}, args, viewport: viewport)
`;
}

export async function compileStory(
  options: RenderOptions,
  request: CompileRequest,
): Promise<CompileResult> {
  // A fresh directory per call. A path derived from file+title races when
  // two compiles of the same story overlap (static build vs. a live session,
  // or test files running in parallel): one `rm` deletes the other's SVGs.
  const outDir = await mkdtemp(join(tmpdir(), "typstbook-render-"));
  try {
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
        ...(request.viewport
          ? ["--input", `viewport=${JSON.stringify(request.viewport)}`]
          : []),
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
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}

export type PdfResult = {
  pdf: Buffer | null;
  diagnostics: string[];
};

export async function compileStoryToPdf(
  options: RenderOptions,
  request: CompileRequest,
): Promise<PdfResult> {
  // A fresh mkdtemp per call (rather than a `outputDirFor`-style path keyed
  // by file+title) -- two PDF exports for the same story can run
  // concurrently (two tabs, or a request overlapping a static-build pass),
  // and a shared directory would let one's cleanup race the other's write.
  const outDir = await mkdtemp(join(tmpdir(), "typstbook-render-pdf-"));
  try {
    const output = join(outDir, "story.pdf");
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
      return { pdf: null, diagnostics: diagnosticsFromStderr(result.stderr) };
    }

    const pdf = await readFile(output);
    return { pdf, diagnostics: diagnosticsFromStderr(result.stderr) };
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}
