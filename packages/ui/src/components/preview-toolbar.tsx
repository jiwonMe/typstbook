import { IconButton } from "@/components/ui/button";
import { UiIcon, type IconName } from "@/components/ui/icon";
import { useColorMode } from "@/hooks/use-color-mode";
import { cn } from "@/lib/cn";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { cycleColorMode, type ColorMode } from "@/lib/theme";
import type { ZoomMode } from "@/lib/preview-fit";

type PreviewToolbarProps = {
  zoom: number;
  zoomMode: ZoomMode;
  compact: boolean;
  sourceOpen: boolean;
  controlsPlacement: ControlsPlacement;
  canFitWidth: boolean;
  canFitPage: boolean;
  canPrint: boolean;
  onZoom: (zoom: number) => void;
  onZoomMode: (mode: ZoomMode) => void;
  onPlacement: (placement: ControlsPlacement) => void;
  onToggleSource: () => void;
  onPrint: () => void;
};

export function PreviewToolbar(props: PreviewToolbarProps) {
  const { colorMode, setColorMode } = useColorMode();
  return (
    <div
      data-print-hide
      className={cn(
        /* 캔버스 하단 중앙 */
        "absolute bottom-3 left-1/2 z-20 flex h-12 -translate-x-1/2 items-center overflow-hidden rounded-[13px] bg-[var(--color-bg)] shadow-[var(--shadow-elevation-100)]",
      )}
    >
      <div className={cn(/* 도구 */ "flex items-center gap-2 px-2")}>
        <Tool label="Zoom out" icon="minus" onClick={() => props.onZoom(props.zoom - 0.25)} />
        <button
          type="button"
          aria-label="Reset zoom to 100%"
          className={cn(
            /* 배율 */
            "h-6 min-w-10 rounded-[5px] px-1 text-ui tabular-nums text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]",
          )}
          onClick={() => props.onZoom(1)}
        >
          {Math.round(props.zoom * 100)}%
        </button>
        <Tool label="Zoom in" icon="plus" onClick={() => props.onZoom(props.zoom + 0.25)} />
        <Tool label="Fit width" icon="frame" pressed={props.zoomMode === "width"} disabled={!props.canFitWidth} onClick={() => props.onZoomMode(props.zoomMode === "width" ? "manual" : "width")} />
        <Tool label="Fit page" icon="rectangle" pressed={props.zoomMode === "page"} disabled={!props.canFitPage} onClick={() => props.onZoomMode(props.zoomMode === "page" ? "manual" : "page")} />
        <Tool label={themeLabel(colorMode)} icon="variable-mode" onClick={() => setColorMode(cycleColorMode(colorMode))} />
        {!props.compact ? (
          <>
            <Tool label="Controls on the right" icon="layout-right" tone="selected" pressed={props.controlsPlacement === "right"} onClick={() => props.onPlacement("right")} />
            <Tool label="Controls on the bottom" icon="layout-bottom" tone="selected" pressed={props.controlsPlacement === "bottom"} onClick={() => props.onPlacement("bottom")} />
          </>
        ) : null}
        <Tool label="Print preview" icon="print" disabled={!props.canPrint} onClick={props.onPrint} />
      </div>
      <div className={cn(
        /* 미리보기와 소스 전환 */
        "flex h-12 w-16 items-center justify-center border-l border-[var(--color-border)]",
      )}>
        <button
          type="button"
          aria-label={props.sourceOpen ? "Show controls" : "Show source"}
          aria-pressed={props.sourceOpen}
          className={cn(
            /* 스위치 */
            "relative h-6 w-10 rounded-[5px]",
            props.sourceOpen ? "bg-[var(--color-bg-brand)]" : "bg-[var(--color-bg-secondary)]",
          )}
          onClick={props.onToggleSource}
        >
          <span className={cn(
            /* 노브 */
            "absolute top-px flex size-[22px] items-center justify-center rounded-[4px] bg-[var(--color-bg)] text-[var(--color-icon)] shadow-[var(--shadow-elevation-100)]",
            props.sourceOpen ? "left-[17px]" : "left-px",
          )}>
            <UiIcon name="dev-brackets" size={16} />
          </span>
        </button>
      </div>
    </div>
  );
}

function Tool({
  label,
  icon,
  pressed,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconName;
  pressed?: boolean;
  tone?: "brand" | "selected";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <IconButton label={label} size={32} pressed={pressed} tone={tone} disabled={disabled} onClick={onClick}>
      <UiIcon name={icon} />
    </IconButton>
  );
}

function themeLabel(mode: ColorMode): string {
  switch (mode) {
    case "light-only":
      return "Theme: light. Switch theme";
    case "dark-only":
      return "Theme: dark. Switch theme";
    case "system":
      return "Theme: system. Switch theme";
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
