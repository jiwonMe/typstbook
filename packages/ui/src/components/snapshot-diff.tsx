import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { SnapshotCompare } from "@/lib/types";

type DiffMode = "side" | "onion" | "diff";

export function SnapshotDiff({
  snapshot,
  readOnly,
  accepting,
  onAccept,
}: {
  snapshot: SnapshotCompare;
  readOnly: boolean;
  accepting: boolean;
  onAccept: () => void;
}) {
  const [mode, setMode] = useState<DiffMode>("side");
  const [opacity, setOpacity] = useState(0.5);
  const [page, setPage] = useState(0);
  const pages = Math.max(snapshot.actual.length, snapshot.expected?.length ?? 0);
  const expected = snapshot.expected?.[page] ?? null;
  const actual = snapshot.actual[page] ?? null;
  const summary = useMemo(() => summarize(snapshot), [snapshot]);

  return (
    <section data-testid="snapshot-diff" className={cn(/* diff */ "grid gap-2 border-t border-[var(--color-border)] px-4 py-3")}>
      <div className={cn(/* 헤더 */ "flex flex-wrap items-center gap-2")}>
        <p className={cn(/* 제목 */ "text-ui font-[550]")}>Snapshot diff</p>
        <span className={cn(/* 요약 */ "text-ui text-[var(--color-text-secondary)]")}>{summary}</span>
        <div className={cn(/* 모드 */ "ml-auto flex gap-1")}>
          {([
            ["side", "Side by side"],
            ["onion", "Onion skin"],
            ["diff", "Difference"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                /* 토글 */
                "h-6 rounded-[5px] px-2 text-ui",
                mode === id
                  ? "bg-[var(--color-bg-secondary)] font-[550] text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
              )}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {pages > 1 ? (
        <div className={cn(/* 쪽 */ "flex flex-wrap gap-1")}>
          {Array.from({ length: pages }, (_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                /* 쪽 버튼 */
                "h-6 rounded-[5px] px-2 text-ui",
                page === index
                  ? "bg-[var(--color-bg-secondary)] font-[550]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
                snapshot.diffPages.includes(index + 1) && "text-[var(--color-text-danger)]",
              )}
              onClick={() => setPage(index)}
            >
              Page {index + 1}
            </button>
          ))}
        </div>
      ) : null}

      {mode === "onion" ? (
        <label className={cn(/* 슬라이더 */ "flex items-center gap-2 text-ui text-[var(--color-text-secondary)]")}>
          Overlay
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
          />
        </label>
      ) : null}

      <div
        className={cn(
          /* 캔버스 */
          mode === "side" ? "grid gap-2 md:grid-cols-2" : "relative overflow-hidden rounded-[5px] bg-[var(--color-bg-secondary)] p-2",
        )}
      >
        {mode === "side" ? (
          <>
            <SvgPane label="Baseline" svg={expected} empty="No baseline yet" />
            <SvgPane label="Actual" svg={actual} empty="No actual page" />
          </>
        ) : null}
        {mode === "onion" ? (
          <div className={cn(/* 오버레이 */ "relative min-h-40")}>
            {expected ? (
              <div
                className={cn(/* 기준 */ "[&_svg]:h-auto [&_svg]:w-full")}
                dangerouslySetInnerHTML={{ __html: expected }}
              />
            ) : null}
            {actual ? (
              <div
                className={cn(/* 실제 */ "absolute inset-0 [&_svg]:h-auto [&_svg]:w-full")}
                style={{ opacity }}
                dangerouslySetInnerHTML={{ __html: actual }}
              />
            ) : null}
          </div>
        ) : null}
        {mode === "diff" ? (
          <div className={cn(/* 차이 */ "relative min-h-40")}>
            {expected ? (
              <div
                className={cn(/* 기준 */ "[&_svg]:h-auto [&_svg]:w-full")}
                dangerouslySetInnerHTML={{ __html: expected }}
              />
            ) : null}
            {actual ? (
              <div
                className={cn(
                  /* 차이 강조 */
                  "absolute inset-0 mix-blend-difference [&_svg]:h-auto [&_svg]:w-full",
                )}
                dangerouslySetInnerHTML={{ __html: actual }}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={cn(/* 액션 */ "flex items-center gap-2")}>
        <Button
          variant="primary"
          disabled={readOnly || accepting || snapshot.status === "match"}
          onClick={onAccept}
        >
          {accepting ? "Accepting" : "Accept as baseline"}
        </Button>
        <span className={cn(/* 도움 */ "text-ui text-[var(--color-text-secondary)]")}>
          Writes `__snapshots__/` for this story (same as `typstbook test --update`).
        </span>
      </div>
    </section>
  );
}

function SvgPane({ label, svg, empty }: { label: string; svg: string | null; empty: string }) {
  return (
    <div className={cn(/* 칸 */ "grid gap-1")}>
      <p className={cn(/* 라벨 */ "text-ui text-[var(--color-text-secondary)]")}>{label}</p>
      <div className={cn(/* 프레임 */ "overflow-auto rounded-[5px] bg-[var(--color-bg-secondary)] p-2")}>
        {svg ? (
          <div
            className={cn(/* svg */ "[&_svg]:h-auto [&_svg]:w-full")}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <p className={cn(/* 빈 */ "text-ui text-[var(--color-text-secondary)]")}>{empty}</p>
        )}
      </div>
    </div>
  );
}

function summarize(snapshot: SnapshotCompare): string {
  const actual = snapshot.actual.length;
  const expected = snapshot.expected?.length ?? 0;
  if (snapshot.status === "new") {
    return `${actual} page${actual === 1 ? "" : "s"} (new)`;
  }
  if (expected !== actual) {
    return `${expected} → ${actual} pages; differ: ${snapshot.diffPages.join(", ") || "—"}`;
  }
  return `${actual} page${actual === 1 ? "" : "s"}; differ: ${snapshot.diffPages.join(", ") || "none"}`;
}
