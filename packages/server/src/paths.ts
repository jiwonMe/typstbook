import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function firstExisting(candidates: string[], marker: string): string | null {
  for (const dir of candidates) {
    if (existsSync(join(dir, marker))) {
      return dir;
    }
  }
  return null;
}

export function resolveHelperPackageDir(): string {
  const found = firstExisting(
    [
      join(here, "..", "..", "typstbook"),
      join(here, "..", "helper"),
      join(here, "helper"),
    ],
    "typst.toml",
  );
  if (!found) {
    throw new Error("typstbook: helper package not found. Rebuild with `pnpm build`.");
  }
  return found;
}

export function resolveUiRoot(): string {
  const packaged = firstExisting([join(here, "ui")], "index.html");
  if (packaged) {
    return packaged;
  }
  const monorepo = join(here, "..", "..", "ui");
  if (
    existsSync(join(monorepo, "vite.config.ts")) ||
    existsSync(join(monorepo, "index.html"))
  ) {
    return monorepo;
  }
  throw new Error("typstbook: UI assets not found. Rebuild with `pnpm build`.");
}

export function isBuiltUi(uiRoot: string): boolean {
  return (
    existsSync(join(uiRoot, "index.html")) &&
    !existsSync(join(uiRoot, "vite.config.ts"))
  );
}
