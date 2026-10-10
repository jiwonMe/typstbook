import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ControlsPanel, type PanelTab } from "@/components/controls-panel";
import { PreviewCanvas } from "@/components/preview-canvas";
import { ResizeHandle } from "@/components/resize-handle";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { StorySidebar } from "@/components/story-sidebar";
import { useElementSize, usePanelSize } from "@/hooks/use-panel-size";
import { useControlsPlacement } from "@/hooks/use-controls-placement";
import { useSidebarOverlay } from "@/hooks/use-sidebar-overlay";
import { useWorkbench } from "@/hooks/use-workbench";
import { cn } from "@/lib/cn";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { readZoomMode, type ZoomMode } from "@/lib/preview-fit";
import { persistSidebarCollapsed, readStoredSidebarCollapsed } from "@/lib/sidebar";

export function App() {
  const {
    state,
    selectStory,
    setArg,
    setArgs,
    setZoom,
    setViewport,
    runChecks,
    acceptSnapshot,
    openEditor,
    downloadPdf,
    readOnly,
  } = useWorkbench();
  const { placement, setPlacement } = useControlsPlacement();
  const { overlayOpen, isCompact, closeOverlay, toggleOverlay } = useSidebarOverlay();
  const [collapsed, setCollapsed] = useState(readStoredSidebarCollapsed);
  const [panelTab, setPanelTab] = useState<PanelTab>("controls");
  const [zoomMode, setZoomMode] = useState<ZoomMode>(readZoomMode);
  const sidebar = usePanelSize("sidebar", 240, 200, 400);
  const shell = useElementSize<HTMLDivElement>();
  const sidebarMax = Math.max(200, Math.min(400, shell.width - 544));
  const sidebarWidth = Math.min(sidebar.size, sidebarMax);
  const previousCollapsed = useRef(collapsed);
  useLayoutEffect(() => {
    const changed = previousCollapsed.current !== collapsed;
    previousCollapsed.current = collapsed;
    if (!changed || isCompact) return;
    document.querySelector<HTMLButtonElement>(collapsed ? "[data-sidebar-reopen]" : "[data-sidebar-collapse]")?.focus();
  }, [collapsed, isCompact]);
  const effectivePlacement = isCompact ? "bottom" : placement;
  const selected = state.stories.find((story) => story.id === state.selectedId);
  const pages = state.previewError ? state.lastGoodPages : state.pages;
  const sidebarHidden = !isCompact && collapsed;

  return (
    <div
      className={cn(/* 에디터 셸 */ "typstbook-shell")}
      ref={shell.ref}
      style={{ "--typstbook-sidebar-width": `${sidebarHidden ? 0 : sidebarWidth}px` } as CSSProperties}
    >
      <div
        data-print-hide
        data-collapsed={sidebarHidden ? "true" : undefined}
        data-overlay-open={overlayOpen ? "true" : undefined}
        className={cn(/* 왼쪽 슬롯 */ "typstbook-sidebar-slot")}
        inert={sidebarHidden || undefined}
        aria-hidden={sidebarHidden || undefined}
      >
        <StorySidebar
          stories={state.stories}
          errors={state.errors}
          selectedId={state.selectedId}
          badgeLabel={readOnly ? "static" : "local"}
          connected={state.connected}
          overlay={isCompact && overlayOpen}
          onClose={closeOverlay}
          onToggleCollapsed={() => {
            setCollapsed(true);
            persistSidebarCollapsed(true);
          }}
          onSelect={(id) => {
            closeOverlay();
            selectStory(id);
          }}
        />
        {!isCompact && !collapsed ? (
          <ResizeHandle
            label="Resize sidebar"
            controls="typstbook-stories"
            edge="right"
            value={sidebarWidth}
            min={200}
            max={sidebarMax}
            initial={sidebar.initial}
            onChange={sidebar.setSize}
            onCommit={sidebar.commit}
          />
        ) : null}
      </div>
      <div
        data-print-hide
        data-overlay-open={overlayOpen ? "true" : undefined}
        className={cn(/* 오버레이 배경 */ "typstbook-sidebar-backdrop")}
        aria-hidden
        onClick={closeOverlay}
      />
      <div inert={overlayOpen || undefined} className={cn(/* 스테이지 */ "min-h-0 min-w-0 flex-1")}>
        <WorkbenchStage
          placement={effectivePlacement}
          compact={isCompact}
          preview={
            <PreviewCanvas
              selected={selected}
              pages={pages}
              diagnostics={state.diagnostics}
              previewError={state.previewError}
              zoom={state.zoom}
              storyCount={state.stories.length}
              controlsPlacement={effectivePlacement}
              sourceOpen={panelTab === "source"}
              compact={isCompact}
              zoomMode={zoomMode}
              onZoomMode={setZoomMode}
              onZoom={setZoom}
              onControlsPlacement={setPlacement}
              onToggleSource={() => setPanelTab((tab) => tab === "source" ? "controls" : "source")}
              viewportId={state.viewportId}
              viewportSpec={state.viewport}
              readOnly={readOnly}
              onViewport={setViewport}
              onSelectMatrixCell={setArgs}
              leading={
                <SidebarToggle
                  compact={isCompact}
                  collapsed={collapsed}
                  overlayOpen={overlayOpen}
                  onToggle={toggleOverlay}
                  onExpand={() => {
                    setCollapsed(false);
                    persistSidebarCollapsed(false);
                  }}
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
              zoom={state.zoom}
              tab={panelTab}
              onTab={setPanelTab}
              onZoom={(next) => {
                setZoomMode("manual");
                setZoom(next);
              }}
              onReset={() => selected && selectStory(selected.id)}
              onChange={setArg}
              onDownloadPdf={downloadPdf}
              tokens={state.tokens}
              checks={state.checks}
              checksRunning={state.checksRunning}
              snapshotAccepting={state.snapshotAccepting}
              onRunChecks={(storyId) => {
                setPanelTab("tests");
                runChecks(storyId);
              }}
              onAcceptSnapshot={acceptSnapshot}
              problems={state.problems}
              extractErrors={state.errors}
              fonts={state.fonts}
              onOpenEditor={openEditor}
              onSelectStory={selectStory}
            />
          }
        />
      </div>
    </div>
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
  const right = usePanelSize("controls-width", 240, 220, 520);
  const bottom = usePanelSize("controls-height", 192, 128, 520);
  const vertical = placement === "right";
  const panel = vertical ? right : bottom;
  const min = vertical ? 220 : 128;
  const max = Math.max(min, Math.min(520, vertical ? stage.width - 280 : stage.height - 240));
  const size = Math.min(panel.size, max);
  return (
    <div
      className={cn(/* 미리보기와 컨트롤 */ "typstbook-stage h-full min-h-0 min-w-0")}
      ref={stage.ref}
      style={{
        display: "grid",
        gridTemplateColumns: placement === "right" ? `minmax(0, 1fr) ${size}px` : "minmax(0, 1fr)",
        gridTemplateRows: placement === "bottom" ? `minmax(0, 1fr) ${compact ? "min(192px, 35%)" : `${size}px`}` : "minmax(0, 1fr)",
      }}
    >
      <div className={cn(/* 캔버스 칸 */ "min-h-0 min-w-0")}>{preview}</div>
      <div id="typstbook-controls-panel" data-print-hide className={cn(/* 패널 칸 */ "relative min-h-0 min-w-0")}>
        {!compact ? (
          <ResizeHandle
            label="Resize controls"
            controls="typstbook-controls-panel"
            edge={vertical ? "left" : "top"}
            value={size}
            min={min}
            max={max}
            initial={panel.initial}
            onChange={panel.setSize}
            onCommit={panel.commit}
          />
        ) : null}
        {controls}
      </div>
    </div>
  );
}
