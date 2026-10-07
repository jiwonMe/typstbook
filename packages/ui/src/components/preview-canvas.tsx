import { DownloadOutline18 } from "@/components/icons/DownloadOutline18";
import { CodeOutline18 } from "@/components/icons/CodeOutline18";
import { PrintOutline18 } from "@/components/icons/PrintOutline18";
import { MinusOutline18 } from "@/components/icons/MinusOutline18";
import { PlusOutline18 } from "@/components/icons/PlusOutline18";
import { LayoutRightOutline18 } from "@/components/icons/LayoutRightOutline18";
import { LayoutBottomOutline18 } from "@/components/icons/LayoutBottomOutline18";
import { Box, HStack, Icon, PrefixIcon, Text, VStack } from "@seed-design/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CodePanel } from "@/components/code-panel";
import { ErrorCallout } from "@/components/error-callout";
import { usePreviewViewport } from "@/hooks/use-preview-viewport";
import type { PdfDownloadResult } from "@/hooks/use-workbench";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { substituteArgs } from "@/lib/snippet";
import { shortPath, type StoryIR } from "@/lib/types";
import { ActionButton } from "seed-design/ui/action-button";

import { fitZoom, readZoomMode, type ZoomMode } from "@/lib/preview-fit";

const CONTROL_PLACEMENTS: ControlsPlacement[] = ["right", "bottom"];

type PreviewCanvasProps = {
  selected: StoryIR | undefined;
  args: Record<string, unknown>;
  pages: string[];
  diagnostics: string[];
  previewError: boolean;
  zoom: number;
  storyCount: number;
  controlsPlacement: ControlsPlacement;
  onZoom: (zoom: number) => void;
  onControlsPlacement: (placement: ControlsPlacement) => void;
  onDownloadPdf: () => Promise<PdfDownloadResult>;
  leading?: ReactNode;
  compact?: boolean;
};

