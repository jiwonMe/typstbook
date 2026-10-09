import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type CodePanelProps = {
  code: string;
};

export function CodePanel({ code }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      // Clipboard access can be denied; the source stays visible.
    });
  };

  return (
    <div className={cn(
      /* 코드 카드 */
      "overflow-hidden rounded-[5px] bg-[var(--color-bg-secondary)]",
    )}>
      <div className={cn(
        /* 카드 헤더 */
        "flex h-8 items-center justify-between px-2",
      )}>
        <span className={cn(/* 라벨 */ "text-ui text-[var(--color-text-secondary)]")}>Typst source</span>
        <Button aria-label={copied ? "Copied" : "Copy code"} onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
      </div>
      <pre className={cn(
        /* 소스 */
        "max-h-80 overflow-auto px-2 py-2 text-left font-mono text-[11px] leading-4 whitespace-pre-wrap break-words text-[var(--color-text)]",
      )}>{code}</pre>
    </div>
  );
}
