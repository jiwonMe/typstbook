#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": note-rule

#story(
  title: "Numbered equation",
  args: (show-number: true),
  page: (paper: "a6", margin: 16pt),
  render: (args) => {
    show: note-rule
    set math.equation(numbering: if args.at("show-number") { "(1)" } else { none })
    [
      Quadratic formula:
      $ x = (-b plus.minus sqrt(b^2 - 4 a c)) / (2 a) $

      ```typ
      set math.equation(numbering: "(1)")
      ```
    ]
  },
)
