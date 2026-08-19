export type ControlsPlacement = "right" | "bottom";

export const CONTROLS_PLACEMENT_STORAGE_KEY = "typstbook-controls-placement";

export function isControlsPlacement(
  value: string | null | undefined,
): value is ControlsPlacement {
  return value === "right" || value === "bottom";
}

export function readStoredControlsPlacement(): ControlsPlacement {
  try {
    const stored = localStorage.getItem(CONTROLS_PLACEMENT_STORAGE_KEY);
    return isControlsPlacement(stored) ? stored : "right";
  } catch {
    return "right";
  }
}

export function persistControlsPlacement(placement: ControlsPlacement): void {
  try {
    localStorage.setItem(CONTROLS_PLACEMENT_STORAGE_KEY, placement);
  } catch {
    // Private mode and quota errors should not block the live layout change.
  }
}
