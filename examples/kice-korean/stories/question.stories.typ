#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": choices, question, view

#story(
  title: "선지",
  args: (
    number: 1,
    points: 2,
    prompt: "윗글의 내용과 일치하지 <u>않은</u> 것은?",
  ),
  page: (paper: "a6", margin: 16pt),
  render: (args) => {
    question(args.number, points: args.points, args.prompt, body: choices(
      [반영론적 유물론은 물질 세계가 의식과 독립하여 존재한다고 본다.],
      [반영은 대상과 표상이 모든 점에서 닮는다는 뜻이다.],
      [표상의 형태는 매개 조건에 따라 달라질 수 있다.],
      [한 번의 성공이 판단을 완전하게 확정하는 것은 아니다.],
      [주관적 관념론은 사물이 의지에 따라 임의로 생긴다고 보지 않는다.],
    ))
  },
)

#story(
  title: "보기 문항",
  args: (
    number: 2,
    points: 3,
    prompt: "윗글을 바탕으로 <보기>를 이해한 내용으로 적절한 것은?",
    view: "곧은 막대가 물속에서 꺾여 보인다. 물 밖으로 꺼내자 막대는 다시 곧게 보인다.",
  ),
  page: (paper: "a6", margin: 16pt),
  render: (args) => {
    question(args.number, points: args.points, args.prompt, body: [
      #view(args.view)
      #choices(
        [꺾여 보인 표상 자체가 곧 오류이다.],
        [물 밖에서도 꺾여 보일 것이라는 예상이 오류이다.],
        [두 입장 모두 이 사례의 규칙성을 설명할 수 없다.],
        [이 사례만으로 반영론적 유물론이 입증된다.],
        [지각 내용과 그에 근거한 판단은 구별되지 않는다.],
      )
    ])
  },
)
