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
      const worldX = (viewport.scrollLeft + viewportX - world.offsetLeft) / current;
      const worldY = (viewport.scrollTop + viewportY - world.offsetTop) / current;
      const next = current * Math.exp(-event.deltaY * 0.01);
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
    viewport.scrollLeft = anchor.worldX * zoom + world.offsetLeft - anchor.viewportX;
    viewport.scrollTop = anchor.worldY * zoom + world.offsetTop - anchor.viewportY;
  }, [zoom]);

  return { viewportRef, worldRef, innerRef };
}
