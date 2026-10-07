#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": exam
#import "../fixtures/math-stress.typ": math-inline, math-display, math-material, math-choices, math-boundaries, math-stress-paper

// The outer preview supplies plain base typography; exam() owns the single
// body-style/compression pass and the real two-column page foreground.
#let math-exam = exam.with(area: "게임탐구", subject: "마인크래프트", tab-label: "수식", notice: [이 문제지는 수식 레이아웃 검사용 창작 예시입니다.])
#let purpose = "고교 출제 범위와 독립적인 템플릿 수식 검증. "

#story(
  title: "키 큰 인라인 수식",
  description: purpose + "Trinity Essence와 같은 display 함수로 중첩 분수·근호·겹친 첨자를 표시하고 기준선과 줄 간격을 확인한다.",
  render: (_) => math-exam[ #math-inline() ],
)

#story(
  title: "표시 수식과 정렬",
  description: purpose + "합·곱·적분의 상하한, 겹친 분수, 여러 줄 전개식을 실제 시험지 단 안에서 확인한다.",
  render: (_) => math-exam[ #math-display() ],
)

#story(
  title: "수식 자료와 보기",
  description: purpose + "행렬·조건식·연립방정식과 분수 표를 자료 상자와 보기 안에서 확인한다.",
  render: (_) => math-exam[ #math-material() ],
)

#story(
  title: "키 큰 수식 선지",
  description: purpose + "1·2열에서는 긴 항등식, 3·5열에서는 키 큰 분수와 두 줄 선지를 비교한다.",
  args: (columns: 1),
  arg-types: (columns: (control: "select", options: (1, 2, 3, 5))),
  render: (args) => math-exam[ #math-choices(columns: args.columns) ],
)

#story(
  title: "단과 쪽 경계 수식",
  description: purpose + "예약 여백 뒤의 키 큰 수식 문항을 수동 분할 없이 다음 단과 다음 쪽으로 이동시킨다.",
  render: (_) => math-exam[ #math-boundaries() ],
)

#story(
  title: "전체 수식 검증 시험지",
  description: purpose + "인라인·표시·자료·보기·표와 1·2·3·5열 선지를 모두 담은 실제 다쪽 시험지이다.",
  args: (paper: "suneung"),
  arg-types: (paper: (control: "select", options: ("suneung", "a4"))),
  render: (args) => math-exam(paper: args.paper)[ #math-stress-paper() ],
)
