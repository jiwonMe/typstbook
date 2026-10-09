export type OverlayBox = { x: number; y: number; width: number; height: number };

const PT_PER: Record<string, number> = {
  pt: 1,
  mm: 72 / 25.4,
  cm: 72 / 2.54,
  in: 72,
};

export function lengthToPt(value: string): number | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)(pt|mm|cm|in)$/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * PT_PER[match[2]];
}

export function formatMm(pt: number): string {
  return `${((pt * 25.4) / 72).toFixed(1)} mm`;
}

export function pageSizeLabel(widthAttr: string, heightAttr: string): string | null {
  const width = lengthToPt(widthAttr);
  const height = lengthToPt(heightAttr);
  if (width === null || height === null) {
    return null;
  }
  return `${formatMm(width)} × ${formatMm(height)}`;
}

export function distanceMm(x1: number, y1: number, x2: number, y2: number): number {
  return (Math.hypot(x2 - x1, y2 - y1) * 25.4) / 72;
}

export function keepOutlineBox(box: OverlayBox, hasShape: boolean, inDefs: boolean): boolean {
  return !inDefs && hasShape && box.width >= 2 && box.height >= 2;
}

/** The page's own paper fill, which would otherwise outline the whole sheet. */
export function isPageFill(box: OverlayBox, pageWidth: number, pageHeight: number): boolean {
  return pageWidth > 0 && pageHeight > 0 && box.width >= pageWidth * 0.98 && box.height >= pageHeight * 0.98;
}

export function tokenSwatch(value: string): string | null {
  const match = value.match(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
  if (!match) {
    return null;
  }
  return `#${match[1]}`;
}
