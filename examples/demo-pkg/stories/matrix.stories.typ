#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": callout

#story(
  title: "Variant matrix",
  description: "Every variant × title length combination on one canvas.",
  args: (
    body: "Matrix cell body.",
  ),
  arg-types: (
    variant: (control: "select", options: ("info", "warning", "error")),
    title: (control: "text"),
    body: (control: "markup"),
  ),
  matrix: (
    variant: ("info", "warning", "error"),
    title: ("Short", "A longer title"),
  ),
  page: (width: 180pt, height: 90pt, margin: 8pt),
  checks: (
    snapshot: true,
    pages: 6,
  ),
  render: (args) => {
    callout(title: args.title, variant: args.variant, args.body)
  },
)
