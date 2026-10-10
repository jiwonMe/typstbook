import type { ArgType, ControlType } from "@/lib/types";

function typstString(value: string): string {
  const escaped = value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")
    .replaceAll("\t", "\\t");
  return `"${escaped}"`;
}

function typstKey(key: string): string {
  return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) ? key : typstString(key);
}

export function typstLiteral(value: unknown, control?: ControlType): string {
  if (value === null || value === undefined) {
    return "none";
  }
  if (control === "color" && typeof value === "string") {
    return `rgb(${typstString(value)})`;
  }
  if (control === "markup" && typeof value === "string") {
    return `[${value}]`;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "0";
  }
  if (typeof value === "string") {
    return typstString(value);
  }
  if (Array.isArray(value)) {
    const items = value.map((item) => typstLiteral(item));
    return `(${items.join(", ")}${items.length === 1 ? "," : ""})`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return "(:)";
    }
    return `(${entries
      .map(([key, entryValue]) => `${typstKey(key)}: ${typstLiteral(entryValue)}`)
      .join(", ")})`;
  }
  return typstString(String(value));
}

const ARGS_AT = /\bargs\.at\(\s*(['"])((?:(?!\1).)*)\1\s*\)/g;
const ARGS_DOT = /\bargs\.([A-Za-z_][A-Za-z0-9_]*)\b/g;

/** Replaces `args.foo` / `args.at("foo")` in `source` with live literal values. */
export function substituteArgs(
  source: string,
  args: Record<string, unknown>,
  argTypes: Record<string, ArgType>,
): string {
  const withAt = source.replace(ARGS_AT, (match, _quote: string, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(args, key)) {
      return match;
    }
    return typstLiteral(args[key], argTypes[key]?.control);
  });
  return withAt.replace(ARGS_DOT, (match, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(args, key)) {
      return match;
    }
    return typstLiteral(args[key], argTypes[key]?.control);
  });
}
