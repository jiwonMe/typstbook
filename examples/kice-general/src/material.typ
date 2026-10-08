#import "fonts.typ": fonts, font, sizes
#import "inline.typ": as-content, as-blocks, print-prose
#import "typography.typ": typography-profiles, print-typography-profiles, typography-state, typography-config, print-mode

#let material-stroke = 0.36pt
#let korean-view-title = (
  width: 45.06pt, height: 11.5pt, baseline: 9.289898pt, center-offset: 0.03pt,
  left-angle-x: -0.18pt, left-angle-width: 7.964285pt,
  bo-x: 7.3801pt, gi-x: 26.81786pt,
  right-angle-x: 37.74286pt, right-angle-width: 8.01895pt,
)
#let quotation-layout = (
  top-gap: 0.561pt, left: 1.98pt, right: -2.04pt,
  x: 8.52pt, top: 9.338102pt, bottom: 9pt,
  reference-top-stroke: 0.30pt,
)

// An inner quotation frame used by Korean questions that quote a second
// source inside <보기>. Its prose keeps the same serif role and 95% measure.
#let quotation(body, height: auto, font-config: fonts) = context {
  let style = typography-config()
  let unit(value) = value * (text.size / style.body-size)
  let reference = typography-state.get() == "korean" and not print-mode.get()
  let stroke = unit(material-stroke)
  set text(font: font("body", config: font-config))
  set par(justify: true, leading: style.material-leading, spacing: style.material-leading,
    first-line-indent: (amount: style.first-indent / style.body-size / 0.95 * 1em, all: true))
  v(unit(quotation-layout.top-gap))
  pad(left: unit(quotation-layout.left), right: unit(quotation-layout.right),
    block(width: 100%, height: if height == auto { auto } else { unit(height) },
      stroke: if reference { (left: stroke, right: stroke) } else { stroke }, breakable: false,
      inset: (x: unit(quotation-layout.x), top: unit(quotation-layout.top), bottom: unit(quotation-layout.bottom)),
      above: 0pt, below: 0pt)[
      #if reference {
        // The selected source uses a 0.30pt upper cap and 0.36pt sides/bottom.
        // Separate lines also preserve its cap ends beyond the side centers.
        place(top + left, dx: -unit(quotation-layout.x) - stroke / 2,
          dy: -unit(quotation-layout.top),
          line(length: 100% + 2 * unit(quotation-layout.x) + stroke,
            stroke: unit(quotation-layout.reference-top-stroke)))
        place(bottom + left, dx: -unit(quotation-layout.x) - stroke / 2,
          dy: unit(quotation-layout.bottom),
          line(length: 100% + 2 * unit(quotation-layout.x) + stroke, stroke: stroke))
      }
      #if print-mode.get() { print-prose(as-blocks(body)) } else { as-blocks(body) }#parbreak()
    ])
}

#let reference-view-title(unit, font-config) = context {
  let t = korean-view-title
  let glyph(role, body, x, width: auto) = {
    let letters = box(text(font: font(role, config: font-config), size: unit(sizes.body),
      tracking: 0em, top-edge: 0pt, bottom-edge: 0pt, body))
    let ratio = if width == auto { 95% } else { unit(width) / measure(letters).width * 100% }
    place(top + left, dx: unit(x), dy: unit(t.baseline),
      box(scale(x: ratio, y: 100%, reflow: true, letters)))
  }
  box(width: unit(t.width), height: unit(t.height), fill: white)[
    #glyph("label", [<], t.left-angle-x, width: t.left-angle-width)
    #glyph("body", [보], t.bo-x)
    #glyph("body", [기], t.gi-x)
    #glyph("label", [>], t.right-angle-x, width: t.right-angle-width)
  ]
}
// General source material: serif body text inside a complete rectangle.
#let material(body, title: none, justify: auto, font-config: fonts) = context {
  let name = typography-state.get()
  let style = typography-config()
  let unit(value) = value * (text.size / style.body-size)
  v(if print-mode.get() { style.material-gap } else { 0.47348em })
  // Keep the outer offset in body ems; source text uses the central material role.
  pad(left: unit(style.outer-left), right: unit(style.outer-right), {
    set text(font: font("material", config: font-config), size: unit(style.material-size))
    set par(first-line-indent: (amount: style.first-indent / style.material-size / 0.95 * 1em, all: true),
      justify: if justify == auto { print-mode.get() or name == "korean" } else { justify },
      leading: style.material-leading, spacing: style.material-leading)
    block(
      width: 100%,
      stroke: unit(material-stroke),
      inset: (x: unit(style.material-x), top: unit(style.material-top), bottom: unit(style.material-bottom)),
      breakable: false,
      above: 0pt,
      below: 0pt,
    )[
      #if title != none {
        align(center, text(font: font("label", config: font-config), as-content(title)))
        v(0.35em)
      }
      #if print-mode.get() { print-prose(as-blocks(body)) } else { as-blocks(body) }
      #parbreak()
    ]
  })
}

