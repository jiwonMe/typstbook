#import "tokens.typ": code-fill, fonts, palette, role-color, space

/// A bordered callout for notes, warnings, and errors.
///
/// - title (str): Heading shown above the body.
/// - variant (str): One of `info`, `warning`, or `error`.
/// - body (content): Main message; markup args are supported in stories.
/// -> content
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

/// Compact resume header followed by the document body.
///
/// - name (str): Person name.
/// - role (str): Role or title line.
/// - doc (content): Remaining resume content.
/// -> content
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

/// Style rule that wraps block raw content in a filled code panel.
///
/// - doc (content): Document to wrap.
/// -> content
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
