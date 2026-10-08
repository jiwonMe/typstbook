#import "fonts.typ": fonts, font, sizes
#import "inline.typ": as-content, as-blocks, print-prose
#import "typography.typ": typography-profiles, print-typography-profiles, print-mode, print-flow-geometry

// Physical reference values scale with the surrounding exam body. Families and
// the smaller source/note sizes remain in the shared fonts.typ configuration.
#let korean-layout = (
  stroke: 0.36pt,
  frame-x: 8.52pt,
  frame-y: 5pt,
  reference-frame-top: 10.539pt,
  reference-frame-bottom: 7.661pt,
  instruction-gap: 0.6em,
  instruction-reference-gap: 13.38pt,
  // Original-font metrics differ from the bundled counterpart. The additional
  // -0.48pt aligns actual 300dpi ink while preserving the paragraph's advance.
  instruction-baseline-shift: -1.3585pt,
  instruction-bracket-shift: -0.2415pt,
  instruction-bracket-width: 3.233875pt,
  instruction-bracket-advance: 3.1792pt,
  instruction-digit-advance: 7.19965pt,
  instruction-final-advance: 7.13393pt,
  instruction-wide-advance: 10.32405pt,
  instruction-after-range: 5.407825pt,
  instruction-word-spacing: 132%,
  section-gap: 0.65em,
  heading-gap: 0.3em,
  stanza-gap: 0.7em,
  stanza-keep-height: 18em,
  stanza-keep-fraction: 0.45,
  verse-indent: 1em,
  source-gap: 0.45em,
  note-gap: 0.25em,
  excerpt-gap: 0.65em,
  range-lane: 2.3em,
  range-inset: 0.45em,
  range-cap: 0.5em,
  range-label-gap: 0.3em,
  range-keep-height: 18em,
  range-keep-fraction: 0.45,
)

#let _korean-style() = if print-mode.get() { print-typography-profiles.korean } else { typography-profiles.korean }
#let _unit(value) = value * (text.size / _korean-style().body-size)

