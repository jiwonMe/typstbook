import { useState } from "react";
import { ArgControl } from "@/components/arg-control";
import { CodePanel } from "@/components/code-panel";
import { ProblemsPanel } from "@/components/problems-panel";
import { TestsPanel } from "@/components/tests-panel";
import { TokenBrowser } from "@/components/token-browser";
import { Button } from "@/components/ui/button";
import { UiIcon } from "@/components/ui/icon";
import { Menu, MenuDivider, MenuItem } from "@/components/ui/menu";
import { Tabs } from "@/components/ui/tabs";
import { useColorMode } from "@/hooks/use-color-mode";
import type { PdfDownloadResult } from "@/hooks/use-workbench";
import { cn } from "@/lib/cn";
import type { ControlsPlacement } from "@/lib/controls-placement";
import { substituteArgs } from "@/lib/snippet";
import {
  shortPath,
  type Diagnostic,
  type FileError,
  type FontReport,
  type PackageToken,
  type StoryCheckRun,
  type StoryIR,
} from "@/lib/types";
import { type ColorMode } from "@/lib/theme";

export type PanelTab = "controls" | "source" | "docs" | "tests" | "problems";

type ControlsPanelProps = {
  selected: StoryIR | undefined;
  args: Record<string, unknown>;
  placement: ControlsPlacement;
  readOnly?: boolean;
  zoom: number;
  tab: PanelTab;
  onTab: (tab: PanelTab) => void;
  onZoom: (zoom: number) => void;
  onReset: () => void;
  onChange: (name: string, value: unknown) => void;
  onDownloadPdf: () => Promise<PdfDownloadResult>;
  tokens: PackageToken[];
  checks: StoryCheckRun[];
  checksRunning: boolean;
  snapshotAccepting: boolean;
  onRunChecks: (storyId: string | null) => void;
  onAcceptSnapshot: (storyId: string) => void;
  problems: Diagnostic[];
  extractErrors: FileError[];
  fonts: FontReport;
  onOpenEditor: (file: string, line?: number | null, column?: number | null) => void;
  onSelectStory: (storyId: string) => void;
};

const THEMES: { id: ColorMode; label: string }[] = [
  { id: "light-only", label: "Light" },
  { id: "dark-only", label: "Dark" },
  { id: "system", label: "System" },
];

