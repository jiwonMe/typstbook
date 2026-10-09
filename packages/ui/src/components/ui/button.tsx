import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
};

export function Button({
  variant = "ghost",
  size = "default",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        /* 기본 글자와 모서리 */
        "inline-flex items-center justify-center gap-1 rounded-[5px] text-ui whitespace-nowrap text-[var(--color-text)]",
        /* 높이 */
        size === "large" ? "h-8 px-3" : "h-6 px-2",
        /* 채움 */
        variant === "primary" &&
          "bg-[var(--color-bg-brand)] text-[var(--color-text-onbrand)] hover:bg-[var(--color-bg-brand-hover)]",
        variant === "secondary" && "border border-[var(--color-bordertranslucent)] bg-transparent",
        variant === "ghost" && "bg-transparent hover:bg-[var(--color-bgtransparent-secondary-hover)]",
        /* 비활성과 포커스 */
        "disabled:cursor-not-allowed disabled:bg-[var(--color-bg-disabled)] disabled:text-[var(--color-text-ondisabled)]",
        "focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--color-border-selected)]",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  label,
  pressed,
  tone = "brand",
  size = 24,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  pressed?: boolean;
  tone?: "brand" | "selected";
  size?: 24 | 32;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={props.title ?? label}
      aria-pressed={pressed}
      className={cn(
        /* 정사각 히트 영역 */
        "inline-flex shrink-0 items-center justify-center rounded-[5px] text-[var(--color-icon)]",
        size === 32 ? "size-8" : "size-6",
        /* 상태 */
        pressed && tone === "brand" && "bg-[var(--color-bg-brand)] text-[var(--color-icon-onbrand)]",
        pressed && tone === "selected" && "bg-[var(--color-bg-selected)] text-[var(--color-icon)]",
        !pressed && "hover:bg-[var(--color-bghovertransparent)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--color-border-selected)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
