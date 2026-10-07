export const SIDEBAR_COLLAPSED_STORAGE_KEY = "typstbook-sidebar-collapsed";

/** Keep in sync with `@container typstbook` in `index.css`. */
export const SIDEBAR_INLINE_MIN_WIDTH = 768;

export function readStoredSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function persistSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(collapsed));
  } catch {
    // Private mode and quota errors should not block collapse.
  }
}
