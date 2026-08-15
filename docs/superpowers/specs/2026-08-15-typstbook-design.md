# Typstbook v1 Design

Date: 2026-08-15

Typstbook is a Storybook-like local workbench for Typst package authors. Authors write Typst-native `*.story.typ` files, run `typstbook dev`, and isolate-compile functions, templates, set/show rules, pages, and math while editing args from a controls panel.

## Goals

- Local workbench only (`typstbook dev`). No static docs site in v1.
- Typst-native stories. A later JS adapter must emit the same Story IR.
- A story is an isolated Typst compile unit. No per-kind story types.
- Render with the local `typst` CLI. The `compile()` backend is the WASM extension point.
- Independent CLI plus thin web UI. Not a Storybook addon or framework.

## Non-goals

Static site build, WASM backend, JS CSF adapter, content/markup controls, visual regression, addon marketplace, Universe publishing, PDF download.

## Architecture

Four pieces:

1. **Typst helper package** (`packages/typstbook`) — `#story`, `#render-story`, `#emit-stories`.
2. **Extractor** — discover `*.story.typ`, run `typst eval` (not deprecated `typst query`), emit Story IR.
3. **Render backend** — `compile({ file, title, args, page }) → { pages, diagnostics }`. v1 spawns `typst compile` to SVG with a `{p}` page template.
4. **Dev server + UI** — file watch, WebSocket, sidebar / canvas / controls.

UI stack: React + TypeScript + Vite + Tailwind CSS + shadcn/ui. Linear-inspired dark workbench chrome.

```
*.story.typ → Extractor (typst eval) → Story IR → UI
                                      ↓
                         args change → Render backend → SVG pages → UI
```

## Story format

Authors write `#story(...)` at the top level of `**/*.story.typ`. Multiple stories per file are allowed. `story()` registers into a document-wide state; the workbench `#include`s the file and then calls `emit-stories` or `render-story`.

```typ
#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": callout

#story(
  title: "Warning",
  args: (title: "주의", variant: "warning"),
  arg-types: (
    title: (control: "text"),
    variant: (control: "select", options: ("info", "warning", "error")),
  ),
  page: (paper: "a6", margin: 12pt),
  render: (args) => {
    callout(title: args.title, variant: args.variant)[Fixed body]
  },
)
```

- `page` is applied from the registered Typst value during render. Templates that set their own page win.
- v1 args are JSON-serializable: strings, numbers, booleans, hex colors, and nested arrays/dictionaries.
- Omitted `arg-types` are inferred from default arg JSON types (`text` / `number` / `boolean` / `color`).
- Story id: `{posix-path-without-.story.typ}--{title-slug}`.
- Optional package-root `preview.typ` exports `#let preview(body) = { ...; body }`. The workbench applies `#show: preview` on every extract/render so shared fonts and set/show rules wrap story content. Missing file is skipped.
- Bare top-level `#set` in `preview.typ` alone does not affect stories (Typst include scoping); put rules inside `preview`.

## Story IR

`render` is never serialized.

```json
{
  "id": "stories/callout--warning",
  "file": "stories/callout.story.typ",
  "title": "Warning",
  "args": { "title": "주의", "variant": "warning" },
  "argTypes": {
    "title": { "control": "text" },
    "variant": { "control": "select", "options": ["info", "warning", "error"] }
  },
  "page": { "paper": "a6", "margin": "12pt" }
}
```

## Compile flow

Extract (per story file). Requires Typst 0.15+ (`typst eval`). The extractor pipes an entry document on stdin:

```bash
typst eval 'query(<typstbook-story>).map(it => it.value)' --in - --root <pkg-root> --package-path <helper-packages>
```

Entry document optionally imports `/preview.typ` and applies `#show: preview`, then `#include`s the story file, then `#emit-stories()`.

Render:

```bash
typst compile --root <pkg-root> --package-path <helper-packages> --input args='{...}' --input title='Warning' wrapper.typ out-{p}.svg
```

Wrapper optionally applies `#show: preview`, then `#include`s the story file, then `#render-story(title, args)`. Wrappers live in a temp dir.

Invalidation:

- Story or package source change → re-extract that file and recompile the open story.
- Args-only change → recompile only, no extract.
- `typst.toml`, `preview.typ`, or font-path change → full invalidate.

## UI

Three panes: story tree (file-grouped, error badges), SVG canvas (zoom, page nav), controls from `argTypes`. URL `/?path=<id>` keeps the selection. Server and UI talk over WebSocket.

## Errors

- Missing `typst` on PATH: CLI exits immediately with an install hint.
- Extract failure: sidebar badge + diagnostics; other stories stay up.
- Compile failure: keep last good SVG when possible; show diagnostics overlay; server stays up.
- Duplicate titles, missing `render`, bad args JSON: shown as IR/compile errors.

## Layout

- `packages/typstbook` — Typst helper
- `packages/server` — CLI, extractor, render, watch, WebSocket
- `packages/ui` — Vite UI
- `examples/demo-pkg` — dogfood package