#let instruction(from, to: none, body: [다음 글을 읽고 물음에 답하시오.], font-config: fonts) = context {
  set text(font: font("korean-instruction", config: font-config))
  set par(first-line-indent: 0pt, hanging-indent: 0pt, justify: false)
  let span = if to == none or to == from { str(from) } else { str(from) + "～" + str(to) }
  let reference = not print-mode.get()
  let range-label = if reference {
    let glyph(char) = box(text(tracking: 0em, top-edge: 0pt, bottom-edge: 0pt, char))
    let bracket(char, advance) = {
      let letter = glyph(char)
      box(width: _unit(advance) / 0.95, move(dy: _unit(korean-layout.instruction-bracket-shift),
        box(scale(x: _unit(korean-layout.instruction-bracket-width) / measure(letter).width / 0.95 * 100%,
          y: 100%, reflow: true, letter))))
    }
    [#bracket("[", korean-layout.instruction-bracket-advance)#for (index, char) in span.clusters().enumerate() {
      let letter = glyph(char)
      let advance = if char == "～" { korean-layout.instruction-wide-advance }
        else if index == span.clusters().len() - 1 { korean-layout.instruction-final-advance }
        else { korean-layout.instruction-digit-advance }
      box(width: _unit(advance) / 0.95, letter)
    }#bracket("]", korean-layout.instruction-bracket-width)#h(_unit(korean-layout.instruction-after-range) / 0.95)]
  } else { [[#span] ] }
  let content = [
    #range-label#text(spacing: if reference { korean-layout.instruction-word-spacing } else { 100% }, as-content(body))#parbreak()
  ]
  // Keep sticky on the outermost flow block. Moving that block itself would
  // detach the instruction from its passage at the bottom of a column.
  block(width: 100%, sticky: true, above: 0pt,
    below: if reference { _unit(korean-layout.instruction-reference-gap) } else { korean-layout.instruction-gap },
    if reference {
      move(dy: _unit(korean-layout.instruction-baseline-shift),
        block(width: 100%, above: 0pt, below: 0pt, content))
    } else { content })
}

#let passage-heading(label, alignment: left, font-config: fonts) = {
  set text(font: font("korean-section", config: font-config))
  set par(first-line-indent: 0pt, hanging-indent: 0pt, justify: false)
  block(width: 100%, sticky: true, above: 0pt, below: korean-layout.heading-gap,
    align(alignment, [#as-content(label)#parbreak()]))
}

// A zero-height cap belongs to the beginning or end of the complete passage.
// A split block therefore continues with side borders alone at column breaks.
#let _frame-cap(inset, stroke, sticky: false, height: 0pt, end: false) = block(width: 100%, height: height,
  above: 0pt, below: 0pt, sticky: sticky, {
  place(top + left, dx: -inset - stroke / 2, dy: if end { -stroke / 2 } else { stroke / 2 },
    line(length: 100% + 2 * inset + stroke, stroke: stroke))
})

#let framed-passage(body, height: auto, font-config: fonts) = context {
  let style = _korean-style()
  let inset = _unit(korean-layout.frame-x)
  let stroke = _unit(korean-layout.stroke)
  set text(font: font("body", config: font-config))
  set par(
    first-line-indent: (amount: style.first-indent / style.body-size / 0.95 * 1em, all: true),
    hanging-indent: 0pt, justify: true,
    leading: style.material-leading, spacing: style.material-leading,
  )
  pad(right: _unit(0.18pt), block(width: 100%, height: if height == auto { auto } else { _unit(height) }, above: 0pt, below: 0pt,
    stroke: if height == auto { (left: stroke, right: stroke) } else { none },
    inset: (x: inset, top: 0pt, bottom: 0pt), breakable: height == auto)[
    #if height != auto {
      // A fixed reference frame can use stroked paths rather than filled
      // side strips; their antialiasing differs at small raster resolutions.
      place(top + left, dx: -inset, line(angle: 90deg, length: 100%, stroke: stroke))
      place(top + right, dx: inset, line(angle: 90deg, length: 100%, stroke: stroke))
      place(bottom + left, dx: -inset - stroke / 2, dy: -stroke / 2,
        line(length: 100% + 2 * inset + stroke, stroke: stroke))
    }
    #_frame-cap(inset, stroke, sticky: true, height: _unit(if print-mode.get() { korean-layout.frame-y } else { korean-layout.reference-frame-top }))
    #if print-mode.get() { print-prose(as-blocks(body)) } else { as-blocks(body) }
    #parbreak()
    #v(_unit(if print-mode.get() { korean-layout.frame-y } else { korean-layout.reference-frame-bottom }))
    #if height == auto { _frame-cap(inset, stroke, end: true) }
  ])
}

#let passage-sections(sections, font-config: fonts) = {
  assert(type(sections) == array and sections.len() > 0,
    message: "kice-general: 지문은 한 개 이상의 section을 사용해야 합니다")
  framed-passage(font-config: font-config, {
    for (index, section) in sections.enumerate() {
      assert(type(section) == dictionary and "body" in section,
        message: "kice-general: 지문 section은 body가 있는 dictionary여야 합니다")
      if index > 0 { v(korean-layout.section-gap) }
      let label = section.at("label", default: none)
      if label != none { passage-heading(label, font-config: font-config) }
      as-blocks(section.body)
      parbreak()
    }
  })
}

#let paired-passage(ga, na, font-config: fonts) = passage-sections((
  (label: [(가)], body: ga),
  (label: [(나)], body: na),
), font-config: font-config)

// Each poetic line owns a paragraph: author-supplied line boundaries stay
// intact, while a line longer than the column wraps with a hanging indent.
#let verse(stanzas, keep-stanzas: auto, font-config: fonts) = context {
  assert(type(stanzas) == array and stanzas.all(stanza => type(stanza) == array),
    message: "kice-general: verse는 각 연의 행을 담은 tuple의 tuple을 사용합니다")
  assert((auto, true, false).contains(keep-stanzas),
    message: "kice-general: keep-stanzas는 auto, true, false입니다")
  set text(font: font("body", config: font-config))
  let style = _korean-style()
  let geometry = print-flow-geometry.get()
  let keep-height = korean-layout.stanza-keep-height.to-absolute()
  let limit = if geometry == none { keep-height }
    else { calc.min(keep-height, geometry.height * korean-layout.stanza-keep-fraction) }
  set par(first-line-indent: 0pt, hanging-indent: korean-layout.verse-indent,
    justify: false, leading: style.material-leading, spacing: style.material-leading)
  for (index, stanza) in stanzas.enumerate() {
    if index > 0 { v(korean-layout.stanza-gap) }
    let stanza-body = { for line in stanza { par(as-content(line)) } }
    layout(available => {
      let height = measure(block(width: available.width, above: 0pt, below: 0pt, stanza-body)).height
      let capacity = if geometry == none { available.height } else { geometry.height }
      let together = if keep-stanzas == false { false }
        else if keep-stanzas == auto { height <= limit }
        else { height <= capacity }
      block(width: 100%, above: 0pt, below: 0pt, breakable: not together, stanza-body)
    })
  }
}

