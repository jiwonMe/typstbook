import { CodePanel } from "@/components/code-panel";
import { cn } from "@/lib/cn";
import { shortPath, type StoryIR } from "@/lib/types";

export function DocsPanel({ selected }: { selected: StoryIR | undefined }) {
  if (!selected) {
    return (
      <p className={cn(/* 미선택 */ "px-4 py-6 text-ui text-[var(--color-text-secondary)]")}>
        Select a story to inspect its Autodocs.
      </p>
    );
  }
  const docs = selected.docs ?? null;
  return (
    <section data-testid="docs-panel" className={cn(/* 문서 */ "grid gap-3 px-4 py-3")}>
      <div className={cn(/* 소개 */ "grid gap-1")}>
        <p className={cn(/* 제목 */ "text-ui font-[550]")}>{docs?.name ?? selected.title}</p>
        <p className={cn(/* 설명 */ "text-ui text-[var(--color-text)]")}>
          {docs?.description || selected.description || "No description."}
        </p>
        <p className={cn(/* 경로 */ "text-ui text-[var(--color-text-secondary)]")}>
          {docs ? `${docs.module} · ${shortPath(selected.file)}` : shortPath(selected.file)}
          {docs?.returnType ? ` → ${docs.returnType}` : ""}
        </p>
      </div>

      {docs ? (
        <>
          <div className={cn(/* 시그니처 */ "grid gap-1")}>
            <p className={cn(/* 라벨 */ "text-ui font-[550]")}>Signature</p>
            <CodePanel code={docs.signature} />
          </div>
          <div className={cn(/* 파라미터 */ "grid gap-1")}>
            <p className={cn(/* 라벨 */ "text-ui font-[550]")}>Parameters</p>
            {docs.params.length === 0 ? (
              <p className={cn(/* 빈 */ "text-ui text-[var(--color-text-secondary)]")}>No parameters.</p>
            ) : (
              <table className={cn(/* 표 */ "w-full border-collapse text-left text-ui")}>
                <thead>
                  <tr className={cn(/* 헤더 */ "border-b border-[var(--color-border)] text-[var(--color-text-secondary)]")}>
                    <th className={cn(/* 셀 */ "py-1 pr-2 font-[550]")}>Name</th>
                    <th className={cn(/* 셀 */ "py-1 pr-2 font-[550]")}>Type</th>
                    <th className={cn(/* 셀 */ "py-1 pr-2 font-[550]")}>Default</th>
                    <th className={cn(/* 셀 */ "py-1 font-[550]")}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.params.map((param) => (
                    <tr key={param.name} className={cn(/* 행 */ "border-b border-[var(--color-bordertranslucent)] align-top")}>
                      <td className={cn(/* 셀 */ "py-1.5 pr-2 font-mono")}>{param.name}</td>
                      <td className={cn(/* 셀 */ "py-1.5 pr-2 text-[var(--color-text-secondary)]")}>
                        {param.type ?? (param.positional ? "content" : "—")}
                      </td>
                      <td className={cn(/* 셀 */ "py-1.5 pr-2 font-mono text-[var(--color-text-secondary)]")}>
                        {param.default ?? "—"}
                      </td>
                      <td className={cn(/* 셀 */ "py-1.5")}>{param.description ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <p className={cn(/* 없음 */ "text-ui text-[var(--color-text-secondary)]")}>
          No `#let` signature with tidy `///` docs was linked to this story yet.
        </p>
      )}
    </section>
  );
}
