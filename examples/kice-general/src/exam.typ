#import "fonts.typ": fonts, font, body-style
#import "theme.typ": geometry, sizes, paper-presets
#import "typography.typ": typography-profiles, typography-state

#let page-box(current, total, scale: 1, font-config: fonts) = box(
  width: 50.52pt * scale, height: 21.96pt * scale, stroke: 0.36pt * scale,
  {
    set text(font: font("number", config: font-config), size: sizes.footer * scale)
    set text(top-edge: "bounds", bottom-edge: "bounds")
    let digits(value) = box(std.scale(x: 95%, y: 100%, reflow: true, box(str(value))))
    place(line(start: (0pt, 21.96pt * scale), end: (50.52pt * scale, 0pt), stroke: 0.36pt * scale))
    place(top + left, dx: 4.26pt * scale, dy: 2.58pt * scale, digits(current))
    place(top + right, dx: -4.248pt * scale, dy: 9.78pt * scale,
      text(tracking: -0.0379em, digits(total)))
  },
)

#let candidate-fields(selected: true, scale: 1, font-config: fonts) = {
  set text(font: font("title", config: font-config), size: sizes.field * scale, tracking: -0.05em)
  set par(justify: false, leading: 0pt, spacing: 0pt)
  let cell(body) = box(width: 100%, height: 26.52pt * scale,
    stroke: 0.36pt * scale, align(center + horizon,
      std.scale(x: 90%, y: 100%, reflow: true, box(body))))
  let name = grid(columns: (38.28pt * scale, 147.42pt * scale),
    cell([#box(move(dx: 0.48pt * scale, dy: -0.48pt * scale, [성명]))]), cell([]))
  let digits = box(width: 186pt * scale, height: 26.52pt * scale, stroke: 0.36pt * scale, {
    for i in range(1, 10) {
      place(top + left, dx: i * 18.6pt * scale,
        line(angle: 90deg, length: 26.52pt * scale,
          stroke: (thickness: 0.36pt * scale, dash: if (5, 6, 8).contains(i) { "solid" }
            else { (array: (2.46pt * scale, 1.38pt * scale)) })))
    }
    place(top + left, dx: 5 * 18.6pt * scale,
      place(top + left, dx: 3.24pt * scale, dy: 13.68pt * scale,
        line(length: 12.12pt * scale, stroke: 0.54pt * scale)))
  })
  let number = grid(columns: (72.24pt * scale, 186pt * scale),
    cell([#box(move(dx: -1.08pt * scale, dy: -0.12pt * scale, text(tracking: 0.025em)[수험번호]))]), digits)
  let fields = grid(
    columns: if selected {
      (185.7pt * scale, 15.66pt * scale, 258.24pt * scale, 15.48pt * scale, 93.48pt * scale)
    } else { (185.7pt * scale, 15.66pt * scale, 258.24pt * scale) },
    column-gutter: 0pt,
    name, [], number, ..if selected { ([], cell(text(tracking: -0.025em)[제 [#h(10pt * scale)] 선택])) } else { () },
  )
  if selected { pad(left: 48.78pt * scale, fields) } else { align(center, fields) }
}

// Draw the header against sheet coordinates; the first-page spacer in exam()
// reserves its extra height without changing the continuing pages' top margin.
#let exam-header(
  year: 2027, session: [6월 모의평가], area: [게임탐구], subject: [마인크래프트],
  period: 4, form: none, selected: true, first: true, current: 1, layout: "elective",
  scale: 1, width: 666.3pt, font-config: fonts,
) = {
  set text(tracking: 0em, stretch: 100%, fill: black, top-edge: "bounds", bottom-edge: "bounds")
  set par(justify: false, leading: 0pt, spacing: 0pt)
  let role(name, size, body) = text(font: font(name, config: font-config), size: size * scale, body)
  let narrow(body, ratio: 90%, y-ratio: 100%) = box(std.scale(x: ratio, y: y-ratio, reflow: true, box(body)))
  if first {
    place(top + left, dx: geometry.left * scale, dy: 116.64pt * scale,
      box(width: width, align(center, narrow(text(tracking: -0.0018em, spacing: 125.75%,
        role("title", sizes.exam-name,
          [#text(tracking: -0.0348em, str(year))학년도 대학수학능력시험#if session != none and session != "" [ #session] 문제지])), ratio: 85%))))
    place(top + left, dx: (geometry.left - 0.12pt) * scale, dy: 153.24pt * scale,
      box(width: width, align(center, narrow(role("heading", sizes.area,
        [#text(stroke: 1.186pt * scale, tracking: 0.05em)[#area#h(10pt * scale)영역]#if subject != none [#box(std.scale(x: 84.6667% / 90% * 100%, y: 100%, reflow: true,
          box(text(size: sizes.subject * scale, stroke: 0.559pt * scale)[(#subject)])))]]), ratio: 90.62%, y-ratio: 103.35%))))
    place(top + left, dx: geometry.left * scale, dy: 157.321pt * scale,
      box(width: 90.72pt * scale, height: 31.14pt * scale,
        radius: 18pt * scale, stroke: 0.54pt * scale,
        align(center + horizon, move(dx: -0.683pt * scale, dy: -1.266pt * scale,
          box(std.scale(x: 72.9112%, y: 97.151%, reflow: true, box(text(tracking: 0.1864em,
            role("number", sizes.period, [제#period;교시])))))))))
    place(top + right, dx: -geometry.right * scale, dy: 111.5pt * scale,
      narrow(role("number", sizes.corner-page, [#current])))
    if layout == "elective" {
      place(top + left, dx: geometry.left * scale, dy: 210.661pt * scale,
        box(width: width, candidate-fields(selected: selected, scale: scale, font-config: font-config)))
    }
    if form != none {
      place(top + right, dx: -geometry.right * scale, dy: 188pt * scale,
        box(stroke: 0.6pt * scale, inset: (x: 2mm * scale, y: 0.7mm * scale),
          role("badge", 11pt, form)))
    }
  } else {
    let number = narrow(role("number", sizes.corner-page, [#current]))
    let subject-label = if subject != none { box(move(dy: -0.96pt * scale,
      narrow(text(stroke: 0.36pt * scale, role("heading", sizes.running-subject, [(#subject)])),
        ratio: 89.82%, y-ratio: 103.26%))) } else { [] }
    let outer = [#number#h(8pt * scale)#subject-label]
    let cells = if calc.even(current) { (outer, []) } else { ([], [#subject-label#h(8pt * scale)#number]) }
    place(top + left, dx: geometry.left * scale, dy: 112.7pt * scale,
      box(width: width, grid(
        columns: (1fr, auto, 1fr), align: (left + horizon, center + horizon, right + horizon),
        cells.at(0), box(move(dx: -0.48pt * scale, dy: 0.60pt * scale,
          narrow(text(stroke: 0.54pt * scale, tracking: -0.005em,
            role("heading", sizes.running-area, [#area#h(6.4pt * scale)영역])), y-ratio: 103%))), cells.at(1),
      )))
    if form != none {
      place(top + center, dy: 139pt * scale, role("badge", 8pt, form))
    }
  }
  let rule-y = if first {
    if layout == "standard" { geometry.standard-first-rule } else { geometry.first-rule }
  } else { geometry.running-rule }
  place(top + left, dx: (geometry.left - if first { 0.42pt } else { 0pt }) * scale, dy: rule-y * scale,
    line(length: width + if first { 0.72pt * scale } else { 0pt }, stroke: geometry.header-rule * scale))
}

#let exam-footer(current, total, notice: none, scale: 1, font-config: fonts) = {
  set text(tracking: 0em, stretch: 100%)
  place(top + center, dx: -0.04pt * scale, dy: 1082.101pt * scale, page-box(current, total, scale: scale, font-config: font-config))
  if notice != none {
    place(top + right, dx: -73pt * scale, dy: 1105.35pt * scale,
      text(font: font("notice", config: font-config), size: sizes.notice * scale,
        fill: rgb("1f4ea8"), notice))
  }
}

#let final-notice(body: [답안지의 해당란에 필요한 내용을 정확히 기입(표기)했는지 확인하시오.], font-config: fonts) = {
  v(1em)
  block(width: 100%, stroke: 0.36pt, inset: 8pt, breakable: false)[
    #set text(font: font("material", config: font-config), size: sizes.final-notice / sizes.body * 1em)
    *※ 확인 사항*
    #linebreak()
    #body
  ]
}

#let exam(
  paper: "suneung", year: 2027, session: [6월 모의평가],
  area: [게임탐구], subject: [마인크래프트], period: 4,
  form: none, selected: true, first-page: auto, layout: "elective", tab-label: auto,
  total-pages: auto, page-offset: 0, booklet-offset: 0, booklet-pages: none,
  notice: [이 문제지는 마인크래프트를 소재로 만든 비공식 창작 예시입니다.],
  font-config: fonts, typography: "science", body,
) = {
  assert(typography-profiles.keys().contains(typography), message: "kice-general: typography는 science, math, korean입니다")
  let type-config = typography-profiles.at(typography)
  let paper-config = paper-presets.at(paper)
  assert(("elective", "standard").contains(layout), message: "kice-general: layout은 elective 또는 standard입니다")
  let s = paper-config.scale
  let first-page = if first-page == auto { page-offset == 0 } else { first-page }
  let margin-x = geometry.left * s
  let inner-width = paper-config.width - (geometry.left + geometry.right) * s
  let body-top = (geometry.running-rule + geometry.column-top + type-config.body-offset) * s
  let first-rule = if layout == "standard" { geometry.standard-first-rule } else { geometry.first-rule }
  let tab-label = if tab-label == auto {
    if type(subject) == str { subject }
    else if type(subject) == content { subject.fields().at("text", default: none) }
    else { none }
  } else { tab-label }
  set page(
    width: paper-config.width, height: paper-config.height, fill: white,
    margin: (left: margin-x, right: geometry.right * s, top: body-top, bottom: geometry.bottom * s),
    foreground: context {
      let p = counter(page).get().first()
      let current = p + page-offset
      let first = first-page and p == 1
      let total = if booklet-pages != none { booklet-pages }
        else if total-pages == auto { counter(page).final().first() + page-offset }
        else { total-pages }
      exam-header(year: year, session: session, area: area, subject: subject,
        period: period, form: form, selected: selected, first: first, current: current,
        scale: s, width: inner-width, layout: layout, font-config: font-config)
      let rule-y = (if first { first-rule } else { geometry.running-rule }) * s
      place(top + center, dx: -0.01pt * s, dy: rule-y,
        line(angle: 90deg, length: paper-config.height - geometry.bottom * s - rule-y,
          stroke: geometry.column-rule * s))
      exam-footer(current + booklet-offset, total, notice: notice, scale: s, font-config: font-config)
      if first and layout == "elective" and tab-label != none and tab-label != "" {
        let letters = tab-label.replace(" ", "").clusters()
        let tab-height = calc.max(110.22pt, letters.len() * 17pt + 18pt) * s
        place(top + left, dx: 768.06pt * s, dy: 1098.481pt * s - tab-height,
          block(width: 28.62pt * s, height: tab-height, fill: luma(70%), radius: 3.5pt * s,
            align(center + horizon, text(font: font("badge", config: font-config), size: sizes.tab * s,
              box(move(dy: 1.56pt * s, stack(spacing: 0.82pt * s, ..letters.map(letter => box(letter)))))))))
        place(top + left, dx: 768.06pt * s, dy: 1097.101pt * s - tab-height,
          rect(width: 28.62pt * s, height: 5.88pt * s, fill: luma(89.8%), stroke: none))
      }
    },
  )
  typography-state.update(typography)
  body-style(size: type-config.body-size * s, font-config: font-config,
    tracking: type-config.tracking, leading: type-config.body-leading, {
    if first-page {
      block(height: (first-rule - geometry.running-rule + geometry.first-column-top - geometry.column-top) * s, above: 0pt, below: 0pt)[]
    }
    columns(2, gutter: geometry.gutter * s, body)
  })
}
