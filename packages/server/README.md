# typstbook

A Storybook-like local workbench for Typst package authors. Write `*.story.typ` files, run `typstbook dev`, and isolate-compile functions, templates, set/show rules, pages, and math while editing args.

## Requirements

- Node.js 22+
- [Typst](https://github.com/typst/typst?tab=readme-ov-file#installation) on `PATH` (`typst` 0.15+, for `typst eval`)

## Install

```bash
npm install -g typstbook
typstbook dev
```

Or without a global install:

```bash
npx typstbook dev
```

Point it at a Typst package directory:

```bash
typstbook dev ./my-pkg
```

## Write a story

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

Stories are any `*.story.typ` file under the package root. Optional package-root `preview.typ` must export `#let preview(body) = { ...; body }` — typstbook applies `#show: preview` around every story so shared fonts/set/show actually take effect. v1 args are JSON-serializable values only.
