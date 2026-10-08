#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": exam, instruction
#import "../fixtures/korean-components.typ": korean-paired, korean-poems, korean-drama, korean-writing, korean-media, korean-range-probe, korean-reading-set, korean-paper, korean-notice

#let korean-exam(paper, body) = exam(paper: paper, typography: "korean", layout: "standard",
  area: [국어], subject: none, period: 1, selected: false, tab-label: none,
  notice: korean-notice, body)
#let paper-control = (paper: (control: "select", options: ("a4", "suneung")))

#story(
  title: "독서 짝지문",
  description: "(가)·(나) 지문과 ㉠·㉡ 인용 표시를 한 테두리 안에서 배치한다. 모든 글은 새로 작성한 마인크래프트 관찰 논의이다.",
  args: (paper: "a4"), arg-types: paper-control,
  render: (args) => korean-exam(args.paper)[
    #instruction(1, to: 3)
    #korean-paired()
  ],
)

#story(
  title: "운문과 주석",
  description: "창작 시의 행·연 구분, [A] 구간 괄호, 오른쪽 출전과 하단 낱말 풀이를 함께 확인한다.",
  args: (paper: "a4"), arg-types: paper-control,
  render: (args) => korean-exam(args.paper)[
    #instruction(4, to: 5)
    #korean-poems()
  ],
)

#story(
  title: "극 대사와 줄거리",
  description: "앞부분 줄거리·화자별 들여쓰기·중략·지시문·출전을 갖춘 창작 극 자료이다.",
  args: (paper: "a4"), arg-types: paper-control,
  render: (args) => korean-exam(args.paper)[
    #instruction(6, to: 7)
    #korean-drama()
  ],
)

#story(
  title: "작성 계획과 학생의 초고",
  description: "단계별 작문 계획과 초고를 구분하고, 문장 수정에 쓰는 밑줄 표시를 검토한다.",
  args: (paper: "a4"), arg-types: paper-control,
  render: (args) => korean-exam(args.paper)[
    #instruction(8, to: 9, body: [다음은 학생의 작성 계획과 초고이다. 물음에 답하시오.])
    #korean-writing()
  ],
)

#story(
  title: "게시판 매체 화면",
  description: "게시판 창 제목·메뉴·작성자·시각·여러 게시글·화면 설명을 네이티브 글자로 조판한다.",
  args: (paper: "a4"), arg-types: paper-control,
  render: (args) => korean-exam(args.paper)[
    #instruction(10, body: [다음은 동아리 게시판의 화면이다. 물음에 답하시오.])
    #korean-media()
  ],
)

#story(
  title: "긴 구간 표시와 단 경계",
  description: "[B] 구간을 여러 단과 쪽에 걸쳐 표시한다. 좌우 괄호 선택과 이어지는 테두리의 충돌을 확인한다.",
  args: (paper: "a4", side: "left"),
  arg-types: (paper: paper-control.paper, side: (control: "select", options: ("left", "right"))),
  render: (args) => korean-exam(args.paper)[
    #instruction(11, to: 12)
    #korean-range-probe(side: if args.side == "left" { left } else { right })
  ],
)

#story(
  title: "국어 읽기 세트",
  description: "하나의 지문 묶음과 연속 문항을 배치한다. 독서·운문·극·작문·매체 세트별로 확인할 수 있다.",
  args: (paper: "a4", kind: "paired"),
  arg-types: (paper: paper-control.paper, kind: (control: "select", options: ("paired", "poems", "drama", "writing", "media"))),
  render: (args) => korean-exam(args.paper)[#korean-reading-set(kind: args.kind)],
)

#story(
  title: "국어형 창작 문제지",
  description: "마인크래프트 관찰을 소재로 한 창작 독서·문학·화법과 작문·매체의 10문항. A4와 평가원 판형이 같은 원고를 공유한다.",
  args: (paper: "a4"), arg-types: paper-control,
  render: (args) => korean-exam(args.paper)[#korean-paper()],
)
