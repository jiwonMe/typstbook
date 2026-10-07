export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 8;
export type ZoomMode = "manual" | "width" | "page";

export function fitZoom(mode: Exclude<ZoomMode, "manual">, width: number, height: number, pageWidth: number, pageHeight: number): number | null {
  if (width <= 0 || pageWidth <= 0 || (mode === "page" && (height <= 0 || pageHeight <= 0))) return null;
  const zoom = mode === "width" ? width / pageWidth : Math.min(width / pageWidth, height / pageHeight);
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

export function readZoomMode(): ZoomMode {
  try {
    const value = localStorage.getItem("typstbook-zoom-mode");
    return value === "width" || value === "page" ? value : "manual";
  } catch { return "manual"; }
}