#let source-line(author, title, font-config: fonts) = context {
  let style = _korean-style()
  let size = if print-mode.get() { sizes.print-korean-source } else { sizes.korean-source }
  v(korean-layout.source-gap)
  set text(font: font("body", config: font-config), size: text.size * (size / style.body-size))
  set par(first-line-indent: 0pt, hanging-indent: 0pt, justify: false)
  block(width: 100%, above: 0pt, below: 0pt, breakable: false,
    align(right, [#text("-") #as-content(author), 「#as-content(title)」 #text("-")#parbreak()]))
}

// Vocabulary notes stay inside the passage rather than moving to a page-wide
// footnote area. The serif role follows the selected central font profile.
#let passage-notes(items, font-config: fonts) = context {
  assert(type(items) == array and items.all(item => type(item) == dictionary and "term" in item and "body" in item),
    message: "kice-general: 어휘주는 term과 body가 있는 dictionary의 tuple입니다")
  let style = _korean-style()
  let size = if print-mode.get() { sizes.print-korean-note } else { sizes.korean-note }
  v(korean-layout.note-gap)
  set text(font: font("body", config: font-config), size: text.size * (size / style.body-size))
  set par(first-line-indent: 0pt, hanging-indent: 1em, justify: false,
    spacing: korean-layout.note-gap)
  for item in items { par([#text("*") #as-content(item.term) : #as-content(item.body)]) }
}

#let excerpt-gap(label: [중략], font-config: fonts) = {
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt, hanging-indent: 0pt, justify: false)
  block(width: 100%, above: korean-layout.excerpt-gap, below: korean-layout.excerpt-gap,
    align(center, [(#as-content(label))]))
}

#let synopsis(body, font-config: fonts) = {
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt)
  block(width: 100%, above: 0pt, below: korean-layout.section-gap, breakable: true)[
    #box([[앞부분 줄거리]]) #as-blocks(body)#parbreak()
  ]
}

#let _range-cap(is-left, inset, stroke, sticky: false) = block(width: 100%, height: if sticky { 0.01pt } else { 0pt },
  above: 0pt, below: 0pt, sticky: sticky, {
  place(top + left,
    dx: if is-left { -inset } else { 100% + inset - korean-layout.range-cap },
    line(length: korean-layout.range-cap, stroke: stroke))
})

// Short ranges stay intact and center their label. Long ranges may span many
// columns: only the first/last fragment has a horizontal cap, and the label
// stays at the beginning so it cannot float beyond the first fragment.
#let marked-range(label, body, side: left, label-align: auto, keep: auto, font-config: fonts) = context {
  let is-left = side == left or side == "left"
  assert(is-left or side == right or side == "right",
    message: "kice-general: 범위 표지는 left 또는 right입니다")
  assert((auto, true, false).contains(keep), message: "kice-general: keep는 auto, true, false입니다")
  assert((auto, top, center, "top", "center").contains(label-align),
    message: "kice-general: label-align은 auto, top, center입니다")
  set text(font: font("body", config: font-config))
  let inset = korean-layout.range-inset
  let stroke = _unit(korean-layout.stroke)
  let lane = korean-layout.range-lane
  let geometry = print-flow-geometry.get()
  let keep-height = korean-layout.range-keep-height.to-absolute()
  let limit = if geometry == none { keep-height }
    else { calc.min(keep-height, geometry.height * korean-layout.range-keep-fraction) }
  let range-body = as-blocks(body)
  pad(left: if is-left { lane } else { 0pt }, right: if is-left { 0pt } else { lane },
    layout(available => {
      let inner-width = available.width - inset
      let height = measure(block(width: inner-width, above: 0pt, below: 0pt, range-body)).height
      let together = if keep == auto { height <= limit } else { keep }
      let marker = box(text(font: font("label", config: font-config), [[#as-content(label)]]))
      let marker-size = measure(marker)
      let centered = together and label-align != top and label-align != "top"
      let label-y = if centered { calc.max(0pt, (height - marker-size.height) / 2) } else { 0pt }
      block(width: 100%, above: 0pt, below: 0pt, breakable: not together,
        stroke: if is-left { (left: stroke) } else { (right: stroke) },
        inset: (left: if is-left { inset } else { 0pt }, right: if is-left { 0pt } else { inset }, top: 0pt, bottom: 0pt))[
        #_range-cap(is-left, inset, stroke, sticky: true)
        #place(top + left,
          dx: if is-left { -inset - marker-size.width - korean-layout.range-label-gap }
            else { 100% + inset + korean-layout.range-label-gap },
          dy: label-y, marker)
        #range-body
        #parbreak()
        #_range-cap(is-left, inset, stroke)
      ]
    }))
}
