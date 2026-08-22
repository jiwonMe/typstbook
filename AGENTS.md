## Learned User Preferences

- After a direction is agreed, continue remaining design or implementation without pausing for approval at each section.
- Prefer SEED Design System components and tokens for the typstbook preview shell; color mode is user-selectable (light, dark, or system).
- The story controls panel should be dockable to the right or bottom.

## Learned Workspace Facts

- typstbook is a Storybook-like local workbench for Typst package authors, implemented as an independent CLI plus thin web UI rather than a Storybook addon or framework.
- v1 is `typstbook init` (scaffold a package, never overwrite) and `typstbook dev`, including workbench print of the SVG preview; static docs sites, WASM render, JS CSF stories, visual regression, PDF download, and Universe publishing are later.
- Stories are Typst-native `*.stories.typ` files using `#story(...)`; a later JS adapter should emit the same Story IR.
- A story is an isolated Typst compile unit covering functions, templates, set/show rules, pages, and math, with no per-kind story types.
- Extract story metadata with `typst eval` (Typst 0.15+; not deprecated `typst query`); render via the local `typst` CLI to multi-page SVG using the `{p}` output template.
- Implementation stack is TypeScript CLI + React/Vite UI (SEED Design + Tailwind) + a Typst helper package; Story IR and a `compile()` backend interface are the extension points.
- Optional package-root `preview.typ` exports `preview(body)` and is applied with `#show: preview` on every extract/render so shared fonts/set/show wrap story content; missing file is skipped.
- On story re-extract, merge arg defaults with live control values so new keys appear without wiping existing edits.
- Packages: `packages/typstbook` (Typst helper), `packages/server` (npm package `typstbook`; the CLI embeds the built UI), `packages/ui` (Vite UI, not published separately), `examples/demo-pkg` for dogfooding, and `examples/kice-korean` for KICE-style Korean reading exams. Do not publish as `typst` — that name is taken and would shadow the official compiler.
- v1 args are JSON-serializable only (strings, numbers, booleans, hex colors, and nested arrays/dictionaries); content or markup controls are out of scope.
- Typst SVG preview pages stay light-only (white paper) regardless of workbench color mode.
- `typstbook-logo.svg` is the favicon and sidebar mark.
