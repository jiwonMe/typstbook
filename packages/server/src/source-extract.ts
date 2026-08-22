/**
 * Lightweight, non-parser scanner over raw `*.stories.typ` source text.
 *
 * Finds top-level `#story(...)` calls by tracking bracket depth while
 * skipping strings, line/block comments, raw ```fences```, and backslash
 * escapes. It does not distinguish Typst markup mode from code mode, so a
 * literal unbalanced bracket inside prose content can throw off extraction
 * for that one call -- callers must treat a miss as "no source available",
 * never as an error.
 */

const STORY_MARKER = "#story";

function skipNonStructural(text: string, i: number): number {
  const ch = text[i];
  if (ch === "\\") {
    return Math.min(text.length, i + 2);
  }
  if (ch === "/" && text[i + 1] === "/") {
    const nl = text.indexOf("\n", i);
    return nl === -1 ? text.length : nl;
  }
  if (ch === "/" && text[i + 1] === "*") {
    return skipBlockComment(text, i);
  }
  if (ch === "`") {
    return skipRawFence(text, i);
  }
  if (ch === '"') {
    return skipString(text, i);
  }
  return i;
}

function skipBlockComment(text: string, i: number): number {
  let depth = 0;
  let j = i;
  while (j < text.length) {
    if (text[j] === "/" && text[j + 1] === "*") {
      depth++;
      j += 2;
      continue;
    }
    if (text[j] === "*" && text[j + 1] === "/") {
      depth--;
      j += 2;
      if (depth === 0) {
        return j;
      }
      continue;
    }
    j++;
  }
  return j;
}

function skipRawFence(text: string, i: number): number {
  let j = i;
  while (text[j] === "`") {
    j++;
  }
  const fenceLen = j - i;
  while (j < text.length) {
    if (text[j] === "`") {
      let k = j;
      while (text[k] === "`") {
        k++;
      }
      if (k - j >= fenceLen) {
        return j + fenceLen;
      }
      j = k;
      continue;
    }
    j++;
  }
  return j;
}

function skipString(text: string, i: number): number {
  let j = i + 1;
  while (j < text.length && text[j] !== '"') {
    if (text[j] === "\\") {
      j += 2;
      continue;
    }
    j++;
  }
  return Math.min(text.length, j + 1);
}

/**
 * `openIndex` must point at `( [ {`. Returns the index of the matching
 * closing bracket, or -1 if the text ends before it closes. Bracket *kind*
 * is not checked, only depth -- fine for already-valid Typst source.
 */
export function matchBracket(text: string, openIndex: number): number {
  let depth = 1;
  let i = openIndex + 1;
  while (i < text.length) {
    const skipped = skipNonStructural(text, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    const ch = text[i];
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
    i++;
  }
  return -1;
}

export type NamedArg = { key: string | null; value: string };

const NAMED_ARG = /^\s*([A-Za-z_][\w-]*)\s*:\s*([\s\S]*)$/;

/** Splits text on depth-0 commas and separates each `key: value` segment. */
export function splitTopLevelArgs(argsSource: string): NamedArg[] {
  const segments: string[] = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  while (i < argsSource.length) {
    const skipped = skipNonStructural(argsSource, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    const ch = argsSource[i];
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth = Math.max(0, depth - 1);
    } else if (ch === "," && depth === 0) {
      segments.push(argsSource.slice(start, i));
      start = i + 1;
      i++;
      continue;
    }
    i++;
  }
  const last = argsSource.slice(start);
  if (last.trim().length > 0) {
    segments.push(last);
  }

  return segments.map((segment) => {
    const match = NAMED_ARG.exec(segment);
    if (match) {
      return { key: match[1], value: match[2].trim() };
    }
    return { key: null, value: segment.trim() };
  });
}

function unescapeTypstString(raw: string): string {
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "\\") {
      const next = raw[i + 1];
      switch (next) {
        case "n":
          result += "\n";
          break;
        case "t":
          result += "\t";
          break;
        case '"':
          result += '"';
          break;
        case "\\":
          result += "\\";
          break;
        default:
          result += next ?? "";
      }
      i++;
      continue;
    }
    result += raw[i];
  }
  return result;
}

function extractTitle(argsSource: string): string | null {
  const titleArg = splitTopLevelArgs(argsSource).find((arg) => arg.key === "title");
  if (!titleArg) {
    return null;
  }
  const match = /^"((?:\\.|[^"\\])*)"/.exec(titleArg.value);
  return match ? unescapeTypstString(match[1]) : null;
}

export type StoryCallMatch = {
  title: string | null;
  source: string;
  argsSource: string;
};

/** Finds every top-level `#story(...)` call in a story file's raw text. */
export function findStoryCalls(fileText: string): StoryCallMatch[] {
  const matches: StoryCallMatch[] = [];
  let i = 0;
  let depth = 0;
  while (i < fileText.length) {
    const skipped = skipNonStructural(fileText, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    const ch = fileText[i];
    if (
      ch === "(" &&
      depth === 0 &&
      fileText.slice(i - STORY_MARKER.length, i) === STORY_MARKER
    ) {
      const closeIndex = matchBracket(fileText, i);
      if (closeIndex !== -1) {
        const hashIndex = i - STORY_MARKER.length;
        matches.push({
          title: extractTitle(fileText.slice(i + 1, closeIndex)),
          source: fileText.slice(hashIndex, closeIndex + 1),
          argsSource: fileText.slice(i + 1, closeIndex),
        });
        i = closeIndex + 1;
        depth = 0;
        continue;
      }
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth = Math.max(0, depth - 1);
    }
    i++;
  }
  return matches;
}

/** Maps story title -> the verbatim `render:` value source, falling back to the whole call. */
export function extractStorySnippets(fileText: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const call of findStoryCalls(fileText)) {
    if (call.title === null) {
      continue;
    }
    const renderArg = splitTopLevelArgs(call.argsSource).find(
      (arg) => arg.key === "render",
    );
    result.set(call.title, renderArg ? renderArg.value : call.source);
  }
  return result;
}
