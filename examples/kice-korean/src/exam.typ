#import "fonts.typ": serif

#let exam(
  paper: "a4",
  column-count: 2,
  margin: (x: 13mm, y: 15mm),
  gutter: 6.5mm,
  size: 10pt,
  body,
) = {
  set page(paper: paper, margin: margin, columns: column-count)
  set columns(gutter: gutter)
  set text(
    lang: "ko",
    size: size,
    font: serif,
    top-edge: "ascender",
    bottom-edge: "descender",
  )
  set par(justify: true, leading: 0.7em, spacing: 0.7em)
  body
}
