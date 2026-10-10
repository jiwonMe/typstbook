import { compileStory } from "./render.ts";
import {
  diffSnapshot,
  readSnapshotPages,
  snapshotDirFor,
  writeSnapshotPages,
} from "./snapshot.ts";
import type {
  AssertionResult,
  CompileRequest,
  SnapshotCompare,
  StoryCheckRun,
  StoryChecks,
  StoryIR,
} from "./types.ts";

const PT_PER: Record<string, number> = {
  pt: 1,
  mm: 72 / 25.4,
  cm: 72 / 2.54,
  in: 72,
  em: 12,
};

export function parseChecks(value: unknown): StoryChecks | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const pages = typeof raw.pages === "number" && Number.isFinite(raw.pages) ? raw.pages : null;
  return {
    snapshot: raw.snapshot !== false,
    pages,
    width: lengthField(raw.width),
    height: lengthField(raw.height),
  };
}

function lengthField(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return lengthToPt(value) === null ? null : value.trim();
}

/** Parse a Typst length string into points. `em` is treated as 12pt. */
export function lengthToPt(value: string): number | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)(pt|mm|cm|in|em)$/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * PT_PER[match[2]];
}

export function svgPageSize(svg: string): { width: string; height: string } | null {
  const width = svg.match(/\bwidth="([^"]+)"/);
  const height = svg.match(/\bheight="([^"]+)"/);
  if (!width || !height) {
    return null;
  }
  return { width: width[1], height: height[1] };
}

function lengthsClose(actual: string, expected: string): boolean {
  const a = lengthToPt(actual);
  const b = lengthToPt(expected);
  if (a === null || b === null) {
    return actual.trim() === expected.trim();
  }
  return Math.abs(a - b) <= 0.75;
}

export function effectiveChecks(checks: StoryChecks | null): StoryChecks {
  return (
    checks ?? {
      snapshot: true,
      pages: null,
      width: null,
      height: null,
    }
  );
}

export function evaluateChecks(input: {
  checks: StoryChecks | null;
  pages: string[];
  diagnostics: string[];
  expected: string[] | null;
}): { assertions: AssertionResult[]; snapshot: SnapshotCompare | null } {
  if (input.pages.length === 0) {
    return {
      assertions: [
        {
          name: "Compiles",
          status: "fail",
          detail: input.diagnostics.join("\n") || "The story produced no pages.",
        },
      ],
      snapshot: null,
    };
  }

  const checks = effectiveChecks(input.checks);
  const results: AssertionResult[] = [];
  let snapshot: SnapshotCompare | null = null;

  if (checks.snapshot) {
    const diff = diffSnapshot(input.expected, input.pages);
    snapshot = {
      status: diff.status,
      expected: input.expected,
      actual: input.pages,
      diffPages: diff.diffPages,
    };
    if (diff.status === "match") {
      results.push({
        name: "Snapshot",
        status: "pass",
        detail: `Matches the committed snapshot (${input.pages.length} page${input.pages.length === 1 ? "" : "s"}).`,
      });
    } else if (diff.status === "new") {
      results.push({
        name: "Snapshot",
        status: "fail",
        detail: "No snapshot yet. Accept the baseline or run `typstbook test --update`.",
      });
    } else {
      results.push({
        name: "Snapshot",
        status: "fail",
        detail: diff.diffPages.length === 1
          ? `Page ${diff.diffPages[0]} differs from the snapshot.`
          : `Pages ${diff.diffPages.join(", ")} differ from the snapshot.`,
      });
    }
  }

  if (checks.pages !== null) {
    const ok = input.pages.length === checks.pages;
    results.push({
      name: "Page count",
      status: ok ? "pass" : "fail",
      detail: ok
        ? `${checks.pages} page${checks.pages === 1 ? "" : "s"}.`
        : `Expected ${checks.pages}, got ${input.pages.length}.`,
    });
  }

  const size = svgPageSize(input.pages[0] ?? "");
  if (checks.width) {
    const ok = size ? lengthsClose(size.width, checks.width) : false;
    results.push({
      name: "Page width",
      status: ok ? "pass" : "fail",
      detail: ok
        ? size!.width
        : `Expected ${checks.width}, got ${size?.width ?? "an unreadable page"}.`,
    });
  }
  if (checks.height) {
    const ok = size ? lengthsClose(size.height, checks.height) : false;
    results.push({
      name: "Page height",
      status: ok ? "pass" : "fail",
      detail: ok
        ? size!.height
        : `Expected ${checks.height}, got ${size?.height ?? "an unreadable page"}.`,
    });
  }

  if (results.length === 0) {
    results.push({
      name: "Compiles",
      status: "pass",
      detail: "No snapshot or measurement checks were declared.",
    });
  }

  return { assertions: results, snapshot };
}

export type CheckRunnerOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
  fontPaths?: string[];
};

export async function runStoryChecks(
  options: CheckRunnerOptions,
  story: StoryIR,
): Promise<StoryCheckRun> {
  const request: CompileRequest = {
    file: story.file,
    title: story.title,
    args: story.args,
    page: story.page,
  };
  const compiled = await compileStory(options, request);
  const expected =
    compiled.pages.length > 0
      ? await readSnapshotPages(snapshotDirFor(options.packageRoot, story.id))
      : null;
  const { assertions, snapshot } = evaluateChecks({
    checks: story.checks,
    pages: compiled.pages,
    diagnostics: compiled.diagnostics,
    expected,
  });
  return {
    storyId: story.id,
    file: story.file,
    title: story.title,
    status: assertions.every((item) => item.status === "pass") ? "pass" : "fail",
    assertions,
    diagnostics: compiled.diagnostics,
    snapshot,
  };
}

/** Write the latest compile as the committed baseline (= `typstbook test --update` for one story). */
export async function acceptStorySnapshot(
  options: CheckRunnerOptions,
  story: StoryIR,
): Promise<StoryCheckRun> {
  const request: CompileRequest = {
    file: story.file,
    title: story.title,
    args: story.args,
    page: story.page,
  };
  const compiled = await compileStory(options, request);
  if (compiled.pages.length === 0) {
    return {
      storyId: story.id,
      file: story.file,
      title: story.title,
      status: "fail",
      assertions: [
        {
          name: "Snapshot",
          status: "fail",
          detail: compiled.diagnostics.join("\n") || "Compile failed; nothing to accept.",
        },
      ],
      diagnostics: compiled.diagnostics,
      snapshot: null,
    };
  }
  await writeSnapshotPages(snapshotDirFor(options.packageRoot, story.id), compiled.pages);
  return runStoryChecks(options, story);
}

export async function runPackageChecks(
  options: CheckRunnerOptions,
  stories: StoryIR[],
): Promise<StoryCheckRun[]> {
  const results: StoryCheckRun[] = [];
  for (const story of stories) {
    results.push(await runStoryChecks(options, story));
  }
  return results;
}
