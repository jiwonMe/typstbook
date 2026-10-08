# typstbook

<img src="packages/ui/public/typstbook-logo.svg" alt="typstbook" width="72">

[![npm](https://img.shields.io/npm/v/typstbook)](https://www.npmjs.com/package/typstbook)
[![license](https://img.shields.io/npm/l/typstbook)](LICENSE)

A Storybook-like local workbench for [Typst](https://typst.app) package authors. Write `*.stories.typ` files, run `typstbook dev`, and isolate-compile functions, templates, set/show rules, pages, and math while you edit args.

```bash
npm install -g typstbook
typstbook init my-pkg
typstbook dev my-pkg
```

Open the printed `local` URL. Stories appear in the sidebar; the canvas renders each one as multi-page SVG through your local `typst` CLI.

## Requirements

- Node.js 22+
- [Typst](https://github.com/typst/typst?tab=readme-ov-file#installation) 0.15+ on `PATH` (`typst eval`)

## Install

```bash
npm install -g typstbook
typstbook init my-pkg    # new package, or add stories to an existing one
typstbook dev my-pkg
```

Without a global install:

```bash
npx typstbook init my-pkg
npx typstbook dev my-pkg
```

Default port is `4400`. Override with `TYPSTBOOK_PORT`.

## Write a story

Any `*.stories.typ` file under the package root is a story file. One file can declare several stories. typstbook injects the helper package locally — you do not need to publish `@preview/typstbook` to Universe.

```typ
#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": callout

#story(
  title: "Warning",
  description: "A callout for warnings, with a title and a fixed body.",
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

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Shown in the sidebar. Also used to build the story id. |
| `render` | yes | Function of `args`. This is the compile unit. |
| `description` | no | A short string shown under the title in the canvas header. |
| `args` | no | Default control values. JSON-serializable only. |
| `arg-types` | no | Override the inferred control. See below. |
| `page` | no | Passed to `#set page(..)` for this story only. |

`args` may be strings, numbers, booleans, hex colors (`#rgb` / `#rrggbb` / `#rrggbbaa`), and nested arrays or dictionaries. Content and markup controls are out of scope.

On re-extract, new arg keys appear with their defaults. Keys you already edited keep their live values. Removed keys disappear.

### Controls

If you omit `arg-types`, typstbook infers a control from the default:

| Default | Control |
| --- | --- |
| `bool` | On / Off toggle |
| `number` | number |
| `#fff` / `#ffffff` / `#ffffffff` | color |
| anything else | text |

Set `arg-types` when inference is wrong, or for a select:

```typ
arg-types: (
  variant: (control: "select", options: ("info", "warning", "error")),
)
```

`control` is one of `text`, `number`, `boolean`, `select`, `color`.

### Shared preview

Optional package-root `preview.typ` wraps every extract and render with `#show: preview`. Put shared fonts and set/show rules here. Bare top-level `#set` in that file does not apply to story content.

```typ
#let preview(body) = {
  set text(lang: "ko", size: 11pt, font: ("Bookk Myungjo",))
  set par(justify: true)
  body
}
```

## Workbench

- Sidebar lists stories by file. File-level Typst errors stay visible.
- The canvas stacks every compiled page. Zoom, then print with the toolbar button or `⌘P` / `Ctrl+P` (chrome is hidden).
- The download toolbar button saves the story as a real, multi-page PDF compiled by `typst` -- not a browser print-to-PDF -- using the current control values. In `build` output it downloads the PDF baked in at build time (default args only, since controls are read-only there).
- The `</>` toolbar button shows the story's `render:` source with the current control values substituted in, with a copy button. It updates live as you edit controls, with no recompile. Disabled when the source could not be isolated from the story file (see below).
- Controls dock to the right or the bottom. On desktop, drag the sidebar or Controls boundary to resize it; each size is remembered separately. Focus a boundary and use arrow keys (Shift for larger steps), or double-click it to restore its default size.
- **Fit width** and **Fit page** stay active as panels, the window, or story dimensions change. Fit page fits the first page. Manual zoom exits auto-fit; the selected fit mode is remembered across reloads. On narrow screens the buttons are labeled **Width** and **Page**.
- Color mode is light, dark, or system. Typst SVG pages stay on white paper either way.
- Saving a story file, `preview.typ`, or imported sources re-extracts and recompiles.
- Each browser tab has its own selected story and control values -- open the same `dev` server in two tabs (or share a URL) and they don't interfere. The URL (`?path=...&args=...`) captures the exact state, so copying it reproduces what you're looking at for someone else on the same server.

"Show code" isolates the `render:` value from the story file's own text (not from `typst eval` output) by scanning brackets/strings/comments -- it does not fully parse Typst, so a story with unusual embedded syntax may show no code rather than a wrong one.

## CLI

```bash
typstbook init [dir]
typstbook dev [dir]
typstbook test [dir] [--update]
typstbook build [dir] [--out <dir>]
```

`dir` defaults to the current working directory. `init` writes `typst.toml`, `src/lib.typ`, `preview.typ`, and `stories/hello.stories.typ` when they are missing — it never overwrites. `dev` serves a package root that already has `typst.toml` and `*.stories.typ` files.

`test` compiles every story with its default args and compares the SVG output against snapshots committed under `__snapshots__/`. It exits non-zero on any extract error, compile error, missing snapshot, or mismatch — wire it into CI to catch breakage. `--update` (or `-u`) writes the current output as the new baseline instead of comparing.

```bash
typstbook test my-pkg            # compare against __snapshots__/, exit 1 on drift
typstbook test my-pkg --update   # (re)write __snapshots__/ from the current output
```

Commit `__snapshots__/` alongside your stories.

`build` compiles every story with its default args and writes a static, self-contained copy of the workbench to `--out` (default `./typstbook-static`, replaced on every run — don't point it at your package root). Controls become read-only (they show the default args; there is no server to recompile against), everything else — sidebar, zoom, print, PDF download, "Show code" — works the same as `dev`.

```bash
typstbook build my-pkg --out docs/preview
```

Host `--out` on any static file host (GitHub Pages, Netlify, S3, a plain `python -m http.server`) — including from a sub-path. It will **not** work opened directly via `file://`: the bundle is loaded as an ES module, and Chromium-based browsers block ES modules under the `file://` origin. This is a browser limitation shared by every Vite/ESM-based static build, not something `typstbook build` can special-case around.

## Develop from this repo

Requires [pnpm](https://pnpm.io) 11+ (`corepack enable` on Node.js 22+).

```bash
corepack enable
pnpm install
pnpm dev examples/demo-pkg
pnpm dev examples/kice-korean
pnpm dev:kice-general
```

`demo-pkg` has callout, resume, and math stories. `kice-korean` is a KICE-style Korean reading exam (passages, questions, `<보기>`, commentary pages). [`kice-general`](examples/kice-general/README.md) follows measured KICE math, Korean and science PDF layouts with shared fonts, subject typography profiles and an advanced Minecraft Java 1.21.1 examination (20 questions, 4 reference pages or 6 A4 print pages, 32 stories). It includes generated grayscale bitmaps, a shared answer and explanation sheet in Toss Product Sans and Bookk Myungjo, tall math, matrices, systems, and page-boundary checks. The A4 print preset reflows at 10.5pt with automatic pagination; the original-size and scaled A4 presets are also available. Its launcher registers the bundled fonts consistently for SVG and PDF.

```bash
pnpm test             # unit tests (packages/server)
pnpm test:snapshots   # typstbook test against demo-pkg, kice-korean and kice-general
pnpm typecheck
pnpm build
pnpm pack:check
```

The published npm package is `typstbook` (`packages/server`). It embeds the built UI and the Typst helper. `@typstbook/ui` is not published separately. Do not publish this CLI as `typst` — that name is the official compiler.

## Status

v1 is `typstbook init`, `typstbook dev`, `typstbook test` (snapshot regression checks for CI), and `typstbook build` (static docs site, root/sub-path hosting only -- no `file://`), plus PDF download from the workbench. WASM render, JS CSF stories, visual regression, and Typst Universe publishing are later.

## License

[MIT](LICENSE)
