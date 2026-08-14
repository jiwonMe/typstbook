# typstbook

A Storybook-like local workbench for Typst package authors. Write `*.story.typ` files, run `typstbook dev`, and isolate-compile functions, templates, set/show rules, pages, and math while editing args.

## Requirements

- Node.js 22+
- [Typst](https://github.com/typst/typst?tab=readme-ov-file#installation) on `PATH` (`typst` 0.15+, for `typst eval`)

## Quick start

```bash
npm install
npm run dev -- examples/demo-pkg
```

Then open the printed local URL. The demo package has callout, resume template, and math stories.

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

Stories are any `*.story.typ` file under the package root. Optional package-root `preview.typ` is `#include`d before every story (shared set/show, fonts, chrome). v1 args are JSON-serializable values only.

## Commands

```bash
npx tsx packages/server/src/cli.ts dev [dir]
npm test
```
