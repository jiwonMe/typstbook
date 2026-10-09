import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ErrorCallout } from "@/components/error-callout";
import { printPreview } from "@/components/preview-print";
import { PreviewToolbar } from "@/components/preview-toolbar";
import { cn } from "@/lib/cn";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { fitZoom, type ZoomMode } from "@/lib/preview-fit";
import { usePreviewViewport } from "@/hooks/use-preview-viewport";
import type { StoryIR } from "@/lib/types";

type PreviewCanvasProps = {
  selected: StoryIR | undefined;
  pages: string[];
  diagnostics: string[];
  previewError: boolean;
  zoom: number;
  zoomMode: ZoomMode;
  storyCount: number;
  controlsPlacement: ControlsPlacement;
  sourceOpen: boolean;
  onZoom: (zoom: number) => void;
  onZoomMode: (mode: ZoomMode) => void;
  onControlsPlacement: (placement: ControlsPlacement) => void;
  onToggleSource: () => void;
  leading?: ReactNode;
  compact?: boolean;
};

export function PreviewCanvas({
  selected,
  pages,
  diagnostics,
  previewError,
  zoom,
  zoomMode,
  storyCount,
  controlsPlacement,
  sourceOpen,
  onZoom,
  onZoomMode,
  onControlsPlacement,
  onToggleSource,
  leading,
  compact = false,
}: PreviewCanvasProps) {
  const manualZoom = useCallback((next: number) => {
    onZoomMode("manual");
    onZoom(next);
  }, [onZoom, onZoomMode]);
  const { viewportRef, worldRef, innerRef } = usePreviewViewport(zoom, manualZoom);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [natural, setNatural] = useState({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 });

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) {
      setNatural({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 });
      return;
    }
    const measure = () => {
      const firstPage = inner.querySelector<HTMLElement>("[data-print-page]");
      setNatural({
        width: inner.offsetWidth,
        height: inner.offsetHeight,
        pageWidth: firstPage?.offsetWidth ?? 0,
        pageHeight: firstPage?.offsetHeight ?? 0,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [innerRef, pages, selected?.id]);

  useEffect(() => {
    try { localStorage.setItem("typstbook-zoom-mode", zoomMode); } catch { /* Optional preference. */ }
  }, [zoomMode]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || zoomMode === "manual") return;
    const update = () => {
      const style = getComputedStyle(viewport);
      const width = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height = viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const next = fitZoom(
        zoomMode,
        width,
        height,
        zoomMode === "width" ? natural.width : natural.pageWidth,
        natural.pageHeight,
      );
      if (next !== null && Math.abs(next - zoomRef.current) > 0.0001) onZoom(next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [zoomMode, natural, onZoom, viewportRef]);

  useLayoutEffect(() => {
    if (zoomMode !== "page") return;
    const viewport = viewportRef.current;
    const world = worldRef.current;
    if (!viewport || !world) return;
    viewport.scrollTo({
      left: 0,
      top: viewport.scrollTop + world.getBoundingClientRect().top
        - viewport.getBoundingClientRect().top - parseFloat(getComputedStyle(viewport).paddingTop),
    });
  }, [zoomMode, zoom, selected?.id, viewportRef, worldRef]);

  useEffect(() => {
    viewportRef.current?.scrollTo(0, 0);
  }, [selected?.id, viewportRef]);

  return (
    <div className={cn(
      /* 캔버스 */
      "relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--color-fsCanvasDefaultFill)]",
    )}>
      {leading}
      <div
        ref={viewportRef}
        data-print-root
        className={cn(
          /* 스크롤 영역. 툴바 높이만큼 아래를 비운다 */
          "min-h-0 flex-1 overflow-auto px-4 pt-8 pb-20",
        )}
      >
        {diagnostics.length > 0 ? (
          <div data-print-hide className={cn(/* 진단 */ "mx-auto mb-4 max-w-xl")}>
            <ErrorCallout title="Compile error" description={diagnostics.join("\n\n")} />
          </div>
        ) : null}
        {pages.length > 0 ? (
          <div className={cn(/* 가운데 정렬 */ "flex w-max min-w-full justify-center")}>
            <div
              ref={worldRef}
              data-print-world
              className={cn(/* 배율 박스 */ "shrink-0")}
              style={{
                width: natural.width ? natural.width * zoom : undefined,
                height: natural.height ? natural.height * zoom : undefined,
              }}
            >
              <div
                ref={innerRef}
                data-print-world
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: "max-content" }}
              >
                <div className={cn(/* 페이지 간격 */ "flex flex-col items-center gap-4")}>
                  {pages.map((pageSvg, index) => (
                    <figure key={index} className={cn(/* 프레임 */ "flex flex-col items-center gap-1")}>
                      <figcaption className={cn(
                        /* 프레임 라벨 */
                        "text-ui text-[var(--color-text-secondary)]",
                      )}>
                        {pages.length > 1 ? `${selected?.title ?? "Page"} ${index + 1}` : selected?.title ?? "Preview"}
                      </figcaption>
                      <div
                        data-print-page
                        className={cn(/* 흰 종이 */ "overflow-hidden bg-white shadow-[var(--shadow-elevation-100)]")}
                        style={{ opacity: previewError ? 0.4 : 1 }}
                        dangerouslySetInnerHTML={{ __html: pageSvg }}
                      />
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : diagnostics.length === 0 ? (
          <p data-print-hide className={cn(
            /* 빈 미리보기 */
            "mx-auto max-w-sm py-16 text-center text-ui text-[var(--color-text-secondary)]",
          )}>
            {storyCount ? "Select a story to preview." : "No stories found. Add a *.stories.typ file and wait for refresh."}
          </p>
        ) : null}
      </div>
      <PreviewToolbar
        zoom={zoom}
        zoomMode={zoomMode}
        compact={compact}
        sourceOpen={sourceOpen}
        controlsPlacement={controlsPlacement}
        canFitWidth={natural.width > 0}
        canFitPage={natural.pageWidth > 0}
        canPrint={pages.length > 0}
        onZoom={manualZoom}
        onZoomMode={onZoomMode}
        onPlacement={onControlsPlacement}
        onToggleSource={onToggleSource}
        onPrint={() => printPreview(selected?.title, pages)}
      />
      <div data-print-hide className={cn(/* 도움말 위치 */ "group absolute right-6 bottom-6 z-20")}>
        <button
          type="button"
          aria-label="Preview help"
          className={cn(
            /* 원형 도움말 */
            "flex size-8 items-center justify-center rounded-full bg-[var(--color-bg-tooltip)] text-title text-[var(--color-text-toolbar)] shadow-[var(--shadow-elevation-100)]",
          )}
        >
          ?
        </button>
        <div role="tooltip" className={cn(
          /* 툴팁 */
          "pointer-events-none absolute right-0 bottom-10 hidden w-[208px] rounded-[13px] bg-[var(--color-bg-tooltip)] p-2 text-ui text-[var(--color-text-menu)] shadow-[var(--shadow-elevation-300)]",
          "group-hover:block group-focus-within:block",
        )}>
          {previewError ? "Preview has errors. " : `${pages.length} ${pages.length === 1 ? "page" : "pages"}. `}
          Ctrl or ⌘ + scroll to zoom.
        </div>
      </div>
    </div>
  );
}
