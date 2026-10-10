import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { inferControl } from "./ir.ts";
import type { ArgType, FunctionDoc, ParamDoc } from "./types.ts";

const LET_FN = /#let\s+([A-Za-z_][\w-]*)\s*\(/g;

/** Parse tidy-style `///` blocks immediately above a `#let name(...)`. */
export function parseFunctionDocs(source: string, module = "src/lib.typ"): FunctionDoc[] {
  const docs: FunctionDoc[] = [];
  for (const match of source.matchAll(LET_FN)) {
    const name = match[1]!;
    const open = match.index ?? 0;
    const paramsStart = open + match[0].length - 1;
    const paramsClose = findMatchingParen(source, paramsStart);
    if (paramsClose < 0) {
      continue;
    }
    const paramsSource = source.slice(paramsStart + 1, paramsClose);
    const comment = precedingDocComment(source, open);
    const parsedComment = parseTidyComment(comment);
    const params = mergeParams(parseSignatureParams(paramsSource), parsedComment.params, parsedComment.types);
    docs.push({
      name,
      module,
      description: parsedComment.description,
      returnType: parsedComment.returnType,
      params,
      signature: `#let ${name}(${paramsSource.trim()})`,
    });
  }
  return docs;
}

function precedingDocComment(source: string, at: number): string {
  const before = source.slice(0, at);
  const lines = before.split(/\r?\n/);
  const collected: string[] = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    if (trimmed === "") {
      if (collected.length > 0) {
        break;
      }
      continue;
    }
    if (trimmed.startsWith("///")) {
      collected.unshift(trimmed.replace(/^\/\/\/\s?/, ""));
      continue;
    }
    break;
  }
  return collected.join("\n");
}

export function parseTidyComment(comment: string): {
  description: string | null;
  returnType: string | null;
  params: Map<string, string>;
  types: Map<string, string>;
} {
  const params = new Map<string, string>();
  const types = new Map<string, string>();
  let returnType: string | null = null;
  const desc: string[] = [];
  for (const raw of comment.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      continue;
    }
    const ret = line.match(/^->\s*(.+)$/);
    if (ret) {
      returnType = ret[1]!.trim();
      continue;
    }
    const param = line.match(/^-\s*([A-Za-z_][\w-]*)\s*(?:\(([^)]*)\))?\s*:\s*(.*)$/);
    if (param) {
      params.set(param[1]!, param[3]!.trim());
      if (param[2]) {
        types.set(param[1]!, param[2].trim());
      }
      continue;
    }
    desc.push(line);
  }
  return {
    description: desc.length > 0 ? desc.join(" ") : null,
    returnType,
    params,
    types,
  };
}

export function parseSignatureParams(paramsSource: string): ParamDoc[] {
  const parts = splitTopLevel(paramsSource);
  const params: ParamDoc[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === ".." || trimmed.startsWith("..")) {
      continue;
    }
    const named = trimmed.match(/^([A-Za-z_][\w-]*)\s*:\s*([\s\S]+)$/);
    if (named) {
      const defaultRaw = named[2]!.trim();
      params.push({
        name: named[1]!,
        type: inferTypeFromDefault(defaultRaw),
        default: defaultRaw,
        description: null,
        positional: false,
      });
      continue;
    }
    const positional = trimmed.match(/^([A-Za-z_][\w-]*)$/);
    if (positional) {
      params.push({
        name: positional[1]!,
        type: "content",
        default: null,
        description: null,
        positional: true,
      });
    }
  }
  return params;
}

function mergeParams(
  signature: ParamDoc[],
  descriptions: Map<string, string>,
  types: Map<string, string>,
): ParamDoc[] {
  return signature.map((param) => ({
    ...param,
    description: descriptions.get(param.name) ?? param.description,
    type: types.get(param.name) ?? param.type,
  }));
}

function inferTypeFromDefault(raw: string): string | null {
  if (raw === "true" || raw === "false") {
    return "bool";
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return "int";
  }
  if (/^".*"$/.test(raw) || /^'.*'$/.test(raw)) {
    return "str";
  }
  if (/^#?[0-9a-fA-F]{3,8}$/.test(raw) || raw.startsWith("rgb(")) {
    return "color";
  }
  if (/^\d+(\.\d+)?(pt|mm|cm|in|em)$/.test(raw)) {
    return "length";
  }
  return null;
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let inString: '"' | "'" | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      current += ch;
      if (ch === "\\") {
        current += text[++i] ?? "";
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      current += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      current += ch;
      continue;
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) {
    parts.push(current);
  }
  return parts;
}

function findMatchingParen(text: string, openIndex: number): number {
  let depth = 0;
  let inString: '"' | "'" | null = null;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "(") {
      depth++;
      continue;
    }
    if (ch === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

export async function discoverPackageDocs(packageRoot: string): Promise<FunctionDoc[]> {
  const src = join(packageRoot, "src");
  let files: string[] = [];
  try {
    files = (await readdir(src)).filter((name) => name.endsWith(".typ")).sort();
  } catch {
    return [];
  }
  const docs: FunctionDoc[] = [];
  for (const name of files) {
    const module = `src/${name}`;
    const text = await readFile(join(src, name), "utf8");
    docs.push(...parseFunctionDocs(text, module));
  }
  return docs;
}

/** First function call in a story render snippet, e.g. `callout(...)`. */
export function detectStoryFunction(source: string | null, docs: FunctionDoc[]): FunctionDoc | null {
  if (!source || docs.length === 0) {
    return null;
  }
  const names = new Set(docs.map((doc) => doc.name));
  const match = source.match(/\b([A-Za-z_][\w-]*)\s*\(/);
  if (!match || !names.has(match[1]!)) {
    return null;
  }
  return docs.find((doc) => doc.name === match[1]) ?? null;
}

export function argsFromDocs(doc: FunctionDoc): {
  args: Record<string, unknown>;
  argTypes: Record<string, ArgType>;
} {
  const args: Record<string, unknown> = {};
  const argTypes: Record<string, ArgType> = {};
  for (const param of doc.params) {
    if (param.positional || param.default === null) {
      if ((param.type ?? "").includes("content") || param.positional) {
        args[param.name] = "";
        argTypes[param.name] = { control: "markup" };
      }
      continue;
    }
    const value = literalToJson(param.default);
    if (value === undefined) {
      continue;
    }
    args[param.name] = value;
    argTypes[param.name] = { control: inferControl(value) };
  }
  return { args, argTypes };
}

function literalToJson(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  const str = raw.match(/^"(.*)"$/s) ?? raw.match(/^'(.*)'$/s);
  if (str) {
    return str[1]!.replaceAll('\\"', '"').replaceAll("\\n", "\n");
  }
  return undefined;
}

export function enrichStoryWithDocs(
  story: {
    args: Record<string, unknown>;
    argTypes: Record<string, ArgType>;
    source: string | null;
    docs?: FunctionDoc | null;
  },
  packageDocs: FunctionDoc[],
): { args: Record<string, unknown>; argTypes: Record<string, ArgType>; docs: FunctionDoc | null } {
  const docs = detectStoryFunction(story.source, packageDocs);
  if (!docs) {
    return { args: story.args, argTypes: story.argTypes, docs: null };
  }
  if (Object.keys(story.args).length > 0) {
    return { args: story.args, argTypes: story.argTypes, docs };
  }
  const generated = argsFromDocs(docs);
  return {
    args: generated.args,
    argTypes: { ...generated.argTypes, ...story.argTypes },
    docs,
  };
}
