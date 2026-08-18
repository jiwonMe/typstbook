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
  block(below: 0.45em, width: 100%)[
    #range #as-content(body)
  ]
}

#let passage-label(label) = {
  set par(first-line-indent: 0pt, justify: false)
  align(center)[#label]
}

#let passage-stroke = 0.5pt
#let passage-inset = (x: 9pt, y: 2pt)

#let passage-cap-line(dy: 0pt) = box(width: 100%, height: 0pt, {
  place(
    top + start,
    dx: -passage-inset.x,
    dy: dy,
    line(length: 100% + 2 * passage-inset.x, stroke: passage-stroke),
  )
})

#let passage-frame(body) = {
  // Bottom inset is cloned onto every fragment, so the cut keeps padding.
  // Top inset is in-flow only, so the continuation does not get a second gap.
  block(
    width: 100%,
    stroke: (x: passage-stroke),
    inset: (x: passage-inset.x, top: 0pt, bottom: passage-inset.y),
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
    #passage-cap-line(dy: passage-inset.y)
  ]
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
    passage-label[(가)]
    as-blocks(ga)
    v(0.7em)
    passage-label[(나)]
    as-blocks(na)
  })
}
