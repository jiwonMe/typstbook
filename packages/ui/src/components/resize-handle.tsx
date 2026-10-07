import { useRef, useState } from "react";

type ResizeHandleProps = {
  label: string;
  controls: string;
  edge: "left" | "right" | "top";
  value: number;
  min: number;
  max: number;
  initial: number;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
};

export function ResizeHandle({ label, controls, edge, value, min, max, initial, onChange, onCommit }: ResizeHandleProps) {
  const drag = useRef<{ pointer: number; position: number; start: number; current: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const horizontal = edge === "top";
  const direction = edge === "right" ? 1 : -1;
  const clamp = (next: number) => Math.round(Math.max(min, Math.min(max, next)));
  return <div
    role="separator"
    tabIndex={0}
    aria-label={label}
    aria-controls={controls}
    aria-orientation={horizontal ? "horizontal" : "vertical"}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={Math.round(value)}
    aria-valuetext={`${Math.round(value)} pixels`}
    title={`${label} · Arrow keys to resize · Double-click to reset`}
    className="typstbook-resize-handle"
    data-edge={edge}
    data-dragging={dragging || undefined}
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { pointer: event.pointerId, position: horizontal ? event.clientY : event.clientX, start: value, current: value };
      setDragging(true);
    }}
    onPointerMove={event => {
      const active = drag.current;
      if (!active || active.pointer !== event.pointerId) return;
      active.current = clamp(active.start + ((horizontal ? event.clientY : event.clientX) - active.position) * direction);
      onChange(active.current);
    }}
    onPointerUp={event => {
      if (!drag.current) return;
      onCommit(drag.current.current);
      drag.current = null;
      setDragging(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onLostPointerCapture={() => {
      if (drag.current) onChange(drag.current.start);
      drag.current = null;
      setDragging(false);
    }}
    onDoubleClick={() => onCommit(clamp(initial))}
    onKeyDown={event => {
      if (event.key === "Escape" && drag.current) {
        onChange(drag.current.start);
        drag.current = null;
        setDragging(false);
        return;
      }
      const negative = horizontal ? "ArrowUp" : "ArrowLeft";
      const positive = horizontal ? "ArrowDown" : "ArrowRight";
      const step = event.shiftKey ? 32 : 8;
      const next = event.key === "Home" ? min : event.key === "End" ? max
        : event.key === negative ? value - step * direction
        : event.key === positive ? value + step * direction : null;
      if (next === null) return;
      event.preventDefault();
      onCommit(clamp(next));
    }}
  />;
}
