#import "@preview/typstbook:0.1.0": story
#import "../fixtures/korean-pixel.typ": korean-pixel-page

#story(
  title: "국어 첫 쪽 픽셀 기준판",
  description: "2026학년도 6월 국어 1쪽의 머리말·31행 지문·보기·선지 좌표를 대조하는 기준판이다. 본문은 창작이며, 픽셀 검증은 테두리와 동일 표지에 한정한다.",
  args: (paper: "suneung"),
  arg-types: (paper: (control: "select", options: ("suneung", "a4-scaled"))),
  render: (args) => korean-pixel-page(paper: args.paper),
)