// KICE's <보기> title interrupts the top border. The white title backing is
// measured in its actual font, so changing the central font config is safe.
#let view(body, title: auto, font-config: fonts) = context {
  let name = typography-state.get()
  let style = typography-config()
  let unit(value) = value * (text.size / style.body-size)
  let inset-top = unit(style.view-top)
  set text(font: font("body", config: font-config))
  set par(first-line-indent: (amount: style.first-indent / style.body-size / 0.95 * 1em, all: true),
    justify: print-mode.get() or name == "korean", leading: style.view-leading, spacing: style.view-leading)
  v(0.99522em)
  pad(left: unit(style.outer-left), right: unit(style.outer-right), block(
    width: 100%,
    stroke: unit(material-stroke),
    inset: (x: unit(style.view-x), top: inset-top, bottom: unit(style.view-bottom)),
    breakable: false,
    above: 0pt,
    below: 0pt,
  )[
    #context {
      let heading-text = if title == auto {
        [#text(font: font("label", config: font-config))[<]#text(font: font("body", config: font-config))[보#h(0.35em)기]#text(font: font("label", config: font-config))[>]]
      } else { as-content(title) }
      let reference-korean = name == "korean" and not print-mode.get() and title == auto
      let heading = if reference-korean { reference-view-title(unit, font-config) } else { box(scale(x: 95%, y: 100%, reflow: true, box(
        fill: white,
        inset: (x: 0.35em),
        text(font: font("body", config: font-config), size: unit(if print-mode.get() { sizes.print-body } else { sizes.body }), heading-text),
      ))) }
      place(top + center, dx: if reference-korean { unit(korean-view-title.center-offset) } else { 0pt },
        dy: -inset-top - measure(heading).height / 2, heading)
    }
    #if print-mode.get() { print-prose(as-blocks(body)) } else { as-blocks(body) }
    #parbreak()
  ])
}

// columns is a count or a track tuple; rows is a tuple of row tuples.
#let data-table(columns, header: (), rows: (), align: center, font-config: fonts,
  size: auto, header-size: auto) = context {
  let style = typography-config()
  let unit(value) = value * (text.size / style.body-size)
  let cell-size = if size == auto { style.table-size } else { size }
  let heading-size = if header-size == auto { style.table-heading-size } else { header-size }
  let count = if type(columns) == int { columns } else { columns.len() }
  assert(count > 0, message: "kice-general: 표의 열 수는 양수여야 합니다")
  assert(header.len() == 0 or header.len() == count, message: "kice-general: 표 머리글 수와 열 수가 일치해야 합니다")
  let cells = ()
  if header.len() > 0 {
    cells += header.map(cell => [#text(
      font: font(style.table-heading-role, config: font-config),
      size: unit(heading-size),
      as-content(cell),
    )#parbreak()])
  }
  for row in rows {
    assert(row.len() == count, message: "kice-general: 표 행의 셀 수와 열 수가 일치해야 합니다")
    cells += row.map(cell => [#as-content(cell)#parbreak()])
  }
  set text(font: font(style.table-role, config: font-config), size: unit(cell-size))
  set par(first-line-indent: 0pt, justify: false, leading: style.table-leading, spacing: 0.3em)
  table(
    columns: columns,
    stroke: unit(0.36pt),
    inset: (x: 0.45em, y: if print-mode.get() { style.table-cell-y } else { 0.35em }),
    align: align,
    ..cells,
  )
}

// Full-column Korean reading passage, distinct from an inset question box.
#let passage(body, font-config: fonts) = context {
  let style = if print-mode.get() { print-typography-profiles.korean } else { typography-profiles.korean }
  let unit(value) = value * (text.size / style.body-size)
  set text(font: font("body", config: font-config))
  set par(first-line-indent: (amount: style.first-indent / style.body-size / 0.95 * 1em, all: true),
    justify: true, leading: style.material-leading, spacing: style.material-leading)
  pad(right: unit(0.18pt), block(width: 100%, stroke: unit(material-stroke),
    inset: (x: unit(8.52pt), top: unit(style.material-top), bottom: unit(style.material-bottom)),
    breakable: true, above: 0pt, below: 0pt)[#if print-mode.get() { print-prose(as-blocks(body)) } else { as-blocks(body) }#parbreak()])
}

// Each statement has its own hanging paragraph, including tall inline math.
#let statements(..items) = context {
  let style = typography-config()
  let indent = (if print-mode.get() { style.statement-indent } else if typography-state.get() == "math" { 19.32pt } else { 17.34pt }) / style.body-size * 1em
  let labels = ("ㄱ.", "ㄴ.", "ㄷ.", "ㄹ.", "ㅁ.")
  assert(items.pos().len() <= labels.len())
  set par(first-line-indent: 0pt, hanging-indent: 0pt, justify: print-mode.get(), spacing: 0pt)
  for (index, item) in items.pos().enumerate() {
    if index > 0 { v(style.view-leading) }
    pad(left: indent, [#h(-indent / 0.95)#box(width: indent / 0.95, labels.at(index))#if print-mode.get() { print-prose(as-content(item)) } else { as-content(item) }#parbreak()])
  }
}

#let response-section(label: "5지선다형", font-config: fonts) = context {
  assert(("5지선다형", "단답형").contains(label))
  let style = typography-config()
  let unit(value) = value * (text.size / style.body-size)
  v(unit(1.12pt))
  block(width: unit(if label == "5지선다형" { 110.16pt } else { 78.90pt }),
    height: unit(if label == "5지선다형" { 23.46pt } else { 23.52pt }),
    stroke: unit(material-stroke), above: 0pt, below: 0pt, {
      let baseline = unit(if label == "5지선다형" { 16.98pt } else { 17.04pt })
      let letters(dx, ratio, tracking, body) = place(top + left, dx: unit(dx), dy: baseline,
        box(scale(x: ratio, y: 100%, reflow: true,
          box(text(font: font("badge", config: font-config), size: unit(sizes.response-heading),
            top-edge: 0pt, bottom-edge: 0pt, tracking: tracking, body)))))
      if label == "5지선다형" {
        letters(21pt, 93%, 0em, [5])
        letters(29.58pt, 95%, 0.0611em, [지선다형])
      } else { letters(17.22pt, 95%, 0.0611em, [단답형]) }
    })
  v(unit(33.78pt))
}
