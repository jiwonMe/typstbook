## Learned User Preferences

- After a direction is agreed, continue remaining design or implementation without pausing for approval at each section.

## Learned Workspace Facts

- typstbook is a Storybook-like local workbench for Typst package authors, implemented as an independent CLI plus thin web UI rather than a Storybook addon or framework.
- v1 is `typstbook dev` only; static docs sites, WASM render, JS CSF stories, visual regression, PDF download, and Universe publishing are later.
- Stories are Typst-native `*.story.typ` files using `#story(...)`; a later JS adapter should emit the same Story IR.
- A story is an isolated Typst compile unit covering functions, templates, set/show rules, pages, and math, with no per-kind story types.
- Extract story metadata with `typst eval` (Typst 0.15+; not deprecated `typst query`); render via the local `typst` CLI to multi-page SVG using the `{p}` output template.
- Implementation stack is TypeScript CLI + React/Vite UI (shadcn + Tailwind) + a Typst helper package; Story IR and a `compile()` backend interface are the extension points.
- Optional package-root `preview.typ` exports `preview(body)` and is applied with `#show: preview` on every extract/render so shared fonts/set/show wrap story content; missing file is skipped.
- Planned packages: `packages/typstbook` (Typst helper), `packages/server` (CLI/extractor/render/watch), `packages/ui` (Vite UI), and `examples/demo-pkg` for dogfooding.
- v1 args are JSON-serializable only (strings, numbers, booleans, hex colors, and nested arrays/dictionaries); content or markup controls are out of scope.
