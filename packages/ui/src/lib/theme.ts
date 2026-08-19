export type ColorMode = "system" | "light-only" | "dark-only";

export const COLOR_MODE_STORAGE_KEY = "typstbook-color-mode";

export function isColorMode(value: string | null | undefined): value is ColorMode {
  return value === "system" || value === "light-only" || value === "dark-only";
}

export function readStoredColorMode(): ColorMode | null {
  try {
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return isColorMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function readColorMode(): ColorMode {
  if (typeof document === "undefined") {
    return "system";
  }
  const fromDom = document.documentElement.dataset.seedColorMode;
  if (isColorMode(fromDom)) {
    return fromDom;
  }
  return readStoredColorMode() ?? "system";
}

export function applyColorMode(mode: ColorMode): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.seedColorMode = mode;
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    const scheme =
      mode === "light-only" ? "light" : mode === "dark-only" ? "dark" : "light dark";
    meta.setAttribute("content", scheme);
  }
}

export function persistColorMode(mode: ColorMode): void {
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // Private mode and quota errors should not block the live theme change.
  }
  applyColorMode(mode);
}

export function applyStoredColorMode(): void {
  const stored = readStoredColorMode();
  if (stored) {
    applyColorMode(stored);
  }
}

export function cycleColorMode(mode: ColorMode): ColorMode {
  switch (mode) {
    case "light-only":
      return "dark-only";
    case "dark-only":
      return "system";
    case "system":
      return "light-only";
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
