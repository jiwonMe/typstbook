import { cn } from "@/lib/cn";

type ErrorCalloutProps = {
  title?: string;
  description: string;
};

export function ErrorCallout({ title, description }: ErrorCalloutProps) {
  return (
    <div
      role="alert"
      className={cn(
        /* 경고 표면 */
        "rounded-[5px] bg-[var(--color-bg-danger-tertiary)] px-2 py-2 text-[var(--color-text-danger)]",
      )}
    >
      {title ? <p className={cn(/* 제목 */ "text-ui font-[550]")}>{title}</p> : null}
      <p className={cn(/* 본문 */ "text-ui whitespace-pre-wrap")}>{description}</p>
    </div>
  );
}
