import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type TriggerProps = {
  onClick?: () => void;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "menu";
  "aria-controls"?: string;
};

export function Menu({
  trigger,
  align = "start",
  className,
  children,
}: {
  trigger: ReactNode;
  align?: "start" | "end";
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    const anchor = rootRef.current;
    if (!open || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = 208;
    const left = align === "end"
      ? Math.max(8, rect.right - width)
      : Math.min(rect.left, window.innerWidth - width - 8);
    setBox({ top: rect.bottom + 4, left });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<TriggerProps>, {
        onClick: () => setOpen((value) => !value),
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-controls": menuId,
      })
    : trigger;

  return (
    <div ref={rootRef} className={cn(/* 트리거 기준 */ "relative inline-flex", className)}>
      {triggerNode}
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="menu"
              style={{ top: box.top, left: box.left }}
              className={cn(
                /* 항상 어두운 메뉴 */
                "fixed z-50 w-[208px] rounded-[13px] bg-[var(--color-bg-menu)] py-2 text-[var(--color-text-menu)] shadow-[var(--shadow-elevation-400)]",
              )}
            >
              <MenuCloser close={() => setOpen(false)}>{children}</MenuCloser>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function MenuCloser({ close, children }: { close: () => void; children: ReactNode }) {
  return <div onClick={close}>{children}</div>;
}

export function MenuItem({
  children,
  checked,
  onSelect,
}: {
  children: ReactNode;
  checked?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      className={cn(
        /* 행 */
        "mx-2 flex min-h-6 w-[calc(100%-16px)] items-center gap-1 rounded-[5px] px-2 text-left text-ui text-[var(--color-text-menu)]",
        /* 하이라이트 */
        "hover:bg-[var(--color-bg-menu-selected)] focus-visible:bg-[var(--color-bg-menu-selected)]",
      )}
      onClick={onSelect}
    >
      <span className={cn(/* 체크 칸 */ "w-3 shrink-0")}>{checked ? "✓" : ""}</span>
      {children}
    </button>
  );
}

export function MenuDivider() {
  return (
    <div role="separator" className={cn(/* 구분선 행 */ "flex h-4 items-center")}>
      <div className={cn(/* 선 */ "h-px w-full bg-[var(--color-border-menu)]")} />
    </div>
  );
}
