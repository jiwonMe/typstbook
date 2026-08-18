#let underline-offset = 0.3em
#let underline-stroke = 0.45pt

#let mark(label, body) = {
  [#label#underline(offset: underline-offset, stroke: underline-stroke, evade: false, body)]
}

#let u(body) = underline(offset: underline-offset, stroke: underline-stroke, evade: false, body)

#let term-box(body) = box(
  stroke: 0.45pt,
  inset: (x: 2.4pt, y: 0.9pt),
  baseline: 18%,
)[#body]
