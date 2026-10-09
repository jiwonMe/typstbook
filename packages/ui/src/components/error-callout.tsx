import { cn } from "@/lib/cn";

type ErrorCalloutProps = {
  title?: string;
  description: string;
  tone?: "danger" | "warning";
};

export function ErrorCallout({ title, description, tone = "danger" }: ErrorCalloutProps) {
  return (
    <div
      role="alert"
      className={cn(
        /* 경고 표면 */
        "rounded-[5px] px-2 py-2",
        tone === "warning"
          ? "bg-[var(--color-bg-warning-tertiary)] text-[var(--color-text-warning)]"
          : "bg-[var(--color-bg-danger-tertiary)] text-[var(--color-text-danger)]",
      )}
    >
      {title ? <p className={cn(/* 제목 */ "text-ui font-[550]")}>{title}</p> : null}
      <p className={cn(/* 본문 */ "text-ui whitespace-pre-wrap")}>{description}</p>
    </div>
  );
}
