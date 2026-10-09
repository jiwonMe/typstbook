#import "tokens.typ": code-fill, fonts, palette, role-color, space

#let callout(title: "Note", variant: "info", body) = {
  let c = palette.at(variant)
  block(
    width: 100%,
    inset: space.inset,
    fill: c.bg,
    stroke: (left: space.rule + c.border),
    radius: space.radius,
  )[
    #strong(title)
    #parbreak()
    #body
  ]
}

#let resume(name: "Name", role: "Role", doc) = {
  set text(size: space.body, font: fonts.body)
  align(center)[
    #text(size: space.title, weight: "bold")[#name]
    #parbreak()
    #text(fill: role-color)[#role]
  ]
  line(length: 100%)
  doc
}

#let note-rule(doc) = {
  show raw.where(block: true): it => block(
    width: 100%,
    fill: code-fill,
    inset: space.code,
    radius: space.radius,
    it,
  )
  doc
}
