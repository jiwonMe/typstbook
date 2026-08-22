#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": callout

#story(
  title: "Test",
  page: (paper: "a6", margin: 12pt),
  args: (title: "Test", t: 23),
  arg-types: (
    title: (control: "text"),
    t: (control: "number", min: 0, max: 100),
  ),
  render: (args) => {
    callout(title: args.title)[
      #args.t
      "Hello, world!"
    ]
  },
)