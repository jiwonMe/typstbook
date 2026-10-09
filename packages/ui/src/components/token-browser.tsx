import { useState } from "react";
import { UiIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { tokenSwatch } from "@/lib/measure";
import type { PackageToken, TokenKind } from "@/lib/types";

const GROUPS: { kind: TokenKind | "other"; label: string }[] = [
  { kind: "color", label: "Colors" },
  { kind: "length", label: "Lengths" },
  { kind: "font", label: "Fonts" },
  { kind: "other", label: "Values" },
];

function inGroup(token: PackageToken, kind: TokenKind | "other"): boolean {
  if (kind === "other") {
    return token.kind !== "color" && token.kind !== "length" && token.kind !== "font";
  }
  return token.kind === kind;
}

export function TokenBrowser({ tokens }: { tokens: PackageToken[] }) {
  const [open, setOpen] = useState(true);
  return (
    <section data-testid="token-browser" className={cn(/* 토큰 섹션 */ "border-t border-[var(--color-border)]")}>
      <button
        type="button"
        className={cn(
          /* 섹션 헤더 */
          "flex h-10 w-full items-center pr-2 pl-4 text-left text-[var(--color-text)]",
        )}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn(/* 제목 */ "text-ui font-[550]")}>Tokens</span>
        <span className={cn(/* 개수 */ "ml-2 text-ui text-[var(--color-text-secondary)]")}>{tokens.length}</span>
        <span className={cn(/* 트레일 */ "ml-auto text-[var(--color-icon-secondary)]", open && "rotate-90")}>
          <UiIcon name="chevron-right-16" size={16} />
        </span>
      </button>
      {open ? (
        tokens.length === 0 ? (
          <p className={cn(/* 빈 목록 */ "px-4 pb-3 text-ui text-[var(--color-text-secondary)]")}>
            No colors, lengths, or fonts are exported from the package entrypoint or tokens.typ.
          </p>
        ) : (
          GROUPS.map((group) => {
            const rows = tokens.filter((token) => inGroup(token, group.kind));
            if (rows.length === 0) {
              return null;
            }
            return (
              <div key={group.label}>
                <div className={cn(/* 묶음 */ "flex h-6 items-center px-4 text-ui text-[var(--color-text-secondary)]")}>
                  {group.label}
                </div>
                {rows.map((token) => (
                  <TokenRow key={`${token.module}:${token.name}`} token={token} />
                ))}
              </div>
            );
          })
        )
      ) : null}
    </section>
  );
}

function TokenRow({ token }: { token: PackageToken }) {
  const swatch = token.kind === "color" ? tokenSwatch(token.value) : null;
  return (
    <div className={cn(/* 토큰 행 */ "flex h-8 items-center gap-2 pr-2 pl-4")} title={`${token.module} · ${token.value}`}>
      {swatch ? (
        <span
          aria-hidden
          className={cn(/* 색 칩 */ "size-3.5 shrink-0 rounded-[3px] border border-[var(--color-border)]")}
          style={{ backgroundColor: swatch }}
        />
      ) : (
        <span className={cn(/* 자리 */ "size-3.5 shrink-0")} />
      )}
      <span className={cn(/* 이름 */ "min-w-0 flex-1 truncate text-ui")}>{token.name}</span>
      <span className={cn(/* 값 */ "max-w-[92px] truncate text-ui text-[var(--color-text-secondary)]")}>
        {swatch ?? token.value}
      </span>
    </div>
  );
}
