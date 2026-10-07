#import "@preview/typstbook:0.1.0": story
#import "../fixtures/minecraft-answers.typ": minecraft-answers, minecraft-answer-items
#import "../src/lib.typ": answer-key, solution-entry, body-style, answer-layout, answer-fonts

#story(
  title: "정답과 해설",
  description: "문제지와 같은 원고의 20개 정답·해설을 A4에서 읽는다. 1단·2단 조판을 비교할 수 있다.",
  args: (columns: 2),
  arg-types: (columns: (control: "select", options: (1, 2))),
  render: (args) => minecraft-answers(columns: args.columns),
)

#story(
  title: "정답표",
  description: "문항 번호와 정답을 한 셀에서 읽는 정답표. 5열·10열의 밀도를 비교한다.",
  args: (columns: 10),
  arg-types: (columns: (control: "select", options: (5, 10))),
  render: (args) => {
    set page(paper: "a4", margin: (x: 18mm, y: 19mm))
    answer-key(minecraft-answer-items, columns: args.columns)
  },
)

#story(
  title: "해설 문항",
  description: "문항 번호·정답·배점을 구분하고 일반 설명과 키 큰 계산의 읽기 흐름을 비교한다.",
  args: (number: 17),
  arg-types: (number: (control: "select", options: (6, 9, 13, 15, 17, 18))),
  render: (args) => {
    set page(paper: "a4", margin: (x: 18mm, y: 19mm))
    body-style(font-config: answer-fonts, condense: false, leading: answer-layout.leading,
      tracking: answer-layout.tracking)[
      #block(width: (210mm - 36mm - answer-layout.gutter) / 2)[
        #let item = minecraft-answer-items.at(args.number - 1)
        #solution-entry(item.number, item.answer, item.explanation, points: item.points)
      ]
    ]
  },
)
