#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": material, view, data-table, body-style
#import "../fixtures/block-diagrams.typ": block-map, crafting-grid

#story(
  title: "자료 상자",
  description: "자료 제목과 문단, 보기의 테두리 및 안쪽 여백을 비교한다.",
  args: (title: "제작 규칙", text: "한 개의 통나무로 판자 4개를 만든다. 남은 판자는 다음 제작에 사용할 수 있다."),
  page: (width: 132mm, height: auto, margin: 8mm),
  render: (args) => [
    #show: body-style
    #material(args.text, title: if args.title == "" { none } else { args.title })
    #v(4mm)
    #view[ㄱ. 통나무 2개로 판자 8개를 만들 수 있다. \
      ㄴ. 판자 16개를 만드는 데 통나무 4개가 필요하다.]
  ],
)

#story(
  title: "자료 표",
  description: "다섯 행의 표를 자료 상자 안에 넣어 선 굵기와 셀 정렬을 확인한다.",
  args: (),
  page: (width: 132mm, height: auto, margin: 8mm),
  render: (args) => {
    show: body-style
    material[
      몬스터는 밝기가 7 이하이고 플레이어로부터 거리가 4 이상인 빈 칸에서만 생성될 수 있다.
      #v(2mm)
      #data-table((1fr, 1fr, 1fr), header: ([장소], [밝기], [거리]), rows: (([A], [8], [5]), ([B], [6], [3]), ([C], [7], [4]), ([D], [9], [6]), ([E], [5], [2])))
    ]
  },
)

#story(
  title: "블록 도식",
  description: "흑백 제작 격자와 이동 경로 도식을 자료 상자에 배치한다.",
  args: (diagram: "이동 경로"),
  arg-types: (diagram: (control: "select", options: ("이동 경로", "제작 격자"))),
  page: (width: 132mm, height: auto, margin: 8mm),
  render: (args) => {
    show: body-style
    material[
      #if args.diagram == "이동 경로" [
        플레이어는 흰 칸 사이에서 변으로 맞닿은 칸으로만 이동한다. 회색 칸은 통과할 수 없다.
        #v(2mm)
        #block-map()
      ] else [
        도끼 1개를 만들 때 철 3개와 막대 2개를 사용한다.
        #v(2mm)
        #crafting-grid()
      ]
    ]
  },
)
