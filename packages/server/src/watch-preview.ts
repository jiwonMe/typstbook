import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fontPathArgs } from "./config.ts";
import type { CompileResult } from "./types.ts";

export type OutputStamp = { mtimeMs: number; size: number };

export type StampedOutput = OutputStamp & { name: string };

/**
 * Pages Typst rewrote in the latest compile. A shrink from 2 pages to 1 leaves
 * the old `page-2.svg` on disk with an older mtime; those files are dropped.
 * If nothing looks newer (the compiler skipped a rewrite), keep the directory
 * as it is so a no-op compile still returns the previous pages.
 */
const SHORT_DIAG = /^.+?:\d+:\d+:\s*(error|warning):/i;

/** Keep Typst warning/error blocks and drop `typst watch` status lines. */
export function watchDiagnostics(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const short: string[] = [];
  const human: string[] = [];
  let keeping = false;
  for (const line of lines) {
    if (SHORT_DIAG.test(line)) {
      keeping = false;
      short.push(line);
      continue;
    }
    if (/^(error|warning):/.test(line)) {
      keeping = true;
      human.push(line);
      continue;
    }
    if (!keeping) {
      continue;
    }
    if (
      line.startsWith("watching ") ||
      line.startsWith("writing to ") ||
      line.includes("compiling") ||
      line.includes("compiled ")
    ) {
      keeping = false;
      continue;
    }
    if (line.trim() === "") {
      continue;
    }
    human.push(line);
  }
  if (short.length > 0) {
    return short;
  }
  return human.length > 0 ? [human.join("\n")] : [];
}

