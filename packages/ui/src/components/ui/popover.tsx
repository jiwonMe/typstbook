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
  "aria-controls"?: string;
};

export function Popover({
  trigger,
  label,
  side = "top",
  width = 208,
  children,
}: {
  trigger: ReactNode;
  label: string;
  side?: "top" | "bottom";
  width?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useLayoutEffect(() => {
    const anchor = rootRef.current;
    const panel = panelRef.current;
    if (!open || !anchor) {
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const height = panel?.offsetHeight ?? 0;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    const top = side === "top"
      ? Math.max(8, rect.top - height - 8)
      : rect.bottom + 8;
    setBox({ top, left });
  }, [open, side, width]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
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
        "aria-controls": panelId,
      })
    : trigger;

  return (
    <div ref={rootRef} className={cn(/* 트리거 */ "inline-flex")}>
      {triggerNode}
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={label}
              style={{ top: box.top, left: box.left, width }}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("button")) {
                  setOpen(false);
                }
              }}
              className={cn(
                /* 어두운 팝오버 */
                "fixed z-50 rounded-[13px] bg-[var(--color-bg-menu)] p-2 text-[var(--color-text-menu)] shadow-[var(--shadow-elevation-400)]",
              )}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
