import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ErrorCallout } from "@/components/error-callout";
import { PreviewPage } from "@/components/preview-page";
import { printPreview } from "@/components/preview-print";
import { PreviewToolbar } from "@/components/preview-toolbar";
import { cn } from "@/lib/cn";
import { canvasBackground, readStoredBackground, type BackgroundId } from "@/lib/backgrounds";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { fitZoom, type ZoomMode } from "@/lib/preview-fit";
import { usePreviewViewport } from "@/hooks/use-preview-viewport";
import type { StoryIR, ViewportSpec } from "@/lib/types";
import { type ViewportId } from "@/lib/viewport";

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
  viewportId: ViewportId;
  viewportSpec: ViewportSpec | null;
  readOnly?: boolean;
  onViewport: (id: ViewportId, spec: ViewportSpec | null) => void;
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
  viewportId,
  viewportSpec,
  readOnly = false,
  onViewport,
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
  const scrollRef = useRef({ left: 0, top: 0, storyId: selected?.id });
  const [natural, setNatural] = useState({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 });
  const storedBackground = readStoredBackground();
  const [backgroundId, setBackgroundId] = useState<BackgroundId>(storedBackground.id);
  const [customBackground, setCustomBackground] = useState(storedBackground.custom);
  const [outline, setOutline] = useState(() => {
    try { return localStorage.getItem("typstbook-outline") === "1"; } catch { return false; }
  });
  const [measure, setMeasure] = useState(() => {
    try { return localStorage.getItem("typstbook-measure") === "1"; } catch { return false; }
  });

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

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    if (scrollRef.current.storyId !== selected?.id) {
      scrollRef.current = { left: 0, top: 0, storyId: selected?.id };
      viewport.scrollTo(0, 0);
      return;
    }
    viewport.scrollTo(scrollRef.current.left, scrollRef.current.top);
  }, [pages, selected?.id, viewportRef]);

  return (
    <div className={cn(
      /* 캔버스 */
      "relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--color-fsCanvasDefaultFill)]",
    )}
    style={canvasBackground(backgroundId, customBackground)}
    >
      {leading}
      <div
        ref={viewportRef}
        data-print-root
        data-preview-scroll
        onScroll={(event) => {
          scrollRef.current = {
            left: event.currentTarget.scrollLeft,
            top: event.currentTarget.scrollTop,
            storyId: selected?.id,
          };
        }}
        className={cn(
          /* 스크롤 영역. 툴바 높이만큼 아래를 비운다 */
          "min-h-0 flex-1 overflow-auto px-4 pt-8 pb-20",
        )}
      >
        {diagnostics.length > 0 ? (
          <div data-print-hide className={cn(/* 진단 */ "mx-auto mb-4 max-w-xl")}>
            <ErrorCallout
              title={diagnostics.every((item) => /^\s*warning:/i.test(item)) ? "Compile warning" : "Compile error"}
              tone={diagnostics.every((item) => /^\s*warning:/i.test(item)) ? "warning" : "danger"}
              description={diagnostics.join("\n\n")}
            />
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
                    <PreviewPage
                      key={index}
                      svg={pageSvg}
                      title={pages.length > 1 ? `${selected?.title ?? "Page"} ${index + 1}` : selected?.title ?? "Preview"}
                      outline={outline}
                      measure={measure}
                      dimmed={previewError}
                    />
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
        viewportId={viewportId}
        viewportSpec={viewportSpec}
        readOnly={readOnly}
        onViewport={onViewport}
        backgroundId={backgroundId}
        customBackground={customBackground}
        outline={outline}
        measure={measure}
        onBackground={(id) => {
          setBackgroundId(id);
          try { localStorage.setItem("typstbook-background", JSON.stringify({ id, custom: customBackground })); } catch { /* Optional preference. */ }
        }}
        onCustomBackground={(color) => {
          setCustomBackground(color);
          setBackgroundId("custom");
          try { localStorage.setItem("typstbook-background", JSON.stringify({ id: "custom", custom: color })); } catch { /* Optional preference. */ }
        }}
        onOutline={() => {
          setOutline((value) => {
            try { localStorage.setItem("typstbook-outline", value ? "0" : "1"); } catch { /* Optional preference. */ }
            return !value;
          });
        }}
        onMeasure={() => {
          setMeasure((value) => {
            try { localStorage.setItem("typstbook-measure", value ? "0" : "1"); } catch { /* Optional preference. */ }
            return !value;
          });
        }}
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
