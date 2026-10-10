#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": callout

#story(
  title: "Warning",
  description: "Callout with an editable markup body.",
  args: (
    title: "주의",
    variant: "warning",
    body: "본문은 Controls에서 Typst 마크업으로 편집합니다.",
  ),
  arg-types: (
    title: (control: "text"),
    variant: (control: "select", options: ("info", "warning", "error")),
    body: (control: "markup"),
  ),
  page: (paper: "a6", margin: 12pt),
  checks: (
    snapshot: true,
    pages: 1,
    width: 105mm,
    height: 148mm,
  ),
  render: (args) => {
    callout(title: args.title, variant: args.variant, args.body)
  },
)

#story(
  title: "Info",
  args: (
    title: "Note",
    variant: "info",
    body: "A reusable callout.",
  ),
  arg-types: (
    title: (control: "text"),
    variant: (control: "select", options: ("info", "warning", "error")),
    body: (control: "markup"),
  ),
  page: (paper: "a6", margin: 12pt),
  checks: (
    snapshot: true,
    pages: 1,
    width: 105mm,
    height: 148mm,
  ),
  render: (args) => {
    callout(title: args.title, variant: args.variant, args.body)
  },
)
