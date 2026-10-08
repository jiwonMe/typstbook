#import "fonts.typ": answer-fonts, answer-weights, font, sizes, body-style
#import "question.typ": choice-marks

// Answer sheets have their own A4 reading geometry; font families and sizes
// stay in fonts.typ. The exam's measured KICE typography remains independent.
#let answer-layout = (
  margin: (x: 16mm, top: 18mm, bottom: 18mm), gutter: 8mm,
  leading: 0.55em, tracking: -0.02em, paragraph-spacing: 0.55em,
  entry-gap: 1.05em, heading-gap: 0.45em,
  equation-gap: 0.4em, inline-math-limit: 6em, quantity-limit: 8em,
  rule: (thickness: 0.35pt, paint: luma(72%)),
  ink-soft: luma(35%), key-fill: luma(96%),
)

#let answer-mark(answer) = {
  if type(answer) == int {
    assert(answer >= 1 and answer <= 5, message: "kice-general: 정답 번호는 1–5입니다")
    choice-marks.at(answer - 1)
  } else { answer }
}

// Keep the number next to its answer, rather than in a separate number row.
#let answer-key(items, columns: 10, font-config: answer-fonts, theme: answer-layout) = {
  assert(type(columns) == int and columns > 0, message: "kice-general: 정답표 열 수는 양의 정수입니다")
  set text(size: sizes.answer-key, tracking: 0em)
  set par(justify: false, leading: 0pt, spacing: 0pt)
  table(
    columns: (1fr,) * columns, align: center + horizon,
    inset: (x: 3pt, y: 6pt), fill: theme.key-fill,
    stroke: (top: none, bottom: theme.rule, left: none, right: none),
    ..items.map(item => [
      #grid(columns: (auto, auto), column-gutter: 0.65em, align: horizon,
        text(font: font("number", config: font-config), size: sizes.answer-meta,
          weight: answer-weights.meta, fill: theme.ink-soft, str(item.number)),
        text(font: font("label", config: font-config), weight: answer-weights.body,
          answer-mark(item.answer)),
      )
    ]),
  )
}

// Bind only the final short Korean word directly before a display equation.
// Other text runs keep their usual Korean line-breaking opportunities.
#let answer-prose(body) = {
  if type(body) != content { body } else {
  let children = body.fields().at("children", default: (body,))
  for (index, child) in children.enumerate() {
    let next = children.slice(index + 1).find(it => it != [ ])
    if child.func() == text and next != none and next.func() == math.equation and next.block {
      {
        show regex("\\b[가-힣]{2,6}$"): box
        child
      }
    } else { child }
  }
  }
}

// Fixed number width aligns one- and two-digit questions. Keep the full
// solution together, with a thin rule and a visible gap between entries.
#let solution-entry(number, answer, body, points: none, font-config: answer-fonts, theme: answer-layout) = {
  block(breakable: false, above: 0pt, below: theme.entry-gap)[
    #set text(font: font("body", config: font-config), size: sizes.answer-body,
      weight: answer-weights.body, tracking: theme.tracking)
    #set par(leading: theme.leading, spacing: theme.paragraph-spacing, first-line-indent: 0pt)
    #show math.equation.where(block: true): set block(above: theme.equation-gap, below: theme.equation-gap)
    #grid(columns: (1fr, auto), align: horizon,
      [
        #box(width: 1.75em, text(font: font("number", config: font-config),
          size: sizes.answer-number, weight: answer-weights.number, tracking: 0em, str(number)))
        #text(font: font("directive", config: font-config), size: sizes.answer-label,
          weight: answer-weights.label, tracking: 0em)[정답]
        #h(0.5em)
        #text(font: font("label", config: font-config), size: sizes.answer-body,
          tracking: 0em, answer-mark(answer))
      ],
      if points == none { [] } else {
        text(font: font("directive", config: font-config), size: sizes.answer-meta,
          weight: answer-weights.meta, tracking: 0em, fill: theme.ink-soft)[#points 점]
      },
    )
    #v(0.22em)
    #line(length: 100%, stroke: theme.rule)
    #v(theme.heading-gap)
    #{
      // Keep short equalities and their fractions on one line. Longer inline
      // expressions retain their normal wrapping.
      show math.equation.where(block: false): it => context {
        if measure(it).width <= theme.inline-math-limit.to-absolute() {
          box(it)
        } else { it }
      }
      // Keep quantities with their units and common Korean particles. Very
      // long quantity lists may still wrap rather than stretching the prose.
      show regex("\\b[0-9]+(?:·[0-9]+)*[ \\t]*(?:게임[ \\t]*틱|개|병|회|틱)(?:씩|가|를|로|에|와|과|도|만|이다|이)?"): it => context {
        if measure(it).width <= theme.quantity-limit.to-absolute() {
          box(it)
        } else { it }
      }
      answer-prose(body)
    }
    #parbreak()
  ]
}

#let answer-sheet(
  title: [정답과 해설], subtitle: none, running-title: auto,
  items: (), columns: 2, key-columns: 10,
  font-config: answer-fonts, theme: answer-layout,
) = {
  assert(items.len() > 0, message: "kice-general: 해설 문항이 필요합니다")
  assert((1, 2).contains(columns), message: "kice-general: 해설은 1단 또는 2단입니다")
  let running-title = if running-title == auto { title } else { running-title }
  set document(title: title)
  set page(
    paper: "a4", margin: theme.margin,
    header: context {
      if counter(page).get().first() > 1 {
        text(font: font("directive", config: font-config), size: sizes.answer-running,
          weight: answer-weights.meta, tracking: 0em, fill: theme.ink-soft, running-title)
      }
    },
    footer: context {
      set par(justify: false, leading: 0pt, spacing: 0pt)
      line(length: 100%, stroke: theme.rule)
      v(3pt)
      grid(columns: (1fr, auto), align: horizon,
        text(font: font("directive", config: font-config), size: sizes.answer-running,
          weight: answer-weights.meta, tracking: 0em, fill: theme.ink-soft, running-title),
        text(font: font("number", config: font-config), size: sizes.answer-running,
          weight: answer-weights.meta, tracking: 0em)[#counter(page).get().first() / #counter(page).final().first()],
      )
    },
  )
  show: body-style.with(size: sizes.answer-body, font-config: font-config, condense: false,
    math-adjust: true, leading: theme.leading, tracking: theme.tracking)
  set par(spacing: theme.paragraph-spacing)
  set text(weight: answer-weights.body)
  show math.equation.where(block: true): set block(above: theme.equation-gap, below: theme.equation-gap)

  text(font: font("title", config: font-config), size: sizes.answer-title,
    weight: answer-weights.title, tracking: 0em, title)
  if subtitle != none {
    v(0.25em)
    text(font: font("directive", config: font-config), size: sizes.answer-meta,
      weight: answer-weights.meta, tracking: 0em, fill: theme.ink-soft, subtitle)
  }
  v(0.9em)
  text(font: font("directive", config: font-config), size: sizes.answer-section,
    weight: answer-weights.label, tracking: 0em)[정답표]
  v(0.35em)
  answer-key(items, columns: key-columns, font-config: font-config, theme: theme)
  v(1.1em)
  text(font: font("directive", config: font-config), size: sizes.answer-section,
    weight: answer-weights.label, tracking: 0em)[문항별 해설]
  v(0.65em)
  std.columns(columns, gutter: theme.gutter)[
    #for item in items {
      solution-entry(item.number, item.answer, item.explanation,
        points: item.at("points", default: none), font-config: font-config, theme: theme)
    }
  ]
}