export function ControlsPanel({
  selected,
  args,
  placement,
  readOnly = false,
  zoom,
  tab,
  onTab,
  onZoom,
  onReset,
  onChange,
  onDownloadPdf,
  tokens,
  checks,
  checksRunning,
  snapshotAccepting,
  onRunChecks,
  onAcceptSnapshot,
  problems,
  extractErrors,
  fonts,
  onOpenEditor,
  onSelectStory,
}: ControlsPanelProps) {
  const { colorMode, setColorMode } = useColorMode();
  const [resetVersion, setResetVersion] = useState(0);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const argEntries = selected ? Object.entries(selected.argTypes) : [];
  const changedCount = selected
    ? Object.keys(selected.args).filter((name) => JSON.stringify(args[name]) !== JSON.stringify(selected.args[name])).length
    : 0;
  const code = selected?.source ? substituteArgs(selected.source, args, selected.argTypes) : null;
  const problemCount = problems.length
    + extractErrors.length
    + fonts.referenced.filter((font) => font.status === "missing").length;

  return (
    <section
      aria-label="Design"
      className={cn(
        /* 오른쪽 패널 */
        "flex h-full min-h-0 min-w-0 flex-col bg-[var(--color-bg)] text-[var(--color-text)]",
        placement === "right" ? "border-l border-[var(--color-bordertranslucent)]" : "border-t border-[var(--color-bordertranslucent)]",
      )}
    >
      <header className={cn(
        /* 헤더 */
        "flex flex-col gap-2 border-b border-[var(--color-border)] p-2",
      )}>
        <div className={cn(/* 액션 줄 */ "flex h-8 items-center justify-between gap-2 pl-1")}>
          <Menu
            trigger={
              <button
                type="button"
                aria-label="Appearance"
                className={cn(/* 아바타 */ "flex items-center rounded-[5px] hover:bg-[var(--color-bg-hover)]")}
              >
                <span className={cn(
                  /* 이니셜 */
                  "flex size-6 items-center justify-center rounded-full bg-[var(--color-multiplayeryellow)] text-title text-[var(--color-textonmultiplayeryellow)]",
                )}>T</span>
                <UiIcon name="chevron-down-16" className={cn(/* 보조 */ "text-[var(--color-icon-secondary)]")} />
              </button>
            }
          >
            {THEMES.map((theme) => (
              <MenuItem key={theme.id} checked={colorMode === theme.id} onSelect={() => setColorMode(theme.id)}>
                {theme.label}
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="primary"
            size="large"
            aria-label="Save as PDF"
            disabled={pdfBusy || !selected}
            onClick={() => {
              setPdfBusy(true);
              setPdfError(null);
              void onDownloadPdf().then((result) => {
                setPdfBusy(false);
                if (!result.ok) setPdfError(result.diagnostics.join("\n"));
              });
            }}
          >
            {pdfBusy ? "Exporting" : "Export PDF"}
          </Button>
        </div>
        <div className={cn(/* 탭과 배율 */ "flex flex-wrap items-center gap-1")}>
          <Tabs
            label="Inspector"
            value={tab}
            onChange={onTab}
            tabs={[
              { id: "controls", label: "Controls" },
              { id: "source", label: "Source" },
              { id: "docs", label: "Docs" },
              { id: "tests", label: "Tests" },
              { id: "problems", label: problemCount > 0 ? `Problems (${problemCount})` : "Problems" },
            ]}
          />
          <Menu
            align="end"
            className={cn(/* 배율은 오른쪽 */ "ml-auto")}
            trigger={
              <button
                type="button"
                aria-label="Zoom"
                className={cn(
                  /* 배율 컨트롤 */
                  "flex h-6 w-[60px] items-center text-ui tabular-nums text-[var(--color-text)]",
                )}
              >
                <span className={cn(/* 숫자 */ "flex-1 text-left")}>{Math.round(zoom * 100)}%</span>
                <UiIcon name="chevron-down-16" />
              </button>
            }
          >
            <MenuItem onSelect={() => onZoom(zoom + 0.25)}>Zoom in</MenuItem>
            <MenuItem onSelect={() => onZoom(zoom - 0.25)}>Zoom out</MenuItem>
            <MenuDivider />
            <MenuItem onSelect={() => onZoom(1)}>100%</MenuItem>
          </Menu>
        </div>
      </header>

      <div className={cn(/* 스크롤 */ "min-h-0 flex-1 overflow-auto")}>
        {pdfError ? <div className={cn(/* 오류 */ "px-2 pt-2")}><p className={cn("text-ui whitespace-pre-wrap text-[var(--color-text-danger)]")}>{pdfError}</p></div> : null}
        {tab === "controls" ? (
          <>
            <div className={cn(
              /* 섹션 헤더 */
              "flex h-10 items-center gap-2 border-b border-[var(--color-border)] pr-2 pl-4",
            )}>
              <span className={cn(/* 제목 */ "text-ui font-[550]")}>Arguments</span>
              <span className={cn(/* 상태 */ "text-ui text-[var(--color-text-secondary)]")}>
                {readOnly ? "Read only" : changedCount > 0 ? `${changedCount} modified` : argEntries.length}
              </span>
              <Button
                className={cn(/* 오른쪽 */ "ml-auto")}
                aria-label="Reset arguments"
                disabled={readOnly || argEntries.length === 0}
                onClick={() => {
                  setResetVersion((version) => version + 1);
                  onReset();
                }}
              >
                Reset
              </Button>
            </div>
            {selected ? (
              argEntries.length > 0 ? (
                <div className={cn(
                  /* 속성 목록 */
                  placement === "bottom" ? "flex flex-wrap items-start" : "flex flex-col",
                )}>
                  {argEntries.map(([name, argType]) => (
                    <div
                      key={`${selected.id}:${name}:${argType.control}:${resetVersion}`}
                      className={cn(placement === "bottom" ? "w-full max-w-xs min-w-[200px] flex-1" : "w-full")}
                    >
                      <ArgControl
                        name={name}
                        structured={selected.args[name] !== null && typeof selected.args[name] === "object"}
                        argType={argType}
                        value={args[name]}
                        readOnly={readOnly}
                        onChange={onChange}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cn(/* 빈 인자 */ "px-4 py-6 text-center text-ui text-[var(--color-text-secondary)]")}>
                  No editable arguments. This story uses its source as written.
                </p>
              )
            ) : (
              <p className={cn(/* 미선택 */ "px-4 py-6 text-ui text-[var(--color-text-secondary)]")}>Select a story to inspect its arguments.</p>
            )}
            <TokenBrowser tokens={tokens} />
          </>
        ) : null}
        {tab === "tests" ? (
          <TestsPanel
            selected={selected}
            results={checks}
            running={checksRunning}
            accepting={snapshotAccepting}
            readOnly={readOnly}
            onRun={() => selected && onRunChecks(selected.id)}
            onRunAll={() => onRunChecks(null)}
            onAcceptSnapshot={onAcceptSnapshot}
          />
        ) : null}
        {tab === "source" ? (
          <div className={cn(/* 소스 여백 */ "p-2")}>
            {code ? <CodePanel code={code} /> : (
              <p className={cn(/* 소스 없음 */ "px-2 py-4 text-ui text-[var(--color-text-secondary)]")}>This story has no captured source.</p>
            )}
          </div>
        ) : null}
        {tab === "docs" ? (
          <div className={cn(/* 문서 */ "grid gap-2 px-4 py-3")}>
            <p className={cn(/* 설명 */ "text-ui text-[var(--color-text)]")}>{selected?.description || "No description."}</p>
            <p className={cn(/* 경로 */ "text-ui text-[var(--color-text-secondary)]")}>{selected ? shortPath(selected.file) : "No story selected."}</p>
          </div>
        ) : null}
        {tab === "problems" ? (
          <ProblemsPanel
            problems={problems}
            extractErrors={extractErrors}
            fonts={fonts}
            selectedStoryId={selected?.id ?? null}
            readOnly={readOnly}
            onOpen={onOpenEditor}
            onSelectStory={onSelectStory}
          />
        ) : null}
      </div>
    </section>
  );
}

