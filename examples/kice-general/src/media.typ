#import "fonts.typ": fonts, font

// Supply native image content so its file path resolves in the author's source.
// The enclosing block supplies a precise width and keeps caption + image intact.
#let exam-image(body, width: 60%, caption: none, font-config: fonts) = {
  v(0.35em)
  align(center, block(width: width, breakable: false, above: 0pt, below: 0pt)[
    #body
    #if caption != none {
      v(0.3em)
      set text(font: font("label", config: font-config), size: 0.85em)
      set par(first-line-indent: 0pt, justify: false, leading: 0.25em)
      align(center, caption)
      parbreak()
    }
  ])
  v(0.35em)
}
