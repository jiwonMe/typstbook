#let callout(title: "Note", variant: "info", body) = {
  let colors = (
    info: (border: rgb("#239DAD"), bg: rgb("#e7f6f8")),
    warning: (border: rgb("#d97706"), bg: rgb("#fff7ed")),
    error: (border: rgb("#dc2626"), bg: rgb("#fef2f2")),
  )
  let c = colors.at(variant)
  block(
    width: 100%,
    inset: 12pt,
    fill: c.bg,
    stroke: (left: 3pt + c.border),
    radius: 4pt,
  )[
    #strong(title)
    #parbreak()
    #body
  ]
}

#let resume(name: "Name", role: "Role", doc) = {
  set page(paper: "a5", margin: 16pt)
  set text(size: 11pt)
  align(center)[
    #text(size: 20pt, weight: "bold")[#name]
    #parbreak()
    #text(fill: rgb("#555555"))[#role]
  ]
  line(length: 100%)
  doc
}

#let note-rule(doc) = {
  show raw.where(block: true): it => block(
    width: 100%,
    fill: rgb("#f4f4f5"),
    inset: 8pt,
    radius: 4pt,
    it,
  )
  doc
}
