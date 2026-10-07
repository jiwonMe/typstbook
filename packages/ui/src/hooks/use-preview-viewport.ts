import { MIN_ZOOM, MAX_ZOOM } from "@/lib/preview-fit";
import { useEffect, useLayoutEffect, useRef } from "react";

type ZoomAnchor = {
  worldX: number;
  worldY: number;
  viewportX: number;
  viewportY: number;
};

export function usePreviewViewport(zoom: number, onZoom: (zoom: number) => void) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  const onZoomRef = useRef(onZoom);
  const anchorRef = useRef<ZoomAnchor | null>(null);

  zoomRef.current = zoom;
  onZoomRef.current = onZoom;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      const world = worldRef.current;
      if (!world) {
        return;
      }
      const rect = viewport.getBoundingClientRect();
      const viewportX = event.clientX - rect.left;
      const viewportY = event.clientY - rect.top;
      const current = zoomRef.current;
      // Both rectangles use viewport coordinates; offsetLeft/Top may instead
      // be relative to an ancestor outside this scroller.
      const worldRect = world.getBoundingClientRect();
      const worldX = (event.clientX - worldRect.left) / current;
      const worldY = (event.clientY - worldRect.top) / current;
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current * Math.exp(-event.deltaY * 0.01)));
      if (next === current) {
        return;
      }
      anchorRef.current = { worldX, worldY, viewportX, viewportY };
      onZoomRef.current(next);
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const viewport = viewportRef.current;
    const world = worldRef.current;
    if (!anchor || !viewport || !world) {
      return;
    }
    anchorRef.current = null;
    const viewportRect = viewport.getBoundingClientRect();
    const worldRect = world.getBoundingClientRect();
    viewport.scrollLeft += worldRect.left + anchor.worldX * zoom - viewportRect.left - anchor.viewportX;
    viewport.scrollTop += worldRect.top + anchor.worldY * zoom - viewportRect.top - anchor.viewportY;
  }, [zoom]);

  return { viewportRef, worldRef, innerRef };
}
