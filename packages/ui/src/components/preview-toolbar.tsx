import { useState } from "react";
import { IconButton } from "@/components/ui/button";
import { UiIcon, type IconName } from "@/components/ui/icon";
import { Popover } from "@/components/ui/popover";
import { useColorMode } from "@/hooks/use-color-mode";
import { BACKGROUNDS, type BackgroundId } from "@/lib/backgrounds";
import { cn } from "@/lib/cn";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { cycleColorMode, type ColorMode } from "@/lib/theme";
import type { ZoomMode } from "@/lib/preview-fit";
import type { ViewportSpec } from "@/lib/types";
import { customViewport, VIEWPORTS, viewportButtonLabel, type ViewportId } from "@/lib/viewport";

type PreviewToolbarProps = {
  zoom: number;
  zoomMode: ZoomMode;
  compact: boolean;
  sourceOpen: boolean;
  controlsPlacement: ControlsPlacement;
  canFitWidth: boolean;
  canFitPage: boolean;
  canPrint: boolean;
  viewportId: ViewportId;
  viewportSpec: ViewportSpec | null;
  backgroundId: BackgroundId;
  outline: boolean;
  measure: boolean;
  readOnly?: boolean;
  onZoom: (zoom: number) => void;
  onZoomMode: (mode: ZoomMode) => void;
  onPlacement: (placement: ControlsPlacement) => void;
  onToggleSource: () => void;
  onPrint: () => void;
  onViewport: (id: ViewportId, spec: ViewportSpec | null) => void;
  onBackground: (id: BackgroundId) => void;
  onCustomBackground: (color: string) => void;
  customBackground: string;
  onOutline: () => void;
  onMeasure: () => void;
};

export function PreviewToolbar(props: PreviewToolbarProps) {
  const { colorMode, setColorMode } = useColorMode();
  return (
    <div
      data-print-hide
      className={cn(
        /* 캔버스 하단 중앙 */
        "absolute bottom-3 left-1/2 z-20 flex h-12 max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center overflow-x-auto rounded-[13px] bg-[var(--color-bg)] shadow-[var(--shadow-elevation-100)]",
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
        <ViewportMenu
          id={props.viewportId}
          spec={props.viewportSpec}
          disabled={props.readOnly}
          onViewport={props.onViewport}
        />
        <BackgroundMenu
          id={props.backgroundId}
          custom={props.customBackground}
          onBackground={props.onBackground}
          onCustom={props.onCustomBackground}
        />
        <Tool label="Outline shapes" icon="outline" pressed={props.outline} onClick={props.onOutline} />
        <Tool label="Measure" icon="measure" pressed={props.measure} onClick={props.onMeasure} />
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

function ViewportMenu({
  id,
  spec,
  disabled,
  onViewport,
}: {
  id: ViewportId;
  spec: ViewportSpec | null;
  disabled?: boolean;
  onViewport: (id: ViewportId, spec: ViewportSpec | null) => void;
}) {
  return (
    <Popover
      label="Viewport"
      trigger={
        <IconButton label={`Viewport: ${viewportButtonLabel(id, spec)}`} size={32} pressed={id !== "auto"} disabled={disabled}>
          <UiIcon name="viewport" />
        </IconButton>
      }
    >
      <div className={cn(/* 프리셋 */ "grid gap-0.5")}>
        {VIEWPORTS.filter((item) => item.id !== "custom").map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={id === item.id}
            className={cn(
              /* 행 */
              "flex h-6 items-center rounded-[5px] px-2 text-left text-ui",
              id === item.id ? "bg-[var(--color-bg-menu-selected)]" : "hover:bg-[var(--color-bg-menu-selected)]",
            )}
            onClick={() => onViewport(item.id, item.spec)}
          >
            {item.label}
          </button>
        ))}
        <CustomSize id={id} spec={spec} onViewport={onViewport} />
      </div>
    </Popover>
  );
}

function CustomSize({
  id,
  spec,
  onViewport,
}: {
  id: ViewportId;
  spec: ViewportSpec | null;
  onViewport: (id: ViewportId, spec: ViewportSpec | null) => void;
}) {
  const [width, setWidth] = useState(id === "custom" ? spec?.width ?? "210mm" : "210mm");
  const [height, setHeight] = useState(id === "custom" ? spec?.height ?? "297mm" : "297mm");
  const next = customViewport(width, height);
  return (
    <form
      className={cn(/* 직접 크기 */ "grid gap-1 border-t border-[var(--color-border-menu)] pt-2")}
      onSubmit={(event) => {
        event.preventDefault();
        if (next) {
          onViewport("custom", next);
        }
      }}
    >
      <span className={cn(/* 라벨 */ "px-2 text-ui text-[var(--color-text-secondary)]")}>Custom</span>
      <div className={cn(/* 입력 */ "flex gap-1 px-1")}>
        <input aria-label="Viewport width" value={width} onChange={(event) => setWidth(event.target.value)} className={cn(/* 칸 */ "h-6 w-full rounded-[5px] bg-[var(--color-bg-secondary)] px-2 text-ui text-[var(--color-text)]")} />
        <input aria-label="Viewport height" value={height} onChange={(event) => setHeight(event.target.value)} className={cn(/* 칸 */ "h-6 w-full rounded-[5px] bg-[var(--color-bg-secondary)] px-2 text-ui text-[var(--color-text)]")} />
      </div>
      <button
        type="submit"
        disabled={!next}
        className={cn(
          /* 적용 */
          "h-6 rounded-[5px] bg-[var(--color-bg-brand)] text-ui text-[var(--color-text-onbrand)] disabled:opacity-40",
        )}
      >
        Apply
      </button>
    </form>
  );
}

function BackgroundMenu({
  id,
  custom,
  onBackground,
  onCustom,
}: {
  id: BackgroundId;
  custom: string;
  onBackground: (id: BackgroundId) => void;
  onCustom: (color: string) => void;
}) {
  return (
    <Popover
      label="Canvas background"
      trigger={
        <IconButton label={`Background: ${BACKGROUNDS.find((item) => item.id === id)?.label ?? "Canvas"}`} size={32} pressed={id !== "canvas"}>
          <UiIcon name="background" />
        </IconButton>
      }
    >
      <div className={cn(/* 배경 목록 */ "grid gap-0.5")}>
        {BACKGROUNDS.filter((item) => item.id !== "custom").map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={id === item.id}
            className={cn(
              /* 행 */
              "flex h-6 items-center rounded-[5px] px-2 text-left text-ui",
              id === item.id ? "bg-[var(--color-bg-menu-selected)]" : "hover:bg-[var(--color-bg-menu-selected)]",
            )}
            onClick={() => onBackground(item.id)}
          >
            {item.label}
          </button>
        ))}
        <label className={cn(/* 직접 색 */ "mt-1 flex h-6 items-center gap-2 border-t border-[var(--color-border-menu)] px-2 pt-1 text-ui")}>
          Custom
          <input
            aria-label="Custom canvas color"
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(custom) ? custom : "#ffffff"}
            className={cn(/* 칩 */ "ml-auto size-4 border-0 bg-transparent")}
            onChange={(event) => onCustom(event.target.value)}
          />
        </label>
      </div>
    </Popover>
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
