import { Box, HStack } from "@seed-design/react";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ResizeHandle } from "@/components/resize-handle";
import { useElementSize, usePanelSize } from "@/hooks/use-panel-size";
import { ControlsPanel } from "@/components/controls-panel";
import { PreviewCanvas } from "@/components/preview-canvas";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { StorySidebar } from "@/components/story-sidebar";
import { useControlsPlacement } from "@/hooks/use-controls-placement";
import { useSidebarOverlay } from "@/hooks/use-sidebar-overlay";
import { useWorkbench } from "@/hooks/use-workbench";
import type { ControlsPlacement } from "@/lib/controls-placement";
import {
  persistSidebarCollapsed,
  readStoredSidebarCollapsed,
} from "@/lib/sidebar";
import {
  SideNavigationInset,
  SideNavigationProvider,
} from "seed-design/ui/side-navigation";

export function App() {
  const { state, selectStory, setArg, setZoom, downloadPdf, readOnly } = useWorkbench();
  const { placement, setPlacement } = useControlsPlacement();
  const { overlayOpen, isCompact, closeOverlay, toggleOverlay } = useSidebarOverlay();
  const [collapsed, setCollapsed] = useState(readStoredSidebarCollapsed);
  const sidebar = usePanelSize("sidebar", 224, 200, 400);
  const shell = useElementSize<HTMLDivElement>();
  const sidebarMax = Math.max(200, Math.min(400, shell.width - 544));
  const sidebarWidth = Math.min(sidebar.size, sidebarMax);
  const previousCollapsed = useRef(collapsed);
  useLayoutEffect(() => {
    const changed = previousCollapsed.current !== collapsed;
    previousCollapsed.current = collapsed;
    if (!changed || isCompact) return;
    document.querySelector<HTMLButtonElement>(collapsed
      ? ".typstbook-sidebar-toggle button"
      : ".typstbook-sidebar .seed-side-navigation__trigger",
    )?.focus();
  }, [collapsed, isCompact]);
  const effectivePlacement = isCompact ? "bottom" : placement;
  const selected = state.stories.find((story) => story.id === state.selectedId);
  const pages = state.previewError ? state.lastGoodPages : state.pages;

  return (
    <SideNavigationProvider
      collapsed={isCompact ? false : collapsed}
      onCollapsedChange={(next) => {
        if (isCompact) return;
        setCollapsed(next);
        persistSidebarCollapsed(next);
      }}
    >
      <HStack
        height="full"
        width="full"
        bg="bg.layerBasement"
        className="typstbook-shell"
        ref={shell.ref}
        style={{ "--typstbook-sidebar-width": `${sidebarWidth}px` } as CSSProperties}
      >
        <Box
          data-print-hide
          data-overlay-open={overlayOpen ? "true" : undefined}
          height="full"
          className="typstbook-sidebar-slot"
          inert={!isCompact && collapsed || undefined}
          aria-hidden={!isCompact && collapsed || undefined}
        >
          <StorySidebar
            stories={state.stories}
            errors={state.errors}
            selectedId={state.selectedId}
            badgeLabel={readOnly ? "static" : "local"}
            connected={state.connected}
            overlay={isCompact && overlayOpen}
            onClose={closeOverlay}
            onSelect={(id) => {
              closeOverlay();
              selectStory(id);
            }}
          />
          {!isCompact && !collapsed && <ResizeHandle label="Resize sidebar" controls="typstbook-stories"
            edge="right" value={sidebarWidth} min={200} max={sidebarMax} initial={sidebar.initial}
            onChange={sidebar.setSize} onCommit={sidebar.commit} />}
        </Box>
        <Box
          data-print-hide
          data-overlay-open={overlayOpen ? "true" : undefined}
          className="typstbook-sidebar-backdrop"
          aria-hidden
          onClick={closeOverlay}
        />
        <SideNavigationInset
          inert={overlayOpen || undefined}
          style={{ overflow: "hidden", minWidth: 0, height: "100%" }}
        >
          <WorkbenchStage
            placement={effectivePlacement}
            compact={isCompact}
            preview={
              <PreviewCanvas
                selected={selected}
                args={state.args}
                pages={pages}
                diagnostics={state.diagnostics}
                previewError={state.previewError}
                zoom={state.zoom}
                storyCount={state.stories.length}
                controlsPlacement={effectivePlacement}
                compact={isCompact}
                onZoom={setZoom}
                onControlsPlacement={setPlacement}
                onDownloadPdf={downloadPdf}
                leading={
                  <SidebarToggle
                    compact={isCompact}
                    collapsed={collapsed}
                    overlayOpen={overlayOpen}
                    onToggle={toggleOverlay}
                  />
                }
              />
            }
            controls={
              <ControlsPanel
                selected={selected}
                args={state.args}
                placement={effectivePlacement}
                readOnly={readOnly}
                onReset={() => selected && selectStory(selected.id)}
                onChange={setArg}
              />
            }
          />
        </SideNavigationInset>
      </HStack>
    </SideNavigationProvider>
  );
}

function WorkbenchStage({
  placement,
  compact,
  preview,
  controls,
}: {
  placement: ControlsPlacement;
  compact: boolean;
  preview: ReactNode;
  controls: ReactNode;
}) {
  const stage = useElementSize<HTMLDivElement>();
  const right = usePanelSize("controls-width", 264, 220, 520);
  const bottom = usePanelSize("controls-height", 192, 128, 520);
  const vertical = placement === "right";
  const panel = vertical ? right : bottom;
  const min = vertical ? 220 : 128;
  const max = Math.max(min, Math.min(520, vertical ? stage.width - 280 : stage.height - 240));
  const size = Math.min(panel.size, max);
  // Keep both panels mounted when docking changes, preserving code and input state.
  return (
    <Box
      className="typstbook-stage"
      ref={stage.ref}
      height="full"
      minWidth="0"
      minHeight="0"
      style={{
        display: "grid",
        gridTemplateColumns: placement === "right" ? `minmax(0, 1fr) ${size}px` : "minmax(0, 1fr)",
        gridTemplateRows: placement === "bottom" ? `minmax(0, 1fr) ${compact ? "min(192px, 35%)" : `${size}px`}` : "minmax(0, 1fr)",
      }}
    >
      <Box minWidth="0" minHeight="0">{preview}</Box>
      <Box id="typstbook-controls-panel" data-print-hide minWidth="0" minHeight="0" position="relative">
        {!compact && <ResizeHandle label="Resize controls" controls="typstbook-controls-panel"
          edge={vertical ? "left" : "top"} value={size} min={min} max={max} initial={panel.initial}
          onChange={panel.setSize} onCommit={panel.commit} />}
        {controls}
      </Box>
    </Box>
  );
}
