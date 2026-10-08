#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": exam as base-exam
#import "../fixtures/minecraft.typ": minecraft-page, minecraft-paper, minecraft-notice
#let exam = base-exam.with(notice: minecraft-notice)

#story(
  title: "첫 페이지",
  description: "수험생 정보란, 시험 제목, 영역·과목 제목과 첫 다섯 문항을 확인한다.",
  args: (year: 2027, session: "6월 모의평가", area: "게임탐구", subject: "마인크래프트", period: 4, selected: true, form: ""),
  arg-types: (period: (control: "number", min: 1, max: 5, step: 1), form: (control: "select", options: ("", "홀수형", "짝수형"))),
  render: (args) => exam(year: args.year, session: args.session, area: args.area, subject: args.subject, period: args.period, selected: args.selected, form: if args.form == "" { none } else { args.form }, total-pages: 4)[
    #minecraft-page(1)
  ],
)

#story(
  title: "전체 모의고사",
  description: "Java Edition 1.21.1의20문항·50점. 원본4쪽, 본문10.5pt의A4재조판, 원본비율A4축소본을 비교한다.",
  args: (paper: "suneung", year: 2027, session: "6월 모의평가", area: "게임탐구", subject: "마인크래프트", period: 4, selected: true),
  arg-types: (paper: (control: "select", options: ("suneung", "a4", "a4-scaled")), period: (control: "number", min: 1, max: 5, step: 1)),
  render: (args) => exam(paper: args.paper, year: args.year, session: args.session, area: args.area, subject: args.subject, period: args.period, selected: args.selected, total-pages: if args.paper == "a4" { auto } else { 4 })[
    #minecraft-paper(flow: if args.paper == "a4" { "continuous" } else { "paged" })
  ],
)

#story(
  title: "A4 인쇄용 시험지",
  description: "실제크기100%로 인쇄하는A4전용조판. 본문10.5pt·표9pt,20문항을 자동으로 배치한다.",
  args: (year: 2027, session: "6월 모의평가", area: "게임탐구", subject: "마인크래프트", period: 4, selected: true),
  arg-types: (period: (control: "number", min: 1, max: 5, step: 1)),
  render: (args) => exam(paper: "a4", year: args.year, session: args.session,
    area: args.area, subject: args.subject, period: args.period, selected: args.selected)[
    #minecraft-paper(flow: "continuous")
  ],
)

#story(
  title: "이어지는 페이지",
  description: "첫 장의 수험생 정보란 없이 이어지는 머리말과 페이지 번호를 확인한다.",
  args: (page: 2, area: "게임탐구", subject: "마인크래프트", selected: true),
  arg-types: (page: (control: "select", options: (2, 3, 4))),
  render: (args) => exam(year: 2027, session: [6월 모의평가], area: args.area, subject: args.subject, period: 4, selected: args.selected, total-pages: 4, page-offset: args.page - 1)[
    #minecraft-page(args.page)
  ],
)

#story(
  title: "시험 정보 변형",
  description: "학년도·시험 명칭·교시·선택 과목·문제지 형을 바꾸어 머리말의 조합을 확인한다.",
  args: (year: 2027, session: "", area: "게임탐구", subject: "마인크래프트", period: 4, selected: true, form: "짝수형"),
  arg-types: (period: (control: "number", min: 1, max: 5, step: 1), form: (control: "select", options: ("", "홀수형", "짝수형"))),
  render: (args) => exam(year: args.year, session: args.session, area: args.area, subject: args.subject, period: args.period, selected: args.selected, form: if args.form == "" { none } else { args.form }, total-pages: 4)[
    #minecraft-page(1)
  ],
)

#story(
  title: "공통 영역 판면",
  description: "국어·수학·영어처럼 응시자 정보란 없이 시작하는 판면. Minecraft는 창작 영역명이다.",
  args: (year: 2027, session: "9월 모의평가", area: "마인크래프트", period: 2, form: "홀수형"),
  arg-types: (period: (control: "number", min: 1, max: 5), form: (control: "select", options: ("", "홀수형", "짝수형"))),
  render: (args) => exam(year: args.year, session: args.session, area: args.area,
    subject: none, period: args.period, layout: "standard", tab-label: none,
    form: if args.form == "" { none } else { args.form }, total-pages: 4)[
      #minecraft-page(1)
    ],
)

#story(
  title: "책자 쪽번호",
  description: "큰 쪽번호는 과목의 1쪽, 하단 쪽번호는 탐구 합본의 17/36처럼 독립 지정한다.",
  args: (booklet-offset: 16, booklet-pages: 36),
  arg-types: (booklet-offset: (control: "number", min: 0, max: 100), booklet-pages: (control: "number", min: 1, max: 200)),
  render: (args) => exam(booklet-offset: args.booklet-offset, booklet-pages: args.booklet-pages)[
    #minecraft-page(1)
  ],
)