export function PreviewCanvas({
  selected,
  args,
  pages,
  diagnostics,
  previewError,
  zoom,
  storyCount,
  controlsPlacement,
  onZoom,
  onControlsPlacement,
  onDownloadPdf,
  leading,
  compact = false,
}: PreviewCanvasProps) {
  const [zoomMode, setZoomMode] = useState<ZoomMode>(readZoomMode);
  const manualZoom = useCallback((next: number) => {
    setZoomMode("manual");
    onZoom(next);
  }, [onZoom]);
  const { viewportRef, worldRef, innerRef } = usePreviewViewport(zoom, manualZoom);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [natural, setNatural] = useState({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 });
  const [showCode, setShowCode] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const code =
    showCode && selected?.source
      ? substituteArgs(selected.source, args, selected.argTypes)
      : null;

  const handleDownloadPdf = async () => {
    setPdfBusy(true);
    setPdfError(null);
    const result = await onDownloadPdf();
    setPdfBusy(false);
    if (!result.ok) {
      setPdfError(result.diagnostics.join("\n"));
    }
  };

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) {
      setNatural({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 });
      return;
    }
    const measure = () => {
      const firstPage = inner.querySelector<HTMLElement>("[data-print-page]");
      setNatural({ width: inner.offsetWidth, height: inner.offsetHeight,
        pageWidth: firstPage?.offsetWidth ?? 0, pageHeight: firstPage?.offsetHeight ?? 0 });
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
      const next = fitZoom(zoomMode, width, height,
        zoomMode === "width" ? natural.width : natural.pageWidth, natural.pageHeight);
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
    // Fit page refers to the first page, including when source is open above it.
    viewport.scrollTo({ left: 0, top: viewport.scrollTop + world.getBoundingClientRect().top
      - viewport.getBoundingClientRect().top - parseFloat(getComputedStyle(viewport).paddingTop) });
  }, [zoomMode, zoom, selected?.id, viewportRef, worldRef]);

  useEffect(() => {
    viewportRef.current?.scrollTo(0, 0);
  }, [selected?.id, viewportRef]);

  useEffect(() => {
    setPdfError(null);
  }, [selected?.id]);

  return (
    <VStack height="full" minWidth="0" bg="bg.layerFill">
      <HStack
        data-print-hide
        className="typstbook-preview-header"
        align="center"
        gap="x3"
        px="x3"
        py="x1"
        bg="bg.layerDefault"
        borderBottomWidth={1}
        borderColor="stroke.neutralSubtle"
      >
        {leading}
        <Box className="typstbook-story-heading" minWidth="0">
          <Text as="p" textStyle="t2Regular" color="fg.neutralSubtle" maxLines={1}>
            {selected ? `${shortPath(selected.file)}.stories.typ` : "Workspace"}
          </Text>
          <Text as="h1" textStyle="t4Bold" color="fg.neutral" maxLines={1}>
            {selected?.title ?? "Story preview"}
          </Text>
          {selected?.description ? (
            <Text as="p" textStyle="t2Regular" color="fg.neutralMuted" maxLines={1}>
              {selected.description}
            </Text>
          ) : null}
        </Box>
        <ActionButton
          variant="neutralSolid"
          size="xsmall"
          aria-label="Save as PDF"
          title="Download a Typst PDF"
          loading={pdfBusy}
          disabled={pages.length === 0 || pdfBusy}
          onClick={handleDownloadPdf}
        >
          <PrefixIcon svg={<DownloadOutline18 />} />
          {compact ? "PDF" : "Export PDF"}
        </ActionButton>
      </HStack>

      <HStack
        data-print-hide
        className="typstbook-preview-toolbar"
        align="center"
        gap="x2"
        px="x3"
        py="x1"
        bg="bg.layerDefault"
        borderBottomWidth={1}
        borderColor="stroke.neutralSubtle"
      >
        <ToolbarGroup>
          <ActionButton variant="ghost" size="xsmall" layout="iconOnly"
            aria-label="Zoom out" title="Zoom out" onClick={() => manualZoom(zoom - 0.25)}>
            <Icon svg={<MinusOutline18 />} />
          </ActionButton>
          <ActionButton variant="ghost" size="xsmall" aria-label="Reset zoom to 100%"
            title="Reset zoom to 100%" onClick={() => manualZoom(1)}
            className="typstbook-zoom-value">
            {Math.round(zoom * 100)}%
          </ActionButton>
          <ActionButton variant="ghost" size="xsmall" layout="iconOnly"
            aria-label="Zoom in" title="Zoom in" onClick={() => manualZoom(zoom + 0.25)}>
            <Icon svg={<PlusOutline18 />} />
          </ActionButton>
          <ActionButton variant={zoomMode === "width" ? "neutralWeak" : "ghost"} size="xsmall"
            disabled={!natural.width} aria-label="Fit width" aria-pressed={zoomMode === "width"}
            title="Keep preview fitted to the available width" onClick={() => setZoomMode("width")}>
            {compact ? "Width" : "Fit width"}
          </ActionButton>
          <ActionButton variant={zoomMode === "page" ? "neutralWeak" : "ghost"} size="xsmall"
            disabled={!natural.pageWidth} aria-label="Fit page" aria-pressed={zoomMode === "page"}
            title="Keep the first page fully visible" onClick={() => setZoomMode("page")}>
            {compact ? "Page" : "Fit page"}
          </ActionButton>
        </ToolbarGroup>
        <Box flexGrow />
        <ToolbarGroup>
          <ActionButton variant={showCode ? "neutralWeak" : "ghost"} size="xsmall"
            aria-label="Show code" title="Show Typst source" aria-pressed={showCode}
            disabled={!selected?.source} onClick={() => setShowCode((prev) => !prev)}>
            <PrefixIcon svg={<CodeOutline18 />} />
            Code
          </ActionButton>
          <ActionButton variant="ghost" size="xsmall" layout="iconOnly"
            aria-label="Print preview" title="Print preview" disabled={pages.length === 0}
            onClick={() => printPreview(selected?.title, pages)}>
            <Icon svg={<PrintOutline18 />} />
          </ActionButton>
        </ToolbarGroup>
        {!compact && (
          <ToolbarGroup>
            {CONTROL_PLACEMENTS.map((placement) => (
              <ActionButton key={placement}
                variant={controlsPlacement === placement ? "neutralWeak" : "ghost"}
                size="xsmall" layout="iconOnly" aria-label={placementLabel(placement)}
                title={placementLabel(placement)} aria-pressed={controlsPlacement === placement}
                onClick={() => onControlsPlacement(placement)}>
                <PlacementIcon placement={placement} />
              </ActionButton>
            ))}
          </ToolbarGroup>
        )}
      </HStack>

      <Box
        ref={viewportRef}
        data-print-root
        className="typstbook-preview-surface"
        flexGrow
        minWidth="0"
        minHeight="0"
        px="x4"
        pt="x4"
        pb="x6"
        style={{ overflow: "auto", overscrollBehavior: "contain", touchAction: "pan-x pan-y" }}
      >
        {diagnostics.length > 0 ? (
          <Box data-print-hide width="full" maxWidth="640px" mx="auto" mb="x4">
            <ErrorCallout
              title="Compile error"
              description={diagnostics.join("\n\n")}
            />
          </Box>
        ) : null}
        {pdfError ? (
          <Box data-print-hide width="full" maxWidth="640px" mx="auto" mb="x4">
            <ErrorCallout title="PDF export failed" description={pdfError} />
          </Box>
        ) : null}
        {code !== null ? <CodePanel code={code} /> : null}
        {pages.length > 0 ? (
          <Box
            style={{
              // Grow the scrollable canvas with the scaled pages. Centering
              // inside a narrower flex row creates unreachable negative overflow.
              width: "max-content",
              minWidth: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Box
              ref={worldRef}
              className="typstbook-preview-world"
              data-print-world
              style={{
                flexShrink: 0,
                width: natural.width ? natural.width * zoom : undefined,
                height: natural.height ? natural.height * zoom : undefined,
              }}
            >
              <Box
                ref={innerRef}
                data-print-world
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  width: "max-content",
                }}
              >
                <VStack align="center" gap="x3_5">
                  {pages.map((pageSvg, index) => (
                    <Box
                      key={index}
                      data-print-page
                      data-seed-color-mode="light-only"
                      bg="bg.layerDefault"
                      borderRadius="r1"
                      className="typstbook-paper"
                      overflowX="hidden"
                      overflowY="hidden"
                      borderWidth={1}
                      borderColor="stroke.neutralSubtle"
                      style={{ opacity: previewError ? 0.4 : 1 }}
                      dangerouslySetInnerHTML={{ __html: pageSvg }}
                    />
                  ))}
                </VStack>
              </Box>
            </Box>
          </Box>
        ) : diagnostics.length === 0 ? (
          <Box data-print-hide maxWidth="360px" py="x12" px="x4" mx="auto">
            <Text
              as="p"
              textStyle="t4Regular"
              color="fg.neutralMuted"
              align="center"
            >
              {storyCount
                ? "Select a story to preview."
                : "No stories found. Add a *.stories.typ file and wait for refresh."}
            </Text>
          </Box>
        ) : null}
      </Box>
      <HStack data-print-hide className="typstbook-preview-status" justify="space-between"
        align="center" px="x3" py="x1" bg="bg.layerDefault" borderTopWidth={1}
        borderColor="stroke.neutralSubtle">
        <Text textStyle="t1Regular" color="fg.neutralSubtle">
          {previewError ? "Preview has errors" : `${pages.length} ${pages.length === 1 ? "page" : "pages"}`}
        </Text>
        <Text textStyle="t1Regular" color="fg.neutralSubtle">
          {compact ? "SVG preview" : "Ctrl / ⌘ + scroll to zoom"}
        </Text>
      </HStack>
    </VStack>
  );
}

