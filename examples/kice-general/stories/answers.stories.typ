#import "@preview/typstbook:0.1.0": story
#import "../fixtures/minecraft-answers.typ": minecraft-answers

#story(
  title: "정답과 해설",
  description: "마인크래프트20문항의 정답표와 전체 해설. 문제지와 같은 원고를 사용하는 고정 A4 답지이다.",
  render: (args) => minecraft-answers(),
)
