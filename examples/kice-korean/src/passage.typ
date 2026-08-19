#import "fonts.typ": sans
#import "parse.typ": as-blocks, as-content

#let instruction(from, to: none, body: [다음 글을 읽고 물음에 답하시오.]) = {
  set text(font: sans)
  set par(first-line-indent: 0pt, justify: false)
  let range = if to == none or to == from {
    [[#from]]
  } else {
    [[#from～#to]]
  }
  // 단 상단 inset은 exam 헤더가 담당. 지문 상자와는 below만 두고 붙인다.
  block(sticky: true, below: 0.6em, width: 100%)[
    #range #as-content(body)
  ]
}

// 단독 지문 라벨은 가운데, (가)/(나)는 start로 왼쪽에 둔다.
#let passage-label(label, alignment: center) = {
  set par(first-line-indent: 0pt, justify: false)
  align(alignment)[#label]
}

#let passage-stroke = 0.5pt
#let passage-inset = (x: 9pt, y: 2pt)

// 높이 0 상자에 가로선을 올려, 본문 흐름을 밀지 않고 윗/아랫선을 그린다.
#let passage-cap-line(dy: 0pt) = box(width: 100%, height: 0pt, {
  place(
    top + start,
    dx: -passage-inset.x,
    dy: dy,
    line(length: 100% + 2 * passage-inset.x, stroke: passage-stroke),
  )
})

#let passage-inner(body) = {
  block(
    width: 100%,
    above: 0pt,
    stroke: (x: passage-stroke),
    inset: (x: passage-inset.x, top: 0pt, bottom: 0pt),
    breakable: true,
  )[
    #passage-cap-line()
    #v(passage-inset.y)
    #set text(top-edge: 0.88em, bottom-edge: -0.12em)
    #set par(
      leading: 0.6em,
      spacing: 0.6em,
      justify: true,
      first-line-indent: (amount: 1em, all: true),
    )
    #body
    #v(passage-inset.y)
    #passage-cap-line()
  ]
}

#let passage-frame(body) = {
  // 단 상단 inset은 exam 헤더가 담당. 상자 안은 passage-inset.y만.
  passage-inner(body)
}

#let passage(label: none, body) = {
  passage-frame({
    if label != none {
      passage-label(label)
    }
    as-blocks(body)
  })
}

#let paired-passage(ga, na) = {
  passage-frame({
    passage-label(alignment: start)[(가)]
    as-blocks(ga)
    v(0.7em)
    passage-label(alignment: start)[(나)]
    as-blocks(na)
  })
}
