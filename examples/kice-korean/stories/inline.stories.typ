#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": mark, term-box, u

#story(
  title: "밑줄 표지",
  args: (label: "㉠", phrase: "반영의 매개성"),
  page: (paper: "a6", margin: 16pt),
  render: (args) => [
    이 입장에서 #mark(args.label, args.phrase)을 인정하는 것은
    객관적 인식의 가능성을 부정하는 일이 아니다.
  ],
)

#story(
  title: "사각형 용어",
  args: (term: "잠재 표현"),
  page: (paper: "a6", margin: 16pt),
  render: (args) => [
    두 번째 문단에는 #term-box(args.term)이 있다.
    밑줄만 치는 경우는 #u[않은]처럼 표지 없이 표시한다.
  ],
)
