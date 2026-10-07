// Same fixture and metadata as the full structured-math story.
#import "src/lib.typ": exam
#import "fixtures/math-structures.typ": math-structures-paper

#exam(
  paper: sys.inputs.at("paper", default: "suneung"),
  area: "게임탐구",
  subject: "마인크래프트",
  tab-label: "구조수식",
  notice: [이 문제지는 행렬·연립식 레이아웃 검사용 창작 예시입니다.],
)[
  #math-structures-paper()
]
