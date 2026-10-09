import { cn } from "@/lib/cn";

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  tabs: { id: T; label: string }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn(/* 탭 간격 */ "flex min-w-0 items-center gap-1")}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              /* 탭 크기 */
              "h-6 shrink-0 rounded-[5px] px-2 text-ui",
              /* 선택 */
              selected
                ? "bg-[var(--color-bg-secondary)] font-[550] text-[var(--color-text)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]",
              "focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--color-border-selected)]",
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
