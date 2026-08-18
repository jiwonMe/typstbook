#import "parse.typ": as-blocks, as-content

#let choice-marks = ("①", "②", "③", "④", "⑤")

#let view(title: "<보기>", body) = {
  let heading = if title == "<보기>" { "<보 기>" } else { title }
  align(center, block(
    width: 92%,
    stroke: 0.5pt,
    inset: (x: 10pt, y: 8pt),
    breakable: false,
  )[
    #set par(
      first-line-indent: 0pt,
      justify: true,
      leading: 0.72em,
      spacing: 0.72em,
    )
    #align(center)[#heading]
    #v(0.35em)
    #as-blocks(body)
  ])
}

#let choices(..items) = {
  let values = items.pos()
  assert(values.len() == 5, message: "kice-korean: 선지는 5개여야 합니다")
  set par(first-line-indent: 0pt, justify: true)
  v(0.35em)
  for (i, item) in values.enumerate() {
    block(spacing: 0.3em, width: 100%)[
      #grid(
        columns: (1.55em, 1fr),
        column-gutter: 0.12em,
        choice-marks.at(i),
        as-content(item),
      )
    ]
  }
}

#let question(number, points: none, prompt, body: none) = {
  set par(first-line-indent: 0pt, justify: true)
  block(breakable: true, above: 1.45em, below: 0pt, width: 100%)[
    #grid(
      columns: (1.65em, 1fr),
      column-gutter: 0.12em,
      [#number.],
      [
        #as-content(prompt)#if points != none [ [#points;점]]
      ],
    )
    #if body != none { body }
  ]
}
