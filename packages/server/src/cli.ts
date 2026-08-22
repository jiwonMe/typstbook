#!/usr/bin/env node
import { resolve } from "node:path";
import { formatCheckReport, runCheck } from "./check.ts";
import { initPackage } from "./init.ts";
import { resolveBuiltUiRoot } from "./paths.ts";
import { Workbench } from "./session.ts";
import { buildStaticSite } from "./static-build.ts";
import { ensureHelperPackagePath, requireTypstBinary } from "./typst.ts";

type Command = "dev" | "init" | "test" | "build";

function usage(): never {
  console.error(
    "Usage: typstbook <dev|init|test|build> [dir] [--update] [--out <dir>]",
  );
  process.exit(1);
}

function parseCommand(value: string | undefined): Command {
  switch (value) {
    case "dev":
    case "init":
    case "test":
    case "build":
      return value;
    default:
      usage();
  }
}

async function runDev(args: string[]): Promise<void> {
  if (args.length > 1) {
    usage();
  }
  await requireTypstBinary();
  const packageRoot = resolve(args[0] ?? process.cwd());
  const portEnv = process.env.TYPSTBOOK_PORT;
  const port = portEnv === undefined ? undefined : Number(portEnv);
  if (port !== undefined && (!Number.isInteger(port) || port <= 0)) {
    throw new Error(`typstbook: TYPSTBOOK_PORT must be a positive integer, got ${portEnv}`);
  }
  const workbench = new Workbench({ packageRoot, port });
  const url = await workbench.start();
  console.log(`typstbook dev`);
  console.log(`  package: ${packageRoot}`);
  console.log(`  local:   ${url}`);
}

async function runInit(args: string[]): Promise<void> {
  if (args.length > 1) {
    usage();
  }
  const dirArg = args[0];
  const root = resolve(dirArg ?? process.cwd());
  const result = await initPackage(root);
  console.log(`typstbook init`);
  console.log(`  package: ${result.root}`);
  for (const file of result.created) {
    console.log(`  created  ${file}`);
  }
  for (const file of result.skipped) {
    console.log(`  skipped  ${file}`);
  }
  if (result.created.length > 0) {
    const next = dirArg === undefined ? "." : dirArg;
    console.log(`  next:    typstbook dev ${next}`);
  }
}

async function runTest(args: string[]): Promise<void> {
  let update = false;
  const rest: string[] = [];
  for (const arg of args) {
    if (arg === "--update" || arg === "-u") {
      update = true;
    } else {
      rest.push(arg);
    }
  }
  if (rest.length > 1) {
    usage();
  }
  const typst = await requireTypstBinary();
  const packageRoot = resolve(rest[0] ?? process.cwd());
  const packagePath = await ensureHelperPackagePath();
  console.log(`typstbook test`);
  console.log(`  package: ${packageRoot}`);
  const report = await runCheck({ typst, packageRoot, packagePath, update });
  for (const line of formatCheckReport(report)) {
    console.log(
      line
        .split("\n")
        .map((part) => `  ${part}`)
        .join("\n"),
    );
  }
  if (!report.ok) {
    process.exit(1);
  }
}

async function runBuild(args: string[]): Promise<void> {
  let outArg: string | undefined;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--out" || arg === "-o") {
      i++;
      outArg = args[i];
    } else {
      rest.push(arg);
    }
  }
  if (rest.length > 1 || (outArg !== undefined && outArg.length === 0)) {
    usage();
  }
  const typst = await requireTypstBinary();
  const packageRoot = resolve(rest[0] ?? process.cwd());
  const packagePath = await ensureHelperPackagePath();
  const uiRoot = resolveBuiltUiRoot();
  const outDir = resolve(outArg ?? "typstbook-static");
  console.log(`typstbook build`);
  console.log(`  package: ${packageRoot}`);
  console.log(`  out:     ${outDir}`);
  const data = await buildStaticSite({
    typst,
    packageRoot,
    packagePath,
    uiRoot,
    outDir,
  });
  const failed = data.stories.filter((story) => story.pages.length === 0);
  console.log(
    `  ${data.stories.length} stories, ${data.errors.length} file error(s), ${failed.length} compile failure(s)`,
  );
  if (data.errors.length > 0 || failed.length > 0) {
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2).filter((arg) => arg !== "--");
  const command = parseCommand(argv[0]);
  switch (command) {
    case "dev":
      await runDev(argv.slice(1));
      return;
    case "init":
      await runInit(argv.slice(1));
      return;
    case "test":
      await runTest(argv.slice(1));
      return;
    case "build":
      await runBuild(argv.slice(1));
      return;
    default: {
      const _exhaustive: never = command;
      throw new Error(`typstbook: unknown command ${String(_exhaustive)}`);
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
