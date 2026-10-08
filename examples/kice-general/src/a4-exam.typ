#import "fonts.typ": fonts, font, sizes, body-style
#import "theme.typ": print-geometry
#import "typography.typ": typography-state, print-mode, print-flow-geometry, print-typography-profiles

#let print-page-box(current, total, font-config: fonts) = box(
  width: 18mm, height: 7mm, stroke: 0.4pt,
  {
    set text(font: font("number", config: font-config), size: sizes.print-footer,
      tracking: 0em, top-edge: "bounds", bottom-edge: "bounds")
    place(line(start: (0pt, 7mm), end: (18mm, 0pt), stroke: 0.4pt))
    place(top + left, dx: 1.5mm, dy: 0.9mm, str(current))
    place(bottom + right, dx: -1.5mm, dy: -0.8mm, str(total))
  },
)

#let print-candidate-fields(selected: true, font-config: fonts) = {
  set text(font: font("title", config: font-config), size: sizes.print-field,
    tracking: -0.02em)
  let cell(body) = box(width: 100%, height: 9mm, stroke: 0.4pt,
    align(center + horizon, body))
  let name = grid(columns: (13mm, 1fr), cell([성명]), cell([]))
  let digits = box(width: 100%, height: 9mm, stroke: 0.4pt,
    layout(available => {
      for i in range(1, 10) {
        place(top + left, dx: available.width * i / 10,
          line(angle: 90deg, length: 9mm, stroke: (
            thickness: 0.3pt,
            dash: if (5, 6, 8).contains(i) { "solid" } else { "dashed" },
          )))
      }
    }))
  let number = grid(columns: (20mm, 1fr), cell([수험번호]), digits)
  grid(columns: if selected { (1.2fr, 1.6fr, 0.65fr) } else { (1.2fr, 1.6fr) },
    column-gutter: 3mm, name, number,
    ..if selected { (cell([제#h(4mm)선택]),) } else { () })
}

#let print-header(
  year: 2027, session: [6월 모의평가], area: [게임탐구], subject: [마인크래프트],
  period: 4, form: none, selected: true, first: true, current: 1, layout: "elective",
  font-config: fonts,
) = {
  let g = print-geometry
  let width = 210mm - g.left - g.right
  set text(fill: black, tracking: 0em, top-edge: "bounds", bottom-edge: "bounds")
  set par(justify: false, leading: 0pt, spacing: 0pt)
  if first {
    place(top + left, dx: g.left, dy: g.header-top, box(width: width)[
      #align(center, text(font: font("title", config: font-config), size: sizes.print-exam-name)[
        #year;학년도 대학수학능력시험#if session != none and session != "" [ #session] 문제지
      ])
      #v(4mm)
      #grid(columns: (auto, 1fr, auto), column-gutter: 3mm, align: horizon,
        box(width: 22mm, height: 9mm, radius: 3mm, stroke: 0.5pt,
          align(center + horizon, text(font: font("number", config: font-config), size: sizes.print-period)[제#period;교시])),
        align(center, text(font: font("heading", config: font-config), size: sizes.print-area, stroke: 0.65pt)[
          #area 영역#if subject != none [#text(size: sizes.print-subject, stroke: 0.25pt)[(#subject)]]
        ]),
        text(font: font("number", config: font-config), size: sizes.print-corner-page, str(current)),
      )
      #if layout == "elective" {
        v(4mm)
        print-candidate-fields(selected: selected, font-config: font-config)
      }
    ])
    if form != none {
      place(top + right, dx: -g.right, dy: if layout == "elective" { 45mm } else { 34mm },
        text(font: font("badge", config: font-config), size: sizes.print-footer, form))
    }
  } else {
    place(top + left, dx: g.left, dy: g.running-top, box(width: width,
      grid(columns: (auto, 1fr, auto), column-gutter: 3mm, align: horizon,
        if calc.even(current) {
          text(font: font("number", config: font-config), size: sizes.print-corner-page, str(current))
        } else { [] },
        align(center, text(font: font("heading", config: font-config), size: sizes.print-running-area, stroke: 0.35pt)[
          #area 영역#if subject != none [ #text(size: sizes.print-running-subject, stroke: 0.2pt)[(#subject)]]
        ]),
        if calc.odd(current) {
          text(font: font("number", config: font-config), size: sizes.print-corner-page, str(current))
        } else { [] },
      )))
    if form != none {
      place(top + right, dx: -g.right, dy: g.running-form,
        text(font: font("badge", config: font-config), size: sizes.print-footer, form))
    }
  }
  let rule-y = if first {
    if layout == "standard" { g.standard-first-rule } else { g.first-rule }
  } else { g.running-rule }
  place(top + left, dx: g.left, dy: rule-y,
    line(length: width, stroke: g.header-rule))
}

// Reflow at physical reading sizes; retain the exam's two columns and complete
// question blocks. Automatic pagination supplies all visible page totals.
#let a4-exam(
  year: 2027, session: [6월 모의평가], area: [게임탐구], subject: [마인크래프트],
  period: 4, form: none, selected: true, first-page: true, layout: "elective",
  total-pages: auto, page-offset: 0, booklet-offset: 0, booklet-pages: none,
  notice: none, font-config: fonts, typography: "science", body,
) = {
  let g = print-geometry
  let type-config = print-typography-profiles.at(typography)
  let first-top = if layout == "standard" { g.standard-body-top } else { g.first-body-top }
  set page(paper: "a4", fill: white,
    margin: (left: g.left, right: g.right, top: g.body-top, bottom: g.bottom),
    foreground: context {
      let p = counter(page).get().first()
      let current = p + page-offset
      let first = first-page and p == 1
      let total = if booklet-pages != none { booklet-pages }
        else if total-pages == auto { counter(page).final().first() + page-offset }
        else { total-pages }
      print-header(year: year, session: session, area: area, subject: subject,
        period: period, form: form, selected: selected, first: first,
        current: current, layout: layout, font-config: font-config)
      let rule-y = if first {
        if layout == "standard" { g.standard-first-rule } else { g.first-rule }
      } else { g.running-rule }
      place(top + center, dy: rule-y, line(angle: 90deg,
        length: 297mm - g.bottom - rule-y, stroke: g.column-rule))
      place(top + center, dy: g.footer-top,
        print-page-box(current + booklet-offset, total, font-config: font-config))
      if notice != none {
        place(top + left, dx: g.left, dy: g.notice-top,
          box(width: 210mm - g.left - g.right,
            align(center, text(font: font("notice", config: font-config), size: sizes.print-notice,
              fill: luma(30%), tracking: 0em, top-edge: "bounds", bottom-edge: "bounds", notice))))
      }
    },
  )
  typography-state.update(typography)
  print-mode.update(true)
  print-flow-geometry.update((
    width: (210mm - g.left - g.right - g.gutter) / 2,
    first-height: 297mm - g.bottom - if first-page { first-top } else { g.body-top },
    height: 297mm - g.bottom - g.body-top,
  ))
  body-style(size: type-config.body-size, font-config: font-config,
    tracking: type-config.tracking, leading: type-config.body-leading, {
    set par(linebreaks: "optimized")
    if first-page { block(height: first-top - g.body-top, above: 0pt, below: 0pt)[] }
    columns(2, gutter: g.gutter, body)
  })
}
