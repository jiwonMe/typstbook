import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  extractStorySnippets,
  findStoryCalls,
  matchBracket,
  splitTopLevelArgs,
} from "./source-extract.ts";

const examplesRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "examples",
);

describe("matchBracket", () => {
  it("finds the matching close, skipping nested brackets", () => {
    const text = "(a(b)c)d";
    assert.equal(matchBracket(text, 0), 6);
  });

  it("skips brackets inside strings", () => {
    const text = '(a "b)c" d)e';
    assert.equal(matchBracket(text, 0), text.length - 2);
  });

  it("skips brackets inside line comments", () => {
    const text = "(a // (\nb)c";
    assert.equal(matchBracket(text, 0), text.length - 2);
  });

  it("returns -1 when unterminated", () => {
    assert.equal(matchBracket("(a(b)", 0), -1);
  });
});

describe("splitTopLevelArgs", () => {
  it("splits only depth-0 commas and pairs identifier keys", () => {
    const segments = splitTopLevelArgs(
      'title: "Warning", args: (title: "주의", variant: "warning"), page: (paper: "a6")',
    );
    assert.deepEqual(
      segments.map((s) => s.key),
      ["title", "args", "page"],
    );
    assert.equal(segments[0]?.value, '"Warning"');
    assert.match(segments[1]?.value ?? "", /^\(title: "주의", variant: "warning"\)$/);
  });

  it("treats a value without an identifier prefix as positional", () => {
    const segments = splitTopLevelArgs('"bare", second: 1');
    assert.equal(segments[0]?.key, null);
    assert.equal(segments[0]?.value, '"bare"');
    assert.equal(segments[1]?.key, "second");
  });
});

describe("findStoryCalls", () => {
  it("finds both calls in callout.stories.typ without confusing the nested args.title", async () => {
    const text = await readFile(
      join(examplesRoot, "demo-pkg", "stories", "callout.stories.typ"),
      "utf8",
    );
    const calls = findStoryCalls(text);
    assert.deepEqual(
      calls.map((c) => c.title),
      ["Warning", "Info"],
    );
    assert.match(calls[0]?.argsSource ?? "", /args: \(title: "주의", variant: "warning"\)/);
  });

  it("is not confused by a raw fence containing parens and quotes", async () => {
    const text = await readFile(
      join(examplesRoot, "demo-pkg", "stories", "math.stories.typ"),
      "utf8",
    );
    const calls = findStoryCalls(text);
    assert.deepEqual(
      calls.map((c) => c.title),
      ["Numbered equation"],
    );
  });

  it("is not confused by parens inside plain string args (Korean prose)", async () => {
    const text = await readFile(
      join(examplesRoot, "kice-korean", "stories", "passage.stories.typ"),
      "utf8",
    );
    const calls = findStoryCalls(text);
    assert.deepEqual(
      calls.map((c) => c.title),
      ["단일 지문", "대응 지문"],
    );
  });
});

describe("extractStorySnippets", () => {
  it("isolates the render: value, not the whole call", async () => {
    const text = await readFile(
      join(examplesRoot, "demo-pkg", "stories", "callout.stories.typ"),
      "utf8",
    );
    const snippets = extractStorySnippets(text);
    const warning = snippets.get("Warning");
    assert.ok(warning);
    assert.match(warning ?? "", /^\(args\) => \{/);
    assert.match(
      warning ?? "",
      /callout\(title: args\.title, variant: args\.variant\)/,
    );
    assert.doesNotMatch(warning ?? "", /title: "Warning"/);
  });

  it("returns snippets keyed by every story title in a multi-story file", async () => {
    const text = await readFile(
      join(examplesRoot, "kice-korean", "stories", "question.stories.typ"),
      "utf8",
    );
    const snippets = extractStorySnippets(text);
    assert.deepEqual([...snippets.keys()], ["선지", "보기 문항"]);
  });
});
