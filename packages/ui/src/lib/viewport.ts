import type { ViewportSpec } from "@/lib/types";

export type ViewportId = "auto" | "a4" | "a5" | "letter" | "slide" | "custom";

export const VIEWPORTS: { id: ViewportId; label: string; spec: ViewportSpec | null }[] = [
  { id: "auto", label: "Auto", spec: null },
  { id: "a4", label: "A4", spec: { paper: "a4" } },
  { id: "a5", label: "A5", spec: { paper: "a5" } },
  { id: "letter", label: "Letter", spec: { paper: "us-letter" } },
  { id: "slide", label: "Slide 16:9", spec: { paper: "presentation-16-9" } },
  { id: "custom", label: "Custom", spec: null },
];

const LENGTH = /^\d+(?:\.\d+)?(?:pt|mm|cm|in|em)$/;

export function customViewport(width: string, height: string): ViewportSpec | null {
  const nextWidth = width.trim();
  const nextHeight = height.trim();
  if (!LENGTH.test(nextWidth) || !LENGTH.test(nextHeight)) {
    return null;
  }
  return { width: nextWidth, height: nextHeight };
}

export function viewportStorageKey(): string {
  return "typstbook-viewport";
}

export function readStoredViewport(): { id: ViewportId; spec: ViewportSpec | null } {
  try {
    const raw = localStorage.getItem(viewportStorageKey());
    if (!raw) {
      return { id: "auto", spec: null };
    }
    const parsed = JSON.parse(raw) as { id?: ViewportId; spec?: ViewportSpec | null };
    const id = VIEWPORTS.some((item) => item.id === parsed.id) ? parsed.id! : "auto";
    if (id === "custom") {
      const spec = parsed.spec?.width && parsed.spec.height
        ? customViewport(parsed.spec.width, parsed.spec.height)
        : null;
      return { id, spec };
    }
    const preset = VIEWPORTS.find((item) => item.id === id);
    return { id, spec: preset?.spec ?? null };
  } catch {
    return { id: "auto", spec: null };
  }
}

export function viewportButtonLabel(id: ViewportId, spec: ViewportSpec | null): string {
  if (id === "custom" && spec?.width && spec.height) {
    return `${spec.width} × ${spec.height}`;
  }
  return VIEWPORTS.find((item) => item.id === id)?.label ?? "Auto";
}