export function selectFreshNames(before: Map<string, OutputStamp>, after: StampedOutput[]): string[] {
  const fresh = after.filter((file) => {
    const prev = before.get(file.name);
    return !prev || file.mtimeMs > prev.mtimeMs || file.size !== prev.size;
  });
  const chosen = fresh.length > 0 ? fresh : after;
  return chosen
    .map((file) => file.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export type WatchPreviewOptions = {
  typst: string;
  packageRoot: string;
  packagePath: string;
  fontPaths?: string[];
};

/**
 * One long-lived `typst watch` process. Typst's incremental compiler lives in
 * that process; a fresh `typst compile` on every edit starts over. Rewriting
 * one wrapper file lets the same process pick up args, viewport, and imports.
 */
export class TypstPreviewWatch {
  private readonly options: WatchPreviewOptions;
  private child: ChildProcess | null = null;
  private dir = "";
  private wrapperPath = "";
  private writtenSource: string | null = null;
  private documentSource: string | null = null;
  private before = new Map<string, OutputStamp>();
  private busy = false;
  private idleWaiters: Array<() => void> = [];
  private reload = 0;
  private stopped = false;
  private starting: Promise<void> | null = null;
  private tail: Promise<void> = Promise.resolve();
  private stdout = "";
  private stderr = "";
  private collectingError = false;
  private errorLines: string[] = [];
  private lineQueue: Promise<void> = Promise.resolve();
  onUpdate: ((result: CompileResult) => void) | null = null;

  constructor(options: WatchPreviewOptions) {
    this.options = options;
  }

  get pid(): number | undefined {
    return this.child?.pid;
  }

  /** True when the watched wrapper already contains this document source. */
  matches(source: string): boolean {
    return source === this.documentSource;
  }

  push(source: string): Promise<void> {
    const run = this.tail.then(() => this.pushNow(source));
    this.tail = run.catch(() => undefined);
    return run;
  }

  /**
   * Recompile the current document after a dependency changes. Clears old
   * page files first so a shorter document cannot keep a stale later page.
   */
  nudge(): Promise<void> {
    const run = this.tail.then(() => this.nudgeNow());
    this.tail = run.catch(() => undefined);
    return run;
  }

  private async pushNow(source: string): Promise<void> {
    if (this.stopped) {
      return;
    }
    await this.prepareDir();
    if (source === this.documentSource && this.child) {
      return;
    }
    await this.waitIdle();
    await this.clearOutputs();
    this.documentSource = source;
    this.writtenSource = source;
    await writeFile(this.wrapperPath, source, "utf8");
    await this.ensureStarted();
  }

  private async nudgeNow(): Promise<void> {
    if (this.stopped || !this.documentSource || !this.dir) {
      return;
    }
    await this.waitIdle();
    await this.clearOutputs();
    this.reload += 1;
    const stamped = `// typstbook-reload ${this.reload}\n${this.documentSource}`;
    this.writtenSource = stamped;
    await writeFile(this.wrapperPath, stamped, "utf8");
    await this.ensureStarted();
  }

  private async prepareDir(): Promise<void> {
    if (this.dir) {
      return;
    }
    // Typst requires the watched input to live inside --root. Keep it in a
    // hidden directory the file watcher ignores so edits there do not loop.
    const hidden = join(this.options.packageRoot, ".typstbook");
    await mkdir(hidden, { recursive: true });
    this.dir = await mkdtemp(join(hidden, "preview-"));
    this.wrapperPath = join(this.dir, "wrapper.typ");
  }

  private async clearOutputs(): Promise<void> {
    this.before = new Map();
    if (!this.dir) {
      return;
    }
    let names: string[] = [];
    try {
      names = await readdir(this.dir);
    } catch {
      return;
    }
    await Promise.all(
      names.filter((name) => name.endsWith(".svg")).map((name) => rm(join(this.dir, name), { force: true })),
    );
  }

  private waitIdle(): Promise<void> {
    if (!this.busy) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.busy = false;
        resolve();
      }, 15000);
      this.idleWaiters.push(() => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  private markIdle(): void {
    this.busy = false;
    const waiters = this.idleWaiters;
    this.idleWaiters = [];
    for (const resolve of waiters) {
      resolve();
    }
  }

  private async ensureStarted(): Promise<void> {
    if (this.child || this.stopped) {
      return;
    }
    if (!this.starting) {
      this.starting = this.spawn();
    }
    await this.starting;
  }

  private async spawn(): Promise<void> {
    const child = spawn(
      this.options.typst,
      [
        "watch",
        "--diagnostic-format",
        "short",
        "--root",
        this.options.packageRoot,
        "--package-path",
        this.options.packagePath,
        ...fontPathArgs(this.options.fontPaths ?? []),
        this.wrapperPath,
        join(this.dir, "page-{p}.svg"),
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    this.child = child;
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    const pushText = (chunk: string, stream: "out" | "err") => {
      if (stream === "err") {
        this.stderr += chunk;
      }
      this.stdout += chunk;
      this.enqueueStdout();
    };
    // Status lines ("compiling", "compiled successfully") are not a stable
    // stdout/stderr split across Typst versions, so both streams are parsed.
    child.stdout.on("data", (chunk: string) => pushText(chunk, "out"));
    child.stderr.on("data", (chunk: string) => pushText(chunk, "err"));
    child.on("close", (code) => {
      if (this.child === child) {
        this.child = null;
      }
      if (!this.stopped && code !== 0 && code !== null) {
        this.emit({
          pages: [],
          diagnostics: watchDiagnostics(`${this.stderr}\n${this.stdout}`),
        });
      }
      this.markIdle();
    });
  }

  private enqueueStdout(): void {
    const lines = this.stdout.split(/\r?\n/);
    this.stdout = lines.pop() ?? "";
    for (const line of lines) {
      this.lineQueue = this.lineQueue.then(() => this.consume(line));
    }
  }

  private async consume(line: string): Promise<void> {
    if (this.collectingError) {
      if (line.startsWith("watching ")) {
        this.collectingError = false;
        const diagnostics = this.errorLines.map((item) => item.trimEnd()).filter(Boolean);
        this.errorLines = [];
        this.emit({
          pages: [],
          diagnostics: diagnostics.length > 0 ? diagnostics : ["compiled with errors"],
        });
        this.markIdle();
      } else {
        this.errorLines.push(line);
      }
      return;
    }
    if (line.includes("compiling")) {
      this.busy = true;
      if (this.before.size === 0) {
        this.before = await this.stampOutputs();
      }
      return;
    }
    // `compiled with warnings` still writes the pages. Warnings follow on stderr.
    if (line.includes("compiled successfully") || line.includes("compiled with warnings")) {
      await this.emitSuccess();
      this.stderr = "";
      this.markIdle();
      return;
    }
    if (line.includes("compiled with errors")) {
      this.collectingError = true;
      this.errorLines = [];
    }
  }

  private async stampOutputs(): Promise<Map<string, OutputStamp>> {
    const stamps = new Map<string, OutputStamp>();
    let names: string[] = [];
    try {
      names = await readdir(this.dir);
    } catch {
      return stamps;
    }
    await Promise.all(
      names
        .filter((name) => name.endsWith(".svg"))
        .map(async (name) => {
          const info = await stat(join(this.dir, name));
          stamps.set(name, { mtimeMs: info.mtimeMs, size: info.size });
        }),
    );
    return stamps;
  }

  private async emitSuccess(): Promise<void> {
    const after = await this.stampOutputs();
    const stamped: StampedOutput[] = [...after.entries()].map(([name, stamp]) => ({
      name,
      ...stamp,
    }));
    const names = selectFreshNames(this.before, stamped);
    const keep = new Set(names);
    await Promise.all(
      [...after.keys()]
        .filter((name) => !keep.has(name))
        .map((name) => rm(join(this.dir, name), { force: true })),
    );
    const pages = await Promise.all(
      names.map((name) => readFile(join(this.dir, name), "utf8")),
    );
    const warnings = watchDiagnostics(this.stderr);
    this.before = new Map(
      names.flatMap((name) => {
        const stamp = after.get(name);
        return stamp ? [[name, stamp] as const] : [];
      }),
    );
    this.emit({ pages, diagnostics: warnings });
  }

  private emit(result: CompileResult): void {
    this.onUpdate?.(result);
  }

  async stop(): Promise<void> {
    this.stopped = true;
    const child = this.child;
    this.child = null;
    if (child) {
      child.kill("SIGTERM");
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          child.kill("SIGKILL");
          resolve();
        }, 1000);
        child.once("close", () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
    if (this.dir) {
      await rm(this.dir, { recursive: true, force: true });
      this.dir = "";
    }
  }
}
