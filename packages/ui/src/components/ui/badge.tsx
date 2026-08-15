import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
