import { useCallback, useEffect, useState } from "react";
import {
  applyColorMode,
  persistColorMode,
  readColorMode,
  type ColorMode,
} from "@/lib/theme";

export function useColorMode() {
  const [colorMode, setColorModeState] = useState<ColorMode>(readColorMode);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = readColorMode();
      setColorModeState((prev) => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-seed-color-mode"],
    });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if (readColorMode() === "system") applyColorMode("system");
    };
    media.addEventListener("change", syncSystem);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncSystem);
    };
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    persistColorMode(mode);
  }, []);

  return { colorMode, setColorMode };
}
