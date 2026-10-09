import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import {
  distanceMm,
  isPageFill,
  keepOutlineBox,
  pageSizeLabel,
  type OverlayBox,
} from "@/lib/measure";

type Point = { x: number; y: number };

function boxInView(element: Element, svg: SVGSVGElement): OverlayBox | null {
  const view = svg.viewBox.baseVal;
  const bounds = svg.getBoundingClientRect();
  const local = element.getBoundingClientRect();
  if (bounds.width === 0 || bounds.height === 0 || view.width === 0 || view.height === 0) {
    return null;
  }
  return {
    x: view.x + ((local.left - bounds.left) * view.width) / bounds.width,
    y: view.y + ((local.top - bounds.top) * view.height) / bounds.height,
    width: (local.width * view.width) / bounds.width,
    height: (local.height * view.height) / bounds.height,
  };
}

function collectBoxes(svg: SVGSVGElement): OverlayBox[] {
  const view = svg.viewBox.baseVal;
  const boxes: OverlayBox[] = [];
  const groups = [...svg.querySelectorAll("g")].filter(
    (group) => !group.closest("defs") && !group.querySelector("g"),
  );
  for (const group of groups) {
    const visual = group.querySelector("path, rect, circle, ellipse, polygon, line, use");
    if (!visual) {
      continue;
    }
    const box = boxInView(group, svg);
    if (box && keepOutlineBox(box, true, false) && !isPageFill(box, view.width, view.height)) {
      boxes.push(box);
    }
  }
  for (const shape of svg.querySelectorAll("path, rect, circle, ellipse, polygon, line")) {
    if (shape.closest("defs") || shape.closest("g")) {
      continue;
    }
    const box = boxInView(shape, svg);
    if (box && keepOutlineBox(box, true, false) && !isPageFill(box, view.width, view.height)) {
      boxes.push(box);
    }
  }
  return boxes;
}

function clientPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point | null {
  const matrix = svg.getScreenCTM();
  if (!matrix) {
    return null;
  }
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

export function PreviewPage({
  svg,
  title,
  outline,
  measure,
  dimmed,
}: {
  svg: string;
  title: string;
  outline: boolean;
  measure: boolean;
  dimmed: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState("");
  const [sizeLabel, setSizeLabel] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<OverlayBox[]>([]);
  const [hover, setHover] = useState<Point | null>(null);
  const [drag, setDrag] = useState<{ start: Point; current: Point } | null>(null);

  useLayoutEffect(() => {
    const element = hostRef.current?.querySelector("svg");
    if (!element) {
      setViewBox("");
      setBoxes([]);
      setSizeLabel(null);
      return;
    }
    setViewBox(element.getAttribute("viewBox") ?? "");
    setSizeLabel(pageSizeLabel(element.getAttribute("width") ?? "", element.getAttribute("height") ?? ""));
    setBoxes(outline ? collectBoxes(element) : []);
  }, [svg, outline]);

  const onPointer = (event: PointerEvent<SVGSVGElement>) => {
    const element = hostRef.current?.querySelector("svg");
    if (!element) {
      return;
    }
    const point = clientPoint(element, event.clientX, event.clientY);
    if (!point) {
      return;
    }
    if (event.type === "pointerdown") {
      setDrag({ start: point, current: point });
      return;
    }
    if (event.type === "pointermove") {
      setHover(point);
      setDrag((current) => (current ? { ...current, current: point } : current));
    }
  };

  return (
    <figure className={cn(/* 프레임 */ "flex flex-col items-center gap-1")}>
      <figcaption className={cn(/* 프레임 라벨 */ "text-ui text-[var(--color-text-secondary)]")}>
        {title}
        {sizeLabel ? ` · ${sizeLabel}` : ""}
      </figcaption>
      <div
        ref={hostRef}
        data-print-page
        className={cn(/* 흰 종이 */ "relative overflow-hidden bg-white shadow-[var(--shadow-elevation-100)]")}
        style={{ opacity: dimmed ? 0.4 : 1 }}
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        {viewBox && (outline || measure) ? (
          <svg
            data-print-hide
            viewBox={viewBox}
            className={cn(/* 오버레이 */ "absolute inset-0 h-full w-full", measure ? "cursor-crosshair" : "pointer-events-none")}
            onPointerDown={measure ? onPointer : undefined}
            onPointerMove={measure ? onPointer : undefined}
            onPointerUp={measure ? () => setDrag(null) : undefined}
            onPointerLeave={measure ? () => { setHover(null); setDrag(null); } : undefined}
          >
            {outline
              ? boxes.map((box, index) => (
                  <rect
                    key={index}
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    fill="rgba(13, 153, 255, 0.12)"
                    stroke="#0d99ff"
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                ))
              : null}
            {measure && hover ? (
              <g>
                <line x1={hover.x} y1={0} x2={hover.x} y2={100000} stroke="#0d99ff" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <line x1={0} y1={hover.y} x2={100000} y2={hover.y} stroke="#0d99ff" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <text x={hover.x + 6} y={hover.y - 6} fill="#0d99ff" fontSize={10}>
                  {`${distanceMm(0, 0, hover.x, 0).toFixed(1)}, ${distanceMm(0, 0, 0, hover.y).toFixed(1)} mm`}
                </text>
              </g>
            ) : null}
            {measure && drag ? (
              <g>
                <line
                  x1={drag.start.x}
                  y1={drag.start.y}
                  x2={drag.current.x}
                  y2={drag.current.y}
                  stroke="#0d99ff"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <text x={(drag.start.x + drag.current.x) / 2 + 6} y={(drag.start.y + drag.current.y) / 2} fill="#0d99ff" fontSize={11}>
                  {`${distanceMm(drag.start.x, drag.start.y, drag.current.x, drag.current.y).toFixed(1)} mm`}
                </text>
              </g>
            ) : null}
          </svg>
        ) : null}
      </div>
    </figure>
  );
}
