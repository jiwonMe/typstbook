import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export type TypstbookConfig = {
  /** Extra directories passed to Typst as `--font-path`. */
  fontPaths: string[];
};

const EMPTY: TypstbookConfig = { fontPaths: [] };

/** Load `[tool.typstbook]` from typst.toml and/or `typstbook.config.json`. */
export async function loadTypstbookConfig(packageRoot: string): Promise<TypstbookConfig> {
  const fromToml = await readTomlTool(packageRoot);
  const fromJson = await readJsonConfig(packageRoot);
  const paths = unique([...(fromToml.fontPaths ?? []), ...(fromJson.fontPaths ?? [])]);
  return {
    fontPaths: paths.map((item) => resolve(packageRoot, item)),
  };
}

async function readJsonConfig(packageRoot: string): Promise<Partial<TypstbookConfig>> {
  try {
    const raw = await readFile(join(packageRoot, "typstbook.config.json"), "utf8");
    const parsed = JSON.parse(raw) as { "font-paths"?: unknown; fontPaths?: unknown };
    const list = parsed["font-paths"] ?? parsed.fontPaths;
    return { fontPaths: asStringList(list) };
  } catch {
    return {};
  }
}

async function readTomlTool(packageRoot: string): Promise<Partial<TypstbookConfig>> {
  try {
    const raw = await readFile(join(packageRoot, "typst.toml"), "utf8");
    return { fontPaths: parseTomlFontPaths(raw) };
  } catch {
    return {};
  }
}

/** Tiny scanner for `font-paths = ["a", "b"]` under `[tool.typstbook]`. */
export function parseTomlFontPaths(toml: string): string[] {
  const tool = toml.match(/\[tool\.typstbook\]([\s\S]*?)(?=\n\[|$)/);
  if (!tool) {
    return [];
  }
  const section = tool[1] ?? "";
  const array = section.match(/^\s*font-paths\s*=\s*\[([^\]]*)\]/m);
  if (!array) {
    return [];
  }
  return [...(array[1] ?? "").matchAll(/"([^"]+)"/g)].map((match) => match[1]!);
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

/** CLI flags shared by compile / watch / fonts. */
export function fontPathArgs(fontPaths: string[]): string[] {
  const args: string[] = [];
  for (const dir of fontPaths) {
    args.push("--font-path", dir);
  }
  return args;
}
