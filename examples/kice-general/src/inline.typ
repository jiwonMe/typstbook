#import "fonts.typ": fonts, font
#import "typography.typ": print-mode

// Strings stay plain text; Typst content keeps equations and markup intact.
#let as-content(value) = value

// Bind short prose endings and quantities only in native A4 paragraphs.
// Scope the rules to direct text runs, so narrow table cells and option grids
// retain their own wrapping opportunities.
#let print-prose(body) = context {
  if not print-mode.get() or (type(body) != content and type(body) != str) { body }
  else {
    let content = if type(body) == str { text(body) } else { body }
    let children = content.fields().at("children", default: (content,))
    for (index, child) in children.enumerate() {
      if child.func() == text {
        let next = children.slice(index + 1).find(it => it != [ ])
        {
          show regex("[가-힣]{2,12}[.!?]"): box
          show regex("[0-9]+(?:[,.][0-9]+)? ?(?:게임 틱|레드스톤 틱|개|병|칸|층|회|틱|단위)[가-힣]{0,4}"): box
          if next != none and next.func() == math.equation and next.block {
            show regex("\\b[가-힣]{2,6}$"): box
            child
          } else { child }
        }
      } else { child }
    }
  }
}

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
