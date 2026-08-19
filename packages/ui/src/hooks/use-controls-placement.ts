import { useCallback, useState } from "react";
import {
  persistControlsPlacement,
  readStoredControlsPlacement,
  type ControlsPlacement,
} from "@/lib/controls-placement";

export function useControlsPlacement() {
  const [placement, setPlacementState] = useState<ControlsPlacement>(
    readStoredControlsPlacement,
  );

  const setPlacement = useCallback((next: ControlsPlacement) => {
    persistControlsPlacement(next);
    setPlacementState(next);
  }, []);

  return { placement, setPlacement };
}
