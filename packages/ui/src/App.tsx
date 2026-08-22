import { Box, HStack, VStack } from "@seed-design/react";
import type { ReactNode } from "react";
import { ControlsPanel } from "@/components/controls-panel";
import { PreviewCanvas } from "@/components/preview-canvas";
import { StorySidebar } from "@/components/story-sidebar";
import { useControlsPlacement } from "@/hooks/use-controls-placement";
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
  const { state, selectStory, setArg, setZoom, readOnly } = useWorkbench();
  const { placement, setPlacement } = useControlsPlacement();
  const selected = state.stories.find((story) => story.id === state.selectedId);
  const pages = state.previewError ? state.lastGoodPages : state.pages;

  return (
    <SideNavigationProvider
      defaultCollapsed={readStoredSidebarCollapsed()}
      onCollapsedChange={persistSidebarCollapsed}
    >
      <HStack height="full" width="full" bg="bg.layerBasement">
        <Box data-print-hide height="full">
          <StorySidebar
            stories={state.stories}
            errors={state.errors}
            selectedId={state.selectedId}
            badgeLabel={readOnly ? "static" : "local"}
            onSelect={(id) => selectStory(id)}
          />
        </Box>
        <SideNavigationInset
          style={{ overflow: "hidden", minWidth: 0, height: "100%" }}
        >
          <WorkbenchStage
            placement={placement}
            preview={
              <PreviewCanvas
                selected={selected}
                args={state.args}
                pages={pages}
                diagnostics={state.diagnostics}
                previewError={state.previewError}
                zoom={state.zoom}
                storyCount={state.stories.length}
                controlsPlacement={placement}
                onZoom={setZoom}
                onControlsPlacement={setPlacement}
              />
            }
            controls={
              <ControlsPanel
                selected={selected}
                args={state.args}
                placement={placement}
                readOnly={readOnly}
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
  preview,
  controls,
}: {
  placement: ControlsPlacement;
  preview: ReactNode;
  controls: ReactNode;
}) {
  switch (placement) {
    case "right":
      return (
        <HStack height="full" minWidth="0">
          <Box flexGrow minWidth="0" height="full">
            {preview}
          </Box>
          <Box
            data-print-hide
            width="300px"
            height="full"
            flexShrink={0}
            display={{ base: "none", md: "block" }}
          >
            {controls}
          </Box>
        </HStack>
      );
    case "bottom":
      return (
        <VStack height="full" minWidth="0" minHeight="0">
          <Box flexGrow minWidth="0" minHeight="0">
            {preview}
          </Box>
          <Box data-print-hide height="260px" width="full" flexShrink={0}>
            {controls}
          </Box>
        </VStack>
      );
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}
