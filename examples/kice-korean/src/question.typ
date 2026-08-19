#import "parse.typ": as-blocks, as-content
#import "passage.typ": passage-inset

#let choice-marks = ("①", "②", "③", "④", "⑤")

// 평가원 <보기> 상자. 제목은 윗선 가운데에 흰 배경으로 올려 선을 끊는다.
#let view(title: "<보기>", body) = {
  let heading = if title == "<보기>" { "<보   기>" } else { title }
  let inset-x = passage-inset.x
  // 제목이 윗선에 걸치므로 상단 inset을 하단보다 조금 크게.
  let inset-top = 15pt
  let inset-bottom = 11pt

  v(0.65em)

  pad(left: 1em, block(
    width: 100%,
    stroke: 0.5pt,
    inset: (x: inset-x, top: inset-top, bottom: inset-bottom),
    above: 1.5em,
    below: 0.5em,
    breakable: false,
  )[
    #context {
      let label = box(fill: white, inset: (x: 0.05em), heading)
      place(top + center, dy: -inset-top - measure(label).height / 2, label)
    }
    #set par(
      first-line-indent: (amount: 1em, all: true),
      justify: true,
      leading: 0.72em,
      spacing: 0.72em,
    )
    #as-blocks(body)
  ])
}

#let choices(..items) = {
  let values = items.pos()
  assert(values.len() == 5, message: "kice-korean: 선지는 5개여야 합니다")
  set par(first-line-indent: 0pt, justify: true)
  v(0.65em)
  // 발문 번호 열과 맞춰 1em 들여쓴다.
  pad(left: 1em, {
    for (i, item) in values.enumerate() {
      block(spacing: 0.6em, width: 100%)[
        #grid(
          columns: (1em, 1fr),
          column-gutter: 0em,
          choice-marks.at(i),
          " " + [#as-content(item)],
        )
      ]
    }
  })
}

// 문항은 단·페이지 중간에서 쪼개지지 않는다.
// 번호는 큰 굵은 글씨지만 발문과 같은 문단에 두어 baseline을 맞춘다.
#let question(number, points: none, prompt, body: none) = {
  set par(first-line-indent: 0pt, justify: true)
  block(breakable: false, above: 0pt, below: 0pt, width: 100%)[
    #par(hanging-indent: 1em)[
      #box(width: 1em, text(size: 1.18em, weight: "bold")[#number.])
      #as-content(prompt)#if points != none [ [#points;점]]
    ]
    #if body != none { body }
  ]
}

// 문항은 문서 흐름에 바로 이어 붙인다.
// context/layout으로 남은 높이를 재서 큰 블록을 만들면, 지문의 첫 조각(이전 단 끝) 뒤에
// 붙어서 지문이 이어진 단의 남은 칸을 건너뛴다.
#let spread-blocks(items, gap: 1.45em, gutter: 6.5mm) = {
  if items.len() == 0 {
    none
  } else {
    items.at(0)
    for item in items.slice(1) {
      v(gap)
      item
    }
  }
}
