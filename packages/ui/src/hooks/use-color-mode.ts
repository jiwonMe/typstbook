import { useCallback, useEffect, useState } from "react";
import {
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
    return () => observer.disconnect();
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    persistColorMode(mode);
  }, []);

  return { colorMode, setColorMode };
}
