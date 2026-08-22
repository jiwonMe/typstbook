import { spawn } from "node:child_process";
import { mkdir, readlink, rm, symlink } from "node:fs/promises";
import { delimiter, dirname, join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { resolveHelperPackageDir } from "./paths.ts";

export const HELPER_PACKAGE_VERSION = "0.1.0";
export const HELPER_PACKAGE_SPEC = `@preview/typstbook:${HELPER_PACKAGE_VERSION}`;

export const TYPST_MISSING_MESSAGE =
  "typstbook: `typst` was not found on PATH. Install Typst from https://github.com/typst/typst#installation and try again.";

export const TYPST_TOO_OLD_MESSAGE =
  "typstbook: Typst 0.15+ is required (`typst eval`). Upgrade with `brew upgrade typst` or see https://github.com/typst/typst#installation.";

export function findTypstBinary(): string | null {
  const names = process.platform === "win32" ? ["typst.exe", "typst"] : ["typst"];
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    for (const name of names) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

export function parseTypstVersion(stdout: string): { major: number; minor: number } | null {
  const match = stdout.match(/typst\s+(\d+)\.(\d+)/i);
  if (!match) {
    return null;
  }
  return { major: Number(match[1]), minor: Number(match[2]) };
}

export async function requireTypstBinary(): Promise<string> {
  const typst = findTypstBinary();
  if (!typst) {
    throw new Error(TYPST_MISSING_MESSAGE);
  }
  const versionResult = await runTypst(typst, ["--version"]);
  const version = parseTypstVersion(versionResult.stdout + versionResult.stderr);
  if (!version || (version.major === 0 && version.minor < 15)) {
    throw new Error(TYPST_TOO_OLD_MESSAGE);
  }
  return typst;
}

export function typstPackageCacheDir(): string {
  switch (process.platform) {
    case "darwin":
      return join(homedir(), "Library", "Caches", "typst", "packages");
    case "win32":
      return join(
        process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
        "typst",
        "packages",
      );
    default:
      return join(
        process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"),
        "typst",
        "packages",
      );
  }
}

export type EnsureHelperOptions = {
  /** Extra Typst package-cache root (`preview/typstbook/<version>`). */
  cacheDir?: string | null;
};

export async function linkHelperPackage(packageRoot: string): Promise<void> {
  const helperDir = resolveHelperPackageDir();
  const dest = join(packageRoot, "preview", "typstbook", HELPER_PACKAGE_VERSION);
  await mkdir(dirname(dest), { recursive: true });

  try {
    const existing = await readlink(dest);
    const resolved = resolve(dirname(dest), existing);
    if (resolved === helperDir || existing === helperDir) {
      return;
    }
  } catch {
    // Missing or not a symlink — recreate below.
  }

  await rm(dest, { recursive: true, force: true });
  try {
    await symlink(helperDir, dest);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

export async function ensureHelperPackagePath(
  options: EnsureHelperOptions = {},
): Promise<string> {
  const root = join(tmpdir(), "typstbook-packages");
  await linkHelperPackage(root);
  const cacheDir =
    options.cacheDir === undefined ? typstPackageCacheDir() : options.cacheDir;
  if (cacheDir) {
    await linkHelperPackage(cacheDir);
  }
  return root;
}

export type TypstRunResult = {
  code: number;
  stdout: string;
  stderr: string;
};

export function runTypst(
  typst: string,
  args: string[],
  stdin?: string,
): Promise<TypstRunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(typst, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
    if (stdin !== undefined) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

export function diagnosticsFromStderr(stderr: string): string[] {
  const trimmed = stderr.trim();
  return trimmed ? [trimmed] : [];
}
