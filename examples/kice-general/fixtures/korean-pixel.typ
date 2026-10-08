#import "../src/lib.typ": exam, instruction, framed-passage, question, choices, view, dialogue, quotation, paper-presets

// A calibration manuscript on the 2026 June Korean first-page coordinates.
// Prose and questions are newly written; only generic exam labels are shared.
#let pixel-lines = (
  "독자가 게임의 기록을 읽을 때에는 상태를 확인한다.",
  "화면에 보이는 장면과 저장된 값은 구분해야 한다.",
  "플레이어가 떠난 곳의 작물은 그대로 남을 수 있다.",
  "같은 시간이 흘렀어도 모든 밭이 자라는 것은 아니다.",
  "후보 위치가 선택되어야 생장 판정을 실행한다.",
  "성숙한 작물은 같은 상태를 유지한다.",
  "한 포기의 생장과 밭 전체의 수확량은 서로 다르다.",
  "관찰한 상태만으로 모든 처리 과정을 단정하지 않는다.",
  "기록을 비교할 때에는 먼저 조건을 맞춘다.",
  "같은 공간에 심은 작물의 수를 함께 적는다.",
  "어느 위치가 처리되는지 확인하는 과정이 필요하다.",
  "기계가 멈춘 장면은 여러 원인으로 생길 수 있다.",
  "입력이 끊기거나 출력 상자가 찼을 수도 있다.",
  "부분만 보고 장치 전체의 원리를 바꾸어 설명하지 않는다.",
  "서로 다른 원인들이 같은 결과를 만들기도 한다.",
  "이때에는 입력과 출력의 기록을 다시 살펴본다.",
  "반복되는 관찰에서 바뀐 조건을 찾아야 한다.",
  "관찰의 범위를 밝히면 결론의 의미가 분명해진다.",
  "단순한 횟수와 확률의 비교도 구별해야 한다.",
  "선택된 횟수가 실제 성공 횟수와 같지는 않다.",
  "첫 성공 뒤 상태가 바뀌면 다음 판정도 달라진다.",
  "성숙 상태에 도달하면 그 상태를 계속 유지한다.",
  "성공한 시점 이후의 선택을 다시 더하지 않는다.",
  "따라서 상태와 사건을 따로 기록하는 것이 필요하다.",
  "한 번의 관찰로는 변화의 원인을 확정하기 어렵다.",
  "여러 조건을 바꾸면 어느 차이가 작용했는지 모른다.",
  "비교할 조건 하나를 정하고 나머지를 유지한다.",
  "다른 조건의 결과는 별도의 기록으로 정리한다.",
  "수확량은 작물의 수와 성숙 가능성을 함께 반영한다.",
  "읽는 사람은 기록과 그 해석을 구분해야 한다.",
  "관찰의 조건을 밝히면 서로 다른 설명을 비교할 수 있다.",
)

#let pixel-prose = {
  for (index, row) in pixel-lines.enumerate() {
    if (8, 18).contains(index) { parbreak() }
    else if index > 0 { linebreak() }
    row
  }
}

#let two-line-options = (
  [관찰된 상태만으로 장치의 모든 변화를#linebreak()한 가지 원인으로 설명한다.],
  [처리 조건과 관찰 범위를 함께 확인하여#linebreak()기록의 의미를 판단한다.],
  [선택 횟수와 성공 횟수를 같은 값으로#linebreak()생각하여 결과를 비교한다.],
  [작물의 수를 생략하고 한 포기의 확률만#linebreak()비교하여 수확량을 정한다.],
  [상태가 바뀐 뒤에도 처음과 같은 사건을#linebreak()반복해서 더한다.],
)

#let korean-pixel-page(paper: "suneung") = {
  assert(("suneung", "a4-scaled").contains(paper), message: "픽셀 기준판은 원본 또는 비례 축소 판형을 사용합니다")
  let s = paper-presets.at(paper).scale
  exam(paper: paper, year: 2026,
  session: [6월 모의평가], typography: "korean", layout: "standard",
  area: [국어], subject: none, period: 1, total-pages: 20, tab-label: none,
  notice: [이 문제지는 마인크래프트를 소재로 만든 비공식 창작 예시입니다.])[
  #place(top + left, dy: 0pt, instruction(1, to: 3))
  #place(top + left, dy: 24.880pt * s, framed-passage(pixel-prose, height: 581.1pt))
  #place(top + left, dy: 623.660pt * s, question(1,
    [윗글의 관찰 방식에 대한 설명으로 적절한 것은?], body: [
      #choices([조건과 기록을 함께 확인한다.], [모든 장소가 같은 속도로 바뀐다.],
        [관찰 범위가 서로 다른 기록을 같은 조건에서 얻은#linebreak()결과로 생각하여 비교한다.],
        [한 장면의 상태만으로 장치 전체가 멈춘 까닭을#linebreak()분명하게 설명할 수 있다고 본다.],
        [수확량은 작물의 수와 무관하므로 한 포기의#linebreak()확률만 확인하면 밭 전체를 설명할 수 있다.])
    ]))
  #colbreak()
  #place(top + left, dy: -0.820pt * s, question(2,
    [윗글의 내용과 일치하는 것은?], body: [#choices(..two-line-options)]))
  #place(top + left, dy: 253.520pt * s, question(3,
    [관찰 기록을 바탕으로 장치의 변화를 판단하려고 한다.#linebreak()
    다음 자료와 대화를 함께 읽고,#linebreak()
    설명의 근거를 확인한 내용으로 적절한 것은?], points: 3))
  #place(top + left, dy: 311.875pt * s, view[
    #quotation(height: 102pt)[
      #set par(justify: false)
      입력 상자가 비어 있어 처리가 멈춘 장치가 있다.#linebreak()
      관찰자는 작동하던 때의 조건과 비교한다.#linebreak()
      출력 상자도 함께 확인하여 원인을 구분한다.#linebreak()
      시간의 길이만으로 처리 횟수를 단정하지 않는다.#linebreak()
      기록에는 관찰한 범위를 함께 남긴다.#parbreak()
    ]
    #v(7.919pt * s)
    #dialogue(speaker-width: none, hanging-indent: 18.965175pt * s, (
      (speaker: [학생], body: [장치가 멈춘 까닭을 어떻게 확인하나요?]),
      (speaker: [교사], body: [입력과 출력의 상태를 함께 확인한다.#linebreak()
      한 장면만으로 원인을 정하지 않는다.#linebreak()
      이전 기록과 같은 조건에서 비교한다.#linebreak()
      시간이 흐른 횟수만으로 판단하지 않는다.#linebreak()
      처리가 실행된 범위를 따로 확인한다.#linebreak()
      상태가 바뀐 뒤의 사건도 구분한다.#linebreak()
      서로 다른 설명의 근거를 비교한다.#linebreak()
      기록에 남지 않은 조건도 다시 확인한다.]),
      (speaker: [학생], body: [조건을 고정한 기록끼리 비교해야겠군요.]),
    ))
  ])
  // The source exporter overprints this left edge. Keep that raster detail
  // in the coordinate fixture rather than duplicating every generic view.
  #place(top + left, dx: 11.28pt * s, dy: 323.32005pt * s,
    line(angle: 90deg, length: 315.65995pt * s, stroke: 0.36pt * s))
  #place(top + left, dy: 646.880pt * s, choices(..two-line-options))
]
}
