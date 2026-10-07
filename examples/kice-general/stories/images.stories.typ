#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": exam, material, view, question, choices
#import "../fixtures/minecraft-images.typ": minecraft-image

#story(
  title: "비트맵 자료 이미지",
  description: "생성한 흑백 PNG를 실제 자료·보기 상자 안에 넣고 폭과 캡션, 수능·A4 축소를 확인한다.",
  args: (kind: "smelter", width: 60, box: "자료", paper: "suneung"),
  arg-types: (
    kind: (control: "select", options: ("smelter", "brewing")),
    width: (control: "select", options: (45, 60, 80)),
    box: (control: "select", options: ("자료", "보기")),
    paper: (control: "select", options: ("suneung", "a4")),
  ),
  render: (args) => exam(paper: args.paper, area: "게임탐구", subject: "마인크래프트")[
    #question(7, [그림의 장치와 작동 조건을 함께 살펴보자.], points: 3, body: [
      #let source = [
        #minecraft-image(kind: args.kind, width: args.width * 1%, caption: [장치의 외형])
        호퍼는 가동 중인 서버에서 한 번에 아이템1개를 옮기며, 성공한 전송 뒤8게임 틱의 재사용 대기시간이 생긴다. 양조기는 한 번에 최대3병을 처리한다.
      ]
      #if args.box == "자료" { material(source) } else { view(source) }
      #choices([ㄱ], [ㄴ], [ㄱ, ㄴ], [ㄱ, ㄷ], [ㄱ, ㄴ, ㄷ], columns: 2)
    ])
  ],
)
