# Nucleo icons

Vendored React components from **Nucleo UI · outline · 18px**. Import the selected
component directly from its file; the app does not depend on a local Nucleo
installation at runtime or build time.

- Preserve the original SVG geometry and default 1.5 stroke width.
- Inherit SEED foreground and interaction colors via `currentColor`.
- Icons are decorative by default (`aria-hidden`, `focusable="false"`); keep the
  accessible name on the enclosing button or control.
- Use dedicated layout-right/layout-bottom icons for controls placement.
- When adding icons, fetch the original through the Nucleo MCP and copy only the
  required React component into this directory.
