// Same fixture and metadata as the full mathematical stress story.
#import "src/lib.typ": exam
#import "fixtures/math-stress.typ": math-stress-paper

#exam(
  area: "게임탐구",
  subject: "마인크래프트",
  tab-label: "수식",
  notice: [이 문제지는 수식 레이아웃 검사용 창작 예시입니다.],
)[
  #math-stress-paper()
]
