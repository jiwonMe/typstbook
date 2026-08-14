#!/usr/bin/env npx tsx
import { resolve } from "node:path";
import { Workbench } from "./session.ts";
import { requireTypstBinary } from "./typst.ts";

function usage(): never {
  console.error("Usage: typstbook dev [dir]");
  process.exit(1);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (command !== "dev") {
    usage();
  }

  await requireTypstBinary();

  const packageRoot = resolve(argv[1] ?? process.cwd());
  const workbench = new Workbench({ packageRoot });
  const url = await workbench.start();
  console.log(`typstbook dev`);
  console.log(`  package: ${packageRoot}`);
  console.log(`  local:   ${url}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
