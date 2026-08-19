import {
  IconArrowUpBracketDownLine,
  IconMinusLine,
  IconPlusLine,
  IconSquareSplitedVerticalLeftLine,
} from "@karrotmarket/react-monochrome-icon";
import { Box, HStack, Icon, Text, VStack } from "@seed-design/react";
import type { ReactNode } from "react";
import { ErrorCallout } from "@/components/error-callout";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { shortPath, type StoryIR } from "@/lib/types";
import { ActionButton } from "seed-design/ui/action-button";

const CONTROL_PLACEMENTS: ControlsPlacement[] = ["right", "bottom"];

type PreviewCanvasProps = {
  selected: StoryIR | undefined;
  pages: string[];
  diagnostics: string[];
  previewError: boolean;
  zoom: number;
  storyCount: number;
  controlsPlacement: ControlsPlacement;
  onZoom: (zoom: number) => void;
  onControlsPlacement: (placement: ControlsPlacement) => void;
};

export function PreviewCanvas({
  selected,
  pages,
  diagnostics,
  previewError,
  zoom,
  storyCount,
  controlsPlacement,
  onZoom,
  onControlsPlacement,
}: PreviewCanvasProps) {
  return (
    <VStack height="full" minWidth="0" bg="bg.layerBasement">
      <HStack
        data-print-hide
        align="center"
        gap="x2"
        px="x4"
        py="x2"
        bg="bg.layerDefault"
        borderBottomWidth={1}
        borderColor="stroke.neutralSubtle"
      >
        <Box flexGrow minWidth="0">
          <Text
            as="p"
            textStyle="t2Regular"
            color="fg.neutralMuted"
            maxLines={1}
          >
            {selected ? shortPath(selected.file) : "No story selected"}
          </Text>
          <Text as="p" textStyle="t5Bold" color="fg.neutral" maxLines={1}>
            {selected?.title ?? "typstbook"}
          </Text>
        </Box>
        <ToolbarGroup>
          <ActionButton
            variant="ghost"
            size="xsmall"
            layout="iconOnly"
            aria-label="Zoom out"
            onClick={() => onZoom(zoom - 0.25)}
          >
            <Icon svg={<IconMinusLine />} />
          </ActionButton>
          <Text
            textStyle="t2Medium"
            color="fg.neutralMuted"
            style={{ minWidth: 44, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
          >
            {Math.round(zoom * 100)}%
          </Text>
          <ActionButton
            variant="ghost"
            size="xsmall"
            layout="iconOnly"
            aria-label="Zoom in"
            onClick={() => onZoom(zoom + 0.25)}
          >
            <Icon svg={<IconPlusLine />} />
          </ActionButton>
        </ToolbarGroup>
        <ToolbarGroup>
          {CONTROL_PLACEMENTS.map((placement) => {
            const selected = controlsPlacement === placement;
            return (
              <ActionButton
                key={placement}
                variant={selected ? "neutralWeak" : "ghost"}
                size="xsmall"
                layout="iconOnly"
                aria-label={placementLabel(placement)}
                aria-pressed={selected}
                onClick={() => onControlsPlacement(placement)}
              >
                <PlacementIcon placement={placement} />
              </ActionButton>
            );
          })}
        </ToolbarGroup>
        {pages.length > 0 ? (
          <ToolbarGroup>
            <Text
              textStyle="t2Medium"
              color="fg.neutralMuted"
              style={{ minWidth: 44, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
            >
              {pages.length}p
            </Text>
          </ToolbarGroup>
        ) : null}
        <ToolbarGroup>
          <ActionButton
            variant="ghost"
            size="xsmall"
            layout="iconOnly"
            aria-label="Print preview"
            disabled={pages.length === 0}
            onClick={() => printPreview(selected?.title)}
          >
            <Icon svg={<IconArrowUpBracketDownLine />} />
          </ActionButton>
        </ToolbarGroup>
      </HStack>

      <Box data-print-root flexGrow overflowY="auto" px="x6" pt="x7" pb="x10">
        <VStack align="center" gap="x3_5" width="max-content" maxWidth="full" mx="auto">
          {diagnostics.length > 0 ? (
            <Box data-print-hide width="full" maxWidth="640px">
              <ErrorCallout
                title="Compile error"
                description={diagnostics.join("\n\n")}
              />
            </Box>
          ) : null}
          {pages.length > 0 ? (
            pages.map((pageSvg, index) => (
              <Box
                key={index}
                data-print-page
                data-seed-color-mode="light-only"
                bg="bg.layerDefault"
                borderRadius="r2"
                overflowX="hidden"
                overflowY="hidden"
                borderWidth={1}
                borderColor="stroke.neutralSubtle"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  opacity: previewError ? 0.4 : 1,
                }}
                dangerouslySetInnerHTML={{ __html: pageSvg }}
              />
            ))
          ) : diagnostics.length === 0 ? (
            <Box data-print-hide maxWidth="360px" py="x12" px="x4">
              <Text
                as="p"
                textStyle="t4Regular"
                color="fg.neutralMuted"
                align="center"
              >
                {storyCount
                  ? "Select a story to preview."
                  : "No stories found. Add a *.story.typ file and wait for refresh."}
              </Text>
            </Box>
          ) : null}
        </VStack>
      </Box>
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
  const icon = <Icon svg={<IconSquareSplitedVerticalLeftLine />} />;
  switch (placement) {
    case "right":
      return <Box style={{ display: "flex", transform: "scaleX(-1)" }}>{icon}</Box>;
    case "bottom":
      return <Box style={{ display: "flex", transform: "rotate(-90deg)" }}>{icon}</Box>;
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}

function printPreview(title: string | undefined) {
  const previous = document.title;
  if (title) {
    document.title = title;
  }
  window.print();
  document.title = previous;
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return (
    <HStack
      align="center"
      gap="x1"
      px="x1"
      py="x1"
      borderWidth={1}
      borderColor="stroke.neutralMuted"
      borderRadius="r2"
      bg="bg.layerFill"
    >
      {children}
    </HStack>
  );
}
