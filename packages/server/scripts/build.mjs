import { chmod, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const pkg = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(pkg, "..", "..");
const uiDist = join(pkg, "..", "ui", "dist");
const helperSrc = join(pkg, "..", "typstbook");

if (!existsSync(join(uiDist, "index.html"))) {
  throw new Error("UI is not built. Run `npm run build -w @typstbook/ui` first.");
}
if (!existsSync(join(helperSrc, "typst.toml"))) {
  throw new Error(`Typst helper package not found at ${helperSrc}`);
}

await rm(join(pkg, "dist"), { recursive: true, force: true });
await rm(join(pkg, "helper"), { recursive: true, force: true });

const outfile = join(pkg, "dist/cli.js");
await build({
  entryPoints: [join(pkg, "src/cli.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
  packages: "external",
  logLevel: "info",
});

const bundled = (await readFile(outfile, "utf8")).replace(/^(#!.*\n)+/, "");
await writeFile(outfile, `#!/usr/bin/env node\n${bundled}`);

await mkdir(join(pkg, "dist/ui"), { recursive: true });
await cp(uiDist, join(pkg, "dist/ui"), { recursive: true });
await cp(helperSrc, join(pkg, "helper"), { recursive: true });
await cp(join(repo, "LICENSE"), join(pkg, "LICENSE"));
await chmod(outfile, 0o755);
