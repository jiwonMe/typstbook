#import "fonts.typ": fonts, font

// Strings stay plain text; Typst content keeps equations and markup intact.
#let as-content(value) = value

// A blank line separates paragraphs in string controls. Content can contain any
// normal Typst blocks; an array is a convenient list of paragraphs.
#let as-blocks(value) = {
  if type(value) == str {
    value
      .split(regex("\n[ \t]*\n"))
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph != "")
      .map(paragraph => paragraph.replace(regex("\n"), " "))
      .join(parbreak())
  } else if type(value) == array {
    value.map(item => as-blocks(item)).join(parbreak())
  } else {
    value
  }
}

#let underline-offset = 0.2em
#let underline-stroke = 0.45pt

#let u(body) = underline(
  offset: underline-offset,
  stroke: underline-stroke,
  evade: false,
  as-content(body),
)

#let mark(label, body, font-config: fonts) = [
  #text(font: font("label", config: font-config), as-content(label))#u(body)
]

#let term-box(body) = box(
  stroke: 0.45pt,
  inset: (x: 2.4pt, y: 0.9pt),
  baseline: 18%,
  as-content(body),
)

#let labeled-box(label, font-config: fonts) = text(
  font: font("label", config: font-config),
  term-box(label),
)
