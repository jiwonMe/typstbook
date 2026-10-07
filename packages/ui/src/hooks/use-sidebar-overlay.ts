import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { SIDEBAR_INLINE_MIN_WIDTH } from "@/lib/sidebar";

function shellWidth(): number {
  return (
    document.querySelector<HTMLElement>(".typstbook-shell")?.clientWidth ??
    document.getElementById("root")?.clientWidth ??
    0
  );
}

export function useSidebarOverlay() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useLayoutEffect(() => {
    const shell = document.querySelector<HTMLElement>(".typstbook-shell");
    if (!shell) {
      return;
    }

    const sync = () => {
      const compact = shell.clientWidth < SIDEBAR_INLINE_MIN_WIDTH;
      setIsCompact(compact);
      if (!compact) {
        setOverlayOpen(false);
      }
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!overlayOpen) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const sidebar = document.getElementById("typstbook-stories");
    const focusable = () => [...(sidebar?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]',
    ) ?? [])].filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOverlayOpen(false);
      }
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) {
        previousFocus.focus();
      }
    };
  }, [overlayOpen]);

  const closeOverlay = useCallback(() => setOverlayOpen(false), []);
  const toggleOverlay = useCallback(() => {
    if (shellWidth() >= SIDEBAR_INLINE_MIN_WIDTH) {
      return;
    }
    setOverlayOpen((open) => !open);
  }, []);

  return { overlayOpen, isCompact, closeOverlay, toggleOverlay };
}
