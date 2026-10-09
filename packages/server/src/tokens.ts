import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PackageToken, TokenKind } from "./types.ts";
import { toPosix } from "./ir.ts";
import { runTypst } from "./typst.ts";

const COLOR_RE =
  /^(?:rgb|luma|oklab|oklch|cmyk|hsl|color)\b|^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const LENGTH_RE = /^-?\d+(?:\.\d+)?(?:pt|mm|cm|in|em|px|fr|%)$/;

export function classifyToken(path: string, value: unknown): TokenKind | null {
  const key = path.split(".").at(-1) ?? path;
  if (typeof value === "number" && Number.isFinite(value)) {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (typeof value !== "string") {
    return null;
  }
  if (COLOR_RE.test(value)) {
    return "color";
  }
  if (LENGTH_RE.test(value)) {
    return "length";
  }
  if (/font/i.test(path)) {
    return "font";
  }
  // Typst's dictionary(module) renders a function as its own name.
  if (value === key) {
    return null;
  }
  return "string";
}

export function flattenTokenTree(
  modulePath: string,
  value: unknown,
  prefix = "",
): PackageToken[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const out: PackageToken[] = [];
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const next = prefix ? `${prefix}.${key}` : key;
      out.push(...flattenTokenTree(modulePath, child, next));
    }
    return out;
  }
  if (!prefix) {
    return [];
  }
  const kind = classifyToken(prefix, value);
  if (!kind) {
    return [];
  }
  const tokensOnly = modulePath.endsWith("tokens.typ");
  if (!tokensOnly && kind !== "color" && kind !== "length" && kind !== "font") {
    return [];
  }
  return [
    {
      name: prefix,
      kind,
      value: String(value),
      module: modulePath,
    },
  ];
}

/** Prefer a dedicated tokens module when the same binding is also re-exported. */
export function dedupeTokens(tokens: PackageToken[]): PackageToken[] {
  const byName = new Map<string, PackageToken>();
  for (const token of tokens) {
    const key = `${token.name}\0${token.value}`;
    const current = byName.get(key);
    if (!current || (token.module.endsWith("tokens.typ") && !current.module.endsWith("tokens.typ"))) {
      byName.set(key, token);
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function entrypointFromManifest(toml: string): string | null {
  const match = toml.match(/^\s*entrypoint\s*=\s*"([^"]+)"/m);
  return match ? toPosix(match[1]) : null;
}

export async function tokenModulePaths(packageRoot: string): Promise<string[]> {
  const found: string[] = [];
  const manifestPath = join(packageRoot, "typst.toml");
  if (await exists(manifestPath)) {
    const entry = entrypointFromManifest(await readFile(manifestPath, "utf8"));
    if (entry) {
      found.push(entry);
    }
  }
  for (const relative of ["tokens.typ", "src/tokens.typ"]) {
    if (await exists(join(packageRoot, relative))) {
      found.push(relative);
    }
  }
  return [...new Set(found)];
}

export async function readModuleDictionary(
  typst: string,
  packageRoot: string,
  modulePath: string,
): Promise<unknown | null> {
  const imported = await runTypst(typst, [
    "eval",
    "--root",
    packageRoot,
    `import "/${modulePath}" as mod\ndictionary(mod)`,
  ]);
  if (imported.code !== 0) {
    return null;
  }
  try {
    return JSON.parse(imported.stdout);
  } catch {
    return null;
  }
}

export async function discoverPackageTokens(
  typst: string,
  packageRoot: string,
): Promise<PackageToken[]> {
  const modules = await tokenModulePaths(packageRoot);
  const tokens: PackageToken[] = [];
  for (const modulePath of modules) {
    const value = await readModuleDictionary(typst, packageRoot, modulePath);
    if (value) {
      tokens.push(...flattenTokenTree(modulePath, value));
    }
  }
  return dedupeTokens(tokens);
}
