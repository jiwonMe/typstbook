#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": resume

#story(
  title: "Resume / Default",
  args: (name: "홍길동", role: "Engineer"),
  render: (args) => {
    show: resume.with(name: args.name, role: args.role)
    [
      == Experience
      Built typesetting tools and local workbenches.
    ]
  },
)
