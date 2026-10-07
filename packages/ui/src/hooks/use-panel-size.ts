import { useLayoutEffect, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, ...size };
}

export function usePanelSize(name: string, initial: number, min: number, max: number) {
  const key = `typstbook-panel-${name}`;
  const [size, setSize] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      const value = stored === null ? initial : Number(stored);
      return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : initial;
    } catch { return initial; }
  });
  const commit = (value: number) => {
    setSize(value);
    try { localStorage.setItem(key, String(value)); } catch { /* Storage is optional. */ }
  };
  return { size, setSize, commit, initial };
}
