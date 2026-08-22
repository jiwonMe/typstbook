#!/usr/bin/env node
import { resolve } from "node:path";
import { initPackage } from "./init.ts";
import { Workbench } from "./session.ts";
import { requireTypstBinary } from "./typst.ts";

type Command = "dev" | "init";

function usage(): never {
  console.error("Usage: typstbook <dev|init> [dir]");
  process.exit(1);
}

function parseCommand(value: string | undefined): Command {
  switch (value) {
    case "dev":
    case "init":
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
