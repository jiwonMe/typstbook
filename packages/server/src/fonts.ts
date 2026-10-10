import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fontPathArgs, type TypstbookConfig } from "./config.ts";
import { missingFontFromDiagnostic, parseDiagnostics, type Diagnostic } from "./diagnostics.ts";
import { isStoryFile, toPosix } from "./ir.ts";
import type { PackageToken } from "./types.ts";
import { runTypst } from "./typst.ts";

export type FontStatus = "available" | "missing";

export type FontInfo = {
  family: string;
  status: FontStatus;
  /** Where the family was referenced (package-relative). */
  sources: string[];
};

export type FontReport = {
  available: string[];
  referenced: FontInfo[];
  fontPaths: string[];
};

const FONT_STRING = /font\s*:\s*"([^"]+)"/gi;
const FONT_TUPLE = /font\s*:\s*\(([^)]*)\)/gi;
const FONT_BINDING = /#let\s+\w*(?:font|serif|sans|mono)\w*\s*=\s*(?:\"([^\"]+)\"|\(([^)]*)\))/gi;

export async function listAvailableFonts(
  typst: string,
  fontPaths: string[] = [],
): Promise<string[]> {
  const result = await runTypst(typst, ["fonts", ...fontPathArgs(fontPaths)]);
  if (result.code !== 0) {
    return [];
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Pull font family names out of Typst source (`font: "X"` / fallback stacks). */
export function extractFontReferences(source: string): string[] {
  const found = new Set<string>();
  const addQuoted = (chunk: string | undefined) => {
    if (!chunk) {
      return;
    }
    for (const inner of chunk.matchAll(/"([^"]+)"/g)) {
      if (inner[1]) {
        found.add(inner[1]);
      }
    }
  };
  for (const match of source.matchAll(FONT_STRING)) {
    if (match[1]) {
      found.add(match[1]);
    }
  }
  for (const match of source.matchAll(FONT_TUPLE)) {
    addQuoted(match[1]);
  }
  for (const match of source.matchAll(FONT_BINDING)) {
    if (match[1]) {
      found.add(match[1]);
    }
    addQuoted(match[2]);
  }
  return [...found];
}

export async function scanPackageFontSources(packageRoot: string): Promise<Map<string, string[]>> {
  const byFamily = new Map<string, string[]>();
  const files = await collectTypFiles(packageRoot);
  await Promise.all(
    files.map(async (rel) => {
      try {
        const source = await readFile(join(packageRoot, rel), "utf8");
        for (const family of extractFontReferences(source)) {
          const list = byFamily.get(family) ?? [];
          list.push(rel);
          byFamily.set(family, list);
        }
      } catch {
        // Skip unreadable files.
      }
    }),
  );
  return byFamily;
}

async function collectTypFiles(packageRoot: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string, prefix: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".typstbook") {
        continue;
      }
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(join(dir, entry.name), rel);
      } else if (entry.name.endsWith(".typ")) {
        out.push(toPosix(rel));
      }
    }
  }
  await walk(packageRoot, "");
  return out.filter((rel) => isStoryFile(rel) || rel === "preview.typ" || rel.startsWith("src/"));
}

export function buildFontReport(
  available: string[],
  referenced: Map<string, string[]>,
  tokens: PackageToken[],
  diagnostics: Diagnostic[],
  fontPaths: string[],
): FontReport {
  const availableSet = new Set(available.map((name) => name.toLowerCase()));
  const merged = new Map<string, Set<string>>();
  for (const [family, sources] of referenced) {
    merged.set(family, new Set(sources));
  }
  for (const token of tokens) {
    if (token.kind !== "font") {
      continue;
    }
    const family = token.value.replace(/^"|"$/g, "");
    const list = merged.get(family) ?? new Set<string>();
    list.add(token.module);
    merged.set(family, list);
  }
  for (const diag of diagnostics) {
    const family = missingFontFromDiagnostic(diag);
    if (!family) {
      continue;
    }
    const list = merged.get(family) ?? new Set<string>();
    if (diag.file) {
      list.add(diag.file);
    }
    merged.set(family, list);
  }
  const infos: FontInfo[] = [...merged.entries()]
    .map(([family, sources]) => ({
      family,
      status: availableSet.has(family.toLowerCase()) ? ("available" as const) : ("missing" as const),
      sources: [...sources].sort(),
    }))
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "missing" ? -1 : 1;
      }
      return a.family.localeCompare(b.family);
    });
  return { available, referenced: infos, fontPaths };
}

export async function collectFontReport(
  typst: string,
  packageRoot: string,
  config: TypstbookConfig,
  tokens: PackageToken[],
  diagnosticTexts: string[] = [],
): Promise<FontReport> {
  const [available, referenced] = await Promise.all([
    listAvailableFonts(typst, config.fontPaths),
    scanPackageFontSources(packageRoot),
  ]);
  const diagnostics = parseDiagnostics(diagnosticTexts, { packageRoot });
  return buildFontReport(available, referenced, tokens, diagnostics, config.fontPaths);
}
