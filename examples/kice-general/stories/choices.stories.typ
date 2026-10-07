#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": choices, body-style

#story(
  title: "선지 배열",
  description: "선지의 길이에 따라 1·2·3·5열을 선택한다. 번호는 ①～⑤로 유지한다.",
  args: (columns: 5),
  arg-types: (columns: (control: "select", options: (1, 2, 3, 5))),
  page: (width: 132mm, height: auto, margin: 8mm),
  render: (args) => {
    show: body-style
    choices([6개], [12개], [18개], [24개], [30개], columns: args.columns)
  },
)

#story(
  title: "긴 선지",
  description: "긴 선지가 다음 줄로 넘어갈 때 원문자 번호와 본문의 들여쓰기를 확인한다.",
  args: (columns: 1),
  arg-types: (columns: (control: "select", options: (1, 2))),
  page: (width: 132mm, height: auto, margin: 8mm),
  render: (args) => {
    show: body-style
    choices(
      [철 3개와 막대 2개를 사용하면 도끼 1개를 만들 수 있다.],
      [철의 개수가 충분하더라도 막대가 부족하면 원하는 개수의 도끼를 만들 수 없다.],
      [재료를 한 번 사용한 뒤에도 그 재료로 다른 도끼를 만들 수 있다.],
      [철 8개와 막대 5개로 도끼를 최대 3개까지 만들 수 있다.],
      [도끼의 최대 제작 개수는 철의 개수만으로 결정된다.],
      columns: args.columns,
    )
  },
)
