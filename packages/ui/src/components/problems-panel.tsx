import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  formatDiagnosticLocation,
  type Diagnostic,
  type FontReport,
  vscodeFileUrl,
} from "@/lib/types";

type ProblemsPanelProps = {
  problems: Diagnostic[];
  extractErrors: { file: string; message: string }[];
  fonts: FontReport;
  selectedStoryId: string | null;
  readOnly: boolean;
  onOpen: (file: string, line?: number | null, column?: number | null) => void;
  onSelectStory: (storyId: string) => void;
};

export function ProblemsPanel({
  problems,
  extractErrors,
  fonts,
  selectedStoryId,
  readOnly,
  onOpen,
  onSelectStory,
}: ProblemsPanelProps) {
  const missing = fonts.referenced.filter((font) => font.status === "missing");
  const errorCount = problems.filter((item) => item.severity === "error").length
    + extractErrors.length;
  const warningCount = problems.filter((item) => item.severity === "warning").length
    + missing.length;

  return (
    <section data-testid="problems-panel" className={cn(/* 진단 */ "flex flex-col")}>
      <div className={cn(
        /* 섹션 헤더 */
        "flex h-10 items-center gap-2 border-b border-[var(--color-border)] pr-2 pl-4",
      )}>
        <span className={cn(/* 제목 */ "text-ui font-[550]")}>Problems</span>
        <span className={cn(/* 요약 */ "text-ui text-[var(--color-text-secondary)]")}>
          {errorCount + warningCount > 0
            ? `${errorCount} error${errorCount === 1 ? "" : "s"}, ${warningCount} warning${warningCount === 1 ? "" : "s"}`
            : "clean"}
        </span>
      </div>

      {extractErrors.length > 0 ? (
        <div className={cn(/* 추출 */ "border-b border-[var(--color-border)] px-4 py-3")}>
          <p className={cn(/* 라벨 */ "mb-2 text-ui font-[550]")}>Extract</p>
          <ul className={cn(/* 목록 */ "grid gap-2")}>
            {extractErrors.map((error) => (
              <li key={`${error.file}:${error.message}`}>
                <ProblemRow
                  severity="error"
                  location={error.file}
                  message={error.message}
                  file={error.file}
                  onOpen={() => onOpen(error.file)}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={cn(/* 컴파일 */ "px-4 py-3")}>
        <p className={cn(/* 라벨 */ "mb-2 text-ui font-[550]")}>Compile</p>
        {problems.length === 0 ? (
          <p className={cn(/* 빈 */ "text-ui text-[var(--color-text-secondary)]")}>
            No compile diagnostics for the current preview.
          </p>
        ) : (
          <ul className={cn(/* 목록 */ "grid gap-2")}>
            {problems.map((problem, index) => (
              <li key={`${problem.raw}:${index}`}>
                <ProblemRow
                  severity={problem.severity}
                  location={formatDiagnosticLocation(problem)}
                  message={problem.message}
                  file={problem.file}
                  line={problem.line}
                  column={problem.column}
                  storyId={problem.storyId}
                  activeStory={problem.storyId === selectedStoryId}
                  onOpen={() => {
                    if (problem.file) {
                      onOpen(problem.file, problem.line, problem.column);
                    }
                  }}
                  onStory={problem.storyId ? () => onSelectStory(problem.storyId!) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={cn(/* 글꼴 */ "border-t border-[var(--color-border)] px-4 py-3")}>
        <div className={cn(/* 헤더 */ "mb-2 flex items-center gap-2")}>
          <p className={cn(/* 라벨 */ "text-ui font-[550]")}>Fonts</p>
          <span className={cn(/* 개수 */ "text-ui text-[var(--color-text-secondary)]")}>
            {missing.length > 0 ? `${missing.length} missing` : `${fonts.referenced.length} referenced`}
          </span>
        </div>
        {fonts.fontPaths.length > 0 ? (
          <p className={cn(/* 경로 */ "mb-2 text-ui text-[var(--color-text-secondary)]")}>
            font-paths: {fonts.fontPaths.join(", ")}
          </p>
        ) : null}
        {fonts.referenced.length === 0 ? (
          <p className={cn(/* 빈 */ "text-ui text-[var(--color-text-secondary)]")}>
            No font families referenced in preview.typ, src/, or stories.
          </p>
        ) : (
          <ul className={cn(/* 목록 */ "grid gap-1.5")}>
            {fonts.referenced.map((font) => (
              <li
                key={font.family}
                className={cn(/* 줄 */ "flex items-start gap-2")}
              >
                <span
                  className={cn(
                    /* 배지 */
                    "mt-0.5 shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10px] font-[550] uppercase tracking-[0.02em]",
                    font.status === "missing"
                      ? "bg-[var(--color-bg-danger-tertiary)] text-[var(--color-text-danger)]"
                      : "bg-[var(--color-bg-success-tertiary)] text-[var(--color-text-success)]",
                  )}
                >
                  {font.status}
                </span>
                <div className={cn(/* 본문 */ "min-w-0")}>
                  <p className={cn(/* 이름 */ "truncate text-ui")}>{font.family}</p>
                  <p className={cn(/* 출처 */ "truncate text-ui text-[var(--color-text-secondary)]")}>
                    {font.sources.join(", ") || "diagnostic"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {readOnly ? (
          <p className={cn(/* 정적 */ "mt-2 text-ui text-[var(--color-text-secondary)]")}>
            Editor jump is unavailable in static builds.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ProblemRow({
  severity,
  location,
  message,
  file,
  line,
  column,
  storyId,
  activeStory,
  onOpen,
  onStory,
}: {
  severity: "error" | "warning";
  location: string;
  message: string;
  file?: string | null;
  line?: number | null;
  column?: number | null;
  storyId?: string | null;
  activeStory?: boolean;
  onOpen: () => void;
  onStory?: () => void;
}) {
  return (
    <div className={cn(/* 행 */ "grid gap-1")}>
      <div className={cn(/* 메타 */ "flex flex-wrap items-center gap-2")}>
        <span
          className={cn(
            /* 심각도 */
            "text-ui font-[550]",
            severity === "error" ? "text-[var(--color-text-danger)]" : "text-[var(--color-text-warning)]",
          )}
        >
          {severity === "error" ? "Error" : "Warning"}
        </span>
        <button
          type="button"
          className={cn(
            /* 위치 */
            "text-left text-ui text-[var(--color-text-brand)] underline-offset-2 hover:underline",
            "focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--color-border-selected)]",
          )}
          onClick={onOpen}
        >
          {location}
        </button>
        {storyId && onStory ? (
          <Button
            aria-label={`Show story ${storyId}`}
            className={cn(activeStory && "opacity-60")}
            onClick={onStory}
          >
            Story
          </Button>
        ) : null}
      </div>
      <p className={cn(/* 메시지 */ "text-ui whitespace-pre-wrap text-[var(--color-text)]")}>{message}</p>
      {file ? (
        <a
          className={cn(/* 보조 링크 */ "text-ui text-[var(--color-text-secondary)] hover:text-[var(--color-text)]")}
          href={vscodeFileUrl(file, line, column)}
        >
          Open in VS Code
        </a>
      ) : null}
    </div>
  );
}