function placementLabel(placement: ControlsPlacement): string {
  switch (placement) {
    case "right":
      return "Controls on the right";
    case "bottom":
      return "Controls on the bottom";
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}

function PlacementIcon({ placement }: { placement: ControlsPlacement }) {
  switch (placement) {
    case "right":
      return <Icon svg={<LayoutRightOutline18 />} />;
    case "bottom":
      return <Icon svg={<LayoutBottomOutline18 />} />;
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}

function printPreview(title: string | undefined, pages: string[]) {
  const previous = document.title;
  if (title) {
    document.title = title;
  }

  const size = firstPageSizePt(pages);
  const style = size ? document.createElement("style") : null;
  if (style && size) {
    style.textContent = `@page { size: ${size.width}pt ${size.height}pt; margin: 0; }`;
    document.head.appendChild(style);
  }

  window.print();

  style?.remove();
  document.title = previous;
}

function firstPageSizePt(pages: string[]): { width: number; height: number } | null {
  const svg = pages[0];
  if (!svg) {
    return null;
  }
  const width = Number(/width="([\d.]+)pt"/.exec(svg)?.[1]);
  const height = Number(/height="([\d.]+)pt"/.exec(svg)?.[1]);
  if (!width || !height) {
    return null;
  }
  return { width, height };
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return (
    <HStack className="typstbook-toolbar-group" align="center" gap="x0_5">
      {children}
    </HStack>
  );
}
