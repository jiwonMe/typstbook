#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": question, choices, material, view, body-style
#import "../fixtures/minecraft.typ": minecraft-question

#story(
  title: "기본 문항",
  description: "문항 번호, 질문, 배점, 자료, 다섯 선지를 한 단 너비에서 확인한다.",
  args: (number: 1, points: 2),
  arg-types: (number: (control: "number", min: 1, max: 20, step: 1), points: (control: "select", options: (2, 3))),
  page: (width: 132mm, height: auto, margin: 8mm),
  render: (args) => {
    show: body-style
    minecraft-question(args.number, points: args.points)
  },
)

#story(
  title: "보기 문항",
  description: "ㄱ·ㄴ·ㄷ 보기와 두 열의 조합형 선지를 실제 문항에 적용한다.",
  args: (points: 3),
  arg-types: (points: (control: "select", options: (2, 3))),
  page: (width: 132mm, height: auto, margin: 8mm),
  render: (args) => {
    show: body-style
    minecraft-question(2, points: args.points)
  },
)
