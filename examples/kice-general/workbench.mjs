// Package-local launcher: fonts are registered once for extraction, SVG and PDF.
import { existsSync, mkdirSync } from "node:fs";
import { dirname, delimiter, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(packageRoot, "../..");
const fontDirectory = process.env.KICE_GENERAL_FONT_DIR ?? [
  join(packageRoot, "fonts"),
  resolve(repoRoot, "../trinity-press/templates/kice-suneung/fonts"),
].find((path) => existsSync(path));
const fontPaths = [process.env.TYPST_FONT_PATHS, fontDirectory].filter(Boolean).join(delimiter);
const environment = { ...process.env, ...(fontPaths ? { TYPST_FONT_PATHS: fontPaths } : {}) };
const command = process.argv[2] ?? "dev";
const extra = process.argv.slice(3);
let executable;
let args;
if (["pdf", "pdf:a4", "pdf:math", "pdf:structures", "pdf:answers", "pdf:korean", "pdf:korean:a4", "pdf:korean:pixel"].includes(command)) {
  mkdirSync(join(packageRoot, "dist"), { recursive: true });
  executable = "typst";
  const [source, output] = {
    pdf: ["sample.typ", "minecraft.pdf"],
    "pdf:a4": ["sample.typ", "minecraft-a4.pdf"],
    "pdf:math": ["math-sample.typ", "math-stress.pdf"],
    "pdf:structures": ["structures-sample.typ", "math-structures.pdf"],
    "pdf:answers": ["answers.typ", "minecraft-answers.pdf"],
    "pdf:korean": ["korean-sample.typ", "korean-reference.pdf"],
    "pdf:korean:a4": ["korean-sample.typ", "korean-a4.pdf"],
    "pdf:korean:pixel": ["korean-pixel.typ", "korean-pixel.pdf"],
  }[command];
  args = ["compile", "--root", packageRoot, join(packageRoot, source), join(packageRoot, "dist", output),
    ...(["pdf:a4", "pdf:korean:a4"].includes(command) ? ["--input", "paper=a4"] : []), ...extra];
} else if (["dev", "test", "build"].includes(command)) {
  executable = process.execPath;
  args = ["--import", join(repoRoot, "node_modules/tsx/dist/loader.mjs"), join(repoRoot, "packages/server/src/cli.ts"), command, packageRoot, ...extra];
} else {
  throw new Error("Usage: node examples/kice-general/workbench.mjs [dev|test|build|pdf|pdf:a4|pdf:math|pdf:structures|pdf:answers|pdf:korean|pdf:korean:a4|pdf:korean:pixel] [options]");
}
const child = spawn(executable, args, { cwd: repoRoot, env: environment, stdio: "inherit" });
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
