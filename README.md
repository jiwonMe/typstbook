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
| `args` | no | Default control values. JSON-serializable only. |
| `arg-types` | no | Override the inferred control. See below. |
| `page` | no | Passed to `#set page(..)` for this story only. |

`args` may be strings, numbers, booleans, hex colors (`#rgb` / `#rrggbb` / `#rrggbbaa`), and nested arrays or dictionaries. Content and markup controls are out of scope.

On re-extract, new arg keys appear with their defaults. Keys you already edited keep their live values. Removed keys disappear.

### Controls

If you omit `arg-types`, typstbook infers a control from the default:

| Default | Control |
| --- | --- |
| `bool` | checkbox |
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
- Controls dock to the right or the bottom.
- Color mode is light, dark, or system. Typst SVG pages stay on white paper either way.
- Saving a story file, `preview.typ`, or imported sources re-extracts and recompiles.

## CLI

```bash
typstbook init [dir]
typstbook dev [dir]
```

`dir` defaults to the current working directory. `init` writes `typst.toml`, `src/lib.typ`, `preview.typ`, and `stories/hello.stories.typ` when they are missing — it never overwrites. `dev` serves a package root that already has `typst.toml` and `*.stories.typ` files.

## Develop from this repo

```bash
npm install
npm run dev -- examples/demo-pkg
npm run dev -- examples/kice-korean
```

`demo-pkg` has callout, resume, and math stories. `kice-korean` is a KICE-style Korean reading exam (passages, questions, `<보기>`, commentary pages).

```bash
npm test
npm run typecheck
npm run build
npm run pack:check
```

The published npm package is `typstbook` (`packages/server`). It embeds the built UI and the Typst helper. `@typstbook/ui` is not published separately. Do not publish this CLI as `typst` — that name is the official compiler.

## Status

v1 is `typstbook init` and `typstbook dev`. Static docs sites, WASM render, JS CSF stories, visual regression, PDF download, and Typst Universe publishing are later.

## License

[MIT](LICENSE)
