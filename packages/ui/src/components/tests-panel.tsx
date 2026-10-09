import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { StoryCheckRun, StoryIR } from "@/lib/types";

export function TestsPanel({
  selected,
  results,
  running,
  readOnly,
  onRun,
  onRunAll,
}: {
  selected: StoryIR | undefined;
  results: StoryCheckRun[];
  running: boolean;
  readOnly: boolean;
  onRun: () => void;
  onRunAll: () => void;
}) {
  const current = selected ? results.find((result) => result.storyId === selected.id) : undefined;
  const passed = results.filter((result) => result.status === "pass").length;
  return (
    <section data-testid="tests-panel" className={cn(/* 검사 */ "flex flex-col")}>
      <div className={cn(
        /* 섹션 헤더 */
        "flex h-10 items-center gap-1 border-b border-[var(--color-border)] pr-2 pl-4",
      )}>
        <span className={cn(/* 제목 */ "text-ui font-[550]")}>Tests</span>
        <span className={cn(/* 요약 */ "text-ui text-[var(--color-text-secondary)]")}>
          {results.length > 0 ? `${passed}/${results.length}` : selected?.checks ? "declared" : "snapshot"}
        </span>
        <Button className={cn(/* 실행 */ "ml-auto")} disabled={readOnly || running || !selected} onClick={onRun}>
          {running ? "Running" : "Run"}
        </Button>
        <Button disabled={readOnly || running} onClick={onRunAll}>All</Button>
      </div>
      {readOnly ? (
        <p className={cn(/* 정적 */ "px-4 pt-3 text-ui text-[var(--color-text-secondary)]")}>
          Results were baked in at build time, using each story's default arguments.
        </p>
      ) : (
        <p className={cn(/* 설명 */ "px-4 pt-3 text-ui text-[var(--color-text-secondary)]")}>
          Runs the story with its default arguments and the same snapshot diff as `typstbook test`.
        </p>
      )}
      {current ? (
        <ul className={cn(/* 결과 */ "grid gap-2 px-4 py-3")}>
          {current.assertions.map((assertion) => (
            <li key={assertion.name} className={cn(/* 단언 */ "grid gap-0.5")}>
              <div className={cn(/* 이름 줄 */ "flex items-center gap-2")}>
                <span
                  className={cn(
                    /* 상태 */
                    "text-ui font-[550]",
                    assertion.status === "pass" ? "text-[var(--color-text-success)]" : "text-[var(--color-text-danger)]",
                  )}
                >
                  {assertion.status === "pass" ? "Pass" : "Fail"}
                </span>
                <span className={cn(/* 이름 */ "text-ui")}>{assertion.name}</span>
              </div>
              <p className={cn(/* 상세 */ "text-ui whitespace-pre-wrap text-[var(--color-text-secondary)]")}>{assertion.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn(/* 아직 */ "px-4 py-3 text-ui text-[var(--color-text-secondary)]")}>
          {selected ? "Run to compare this story with its snapshot and declared checks." : "Select a story to run its checks."}
        </p>
      )}
      {results.length > 1 ? (
        <ul className={cn(/* 전체 */ "border-t border-[var(--color-border)]")}>
          {results.map((result) => (
            <li
              key={result.storyId}
              className={cn(
                /* 스토리 줄 */
                "flex h-8 items-center gap-2 px-4",
                result.storyId === selected?.id && "bg-[var(--color-bg-hover)]",
              )}
            >
              <span className={cn(
                /* 점 */
                "text-ui font-[550]",
                result.status === "pass" ? "text-[var(--color-text-success)]" : "text-[var(--color-text-danger)]",
              )}>
                {result.status === "pass" ? "Pass" : "Fail"}
              </span>
              <span className={cn(/* 제목 */ "min-w-0 flex-1 truncate text-ui")}>{result.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
