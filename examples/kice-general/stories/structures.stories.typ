#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": exam
#import "../fixtures/math-structures.typ": structures-matrices, structures-systems, structures-choices, structures-boundaries, math-structures-paper

#let structured-exam = exam.with(area: "게임탐구", subject: "마인크래프트", tab-label: "구조수식", notice: [이 문제지는 행렬·연립식 레이아웃 검사용 창작 예시입니다.])
#let purpose = "Trinity Essence의 display와 행렬 간격을 적용한 구조 수식 검증. "

#story(
  title: "행렬과 벡터",
  description: purpose + "2×2·3×3·2×3 행렬, 음수·분수·근호·첨자, 행·열벡터와 증강행렬을 실제 단 안에서 확인한다.",
  args: (rows: 2),
  arg-types: (rows: (control: "select", options: (2, 3))),
  render: (args) => structured-exam[ #structures-matrices(rows: args.rows) ],
)

#story(
  title: "연립식과 구간별 함수",
  description: purpose + "2·3행 연립방정식·해, 연립부등식, 한국어 조건을 가진 구간별 함수와 여러 줄 행렬 등식의 정렬을 확인한다.",
  args: (rows: 3),
  arg-types: (rows: (control: "select", options: (2, 3))),
  render: (args) => structured-exam[ #structures-systems(rows: args.rows) ],
)

#story(
  title: "구조 수식 선지와 표",
  description: purpose + "1·2열에는 행렬과 두 줄 연립식, 5열에는 좁은 열벡터를 놓고 번호 기준선과 수식이 들어간 표의 높이를 확인한다.",
  args: (columns: 2),
  arg-types: (columns: (control: "select", options: (1, 2, 5))),
  render: (args) => structured-exam[ #structures-choices(columns: args.columns) ],
)

#story(
  title: "구조 수식 단과 쪽 경계",
  description: purpose + "예약 여백 뒤의 행렬·연립식·벡터 문항이 수동 분할 없이 다음 단과 다음 쪽으로 이동하는지 확인한다.",
  args: (paper: "suneung"),
  arg-types: (paper: (control: "select", options: ("suneung", "a4"))),
  render: (args) => structured-exam(paper: args.paper)[ #structures-boundaries() ],
)

#story(
  title: "전체 구조 수식 검증 시험지",
  description: purpose + "행렬·벡터·증강행렬·연립식·구간별 함수와 1·2·5열 선지·표를 모두 담은 실제 다쪽 시험지이다.",
  args: (paper: "suneung"),
  arg-types: (paper: (control: "select", options: ("suneung", "a4"))),
  render: (args) => structured-exam(paper: args.paper)[ #math-structures-paper() ],
)
