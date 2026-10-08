#import "fonts.typ": fonts, font, sizes
#import "inline.typ": as-content, as-blocks, print-prose
#import "typography.typ": typography-profiles, print-typography-profiles, print-mode
#import "korean-passage.typ": framed-passage, instruction, passage-sections
#import "question.typ": spread-questions

// Korean source panels share the exam's body font; only their captions,
// speaker labels and interface headings use their central font roles.
#let korean-material-layout = (
  speaker-gap: 0.4em,
  draft-heading-gap: 0.55em, plan-gap: 0.25em, plan-min-width: 6.5em,
  panel-inset: 0.55em, panel-heading-inset: 0.3em,
  post-gap: 0.25em, post-rule-gap: 0.4em,
  stroke: 0.36pt,
)

#let dialogue(turns, speaker-width: auto, hanging-indent: auto, speaker-size: auto,
  gap: auto, font-config: fonts) = context {
  let style = if print-mode.get() { print-typography-profiles.korean } else { typography-profiles.korean }
  let unit(value) = value * (text.size / style.body-size)
  let labels = turns.map(turn => text(font: font("korean-speaker", config: font-config),
    size: if speaker-size == auto { unit(if print-mode.get() { sizes.print-korean-speaker } else { sizes.korean-speaker }) } else { speaker-size },
    [#as-content(turn.speaker):]))
  let label-width = if speaker-width == auto {
    labels.map(label => measure(box(label)).width).fold(0pt, calc.max) * 0.95 + korean-material-layout.speaker-gap
  } else { speaker-width }
  let indent = if hanging-indent != auto { hanging-indent }
    else if label-width == none { 1.65em } else { label-width }
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt, hanging-indent: 0pt, justify: true,
    leading: style.material-leading, spacing: 0pt)
  for (index, turn) in turns.enumerate() {
    if index > 0 { v(if gap == auto { style.material-leading } else { gap }) }
    // One paragraph keeps a speaker with the first line while subsequent
    // lines and paragraphs retain their hanging indent across columns.
    pad(left: indent, [#h(-indent / 0.95)#if label-width == none {
      labels.at(index); h(korean-material-layout.speaker-gap)
    } else { box(width: label-width / 0.95, labels.at(index)) }#if print-mode.get() { print-prose(as-blocks(turn.body)) } else { as-blocks(turn.body) }#parbreak()])
  }
}

#let draft(body, title: [학생의 초고], font-config: fonts) = framed-passage(font-config: font-config)[
  #if title != none {
    block(sticky: true, above: 0pt, below: korean-material-layout.draft-heading-gap, {
      set par(first-line-indent: 0pt, justify: false)
      align(center, text(font: font("directive", config: font-config), as-content(title)))
    })
  }
  #as-blocks(body)
]

#let stage-direction(body, font-config: fonts) = {
  set text(font: font("body", config: font-config))
  set par(first-line-indent: (amount: 1em, all: true), justify: true)
  block(above: 0.4em, below: 0.4em, as-blocks(body))
}

#let editor-note(label, body, font-config: fonts) = context {
  let tag = text(font: font("directive", config: font-config), [#as-content(label)])
  let indent = measure(box(tag)).width * 0.95 + 0.5em
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt, hanging-indent: 0pt, justify: true)
  pad(left: indent, [#h(-indent / 0.95)#box(width: indent / 0.95, tag)#as-blocks(body)#parbreak()])
}

// Short planning stages form one horizontal reading sequence. Longer prose
// belongs in a draft or passage, rather than a narrow stage card.
#let writing-plan(stages, direction: "auto", font-config: fonts) = context {
  assert(stages.len() > 0 and stages.len() <= 4,
    message: "kice-general: 글쓰기 개요는 1~4단계로 작성합니다")
  assert(("auto", "row", "column").contains(direction),
    message: "kice-general: 개요 방향은 auto, row, column입니다")
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt, justify: false, spacing: 0.3em)
  layout(available => {
    let required = (stages.len() * korean-material-layout.plan-min-width +
      (stages.len() - 1) * (0.8em + 2 * korean-material-layout.plan-gap))
    let vertical = direction == "column" or (direction == "auto" and available.width < required.to-absolute())
    let cards = stages.map(stage => block(width: 100%, stroke: korean-material-layout.stroke,
      inset: 0.4em, breakable: false, above: 0pt, below: 0pt)[
      #align(center, text(font: font("directive", config: font-config), as-content(stage.title)))
      #v(0.35em)
      #as-blocks(stage.body)
      #parbreak()
    ])
    let tracks = ()
    let cells = ()
    for (index, card) in cards.enumerate() {
      if index > 0 {
        if not vertical { tracks += (0.8em,) }
        cells += (align(center + horizon, if vertical { [↓] } else { [→] }),)
      }
      if not vertical { tracks += (1fr,) }
      cells += (card,)
    }
    block(width: 100%, breakable: false, above: 0pt, below: 0pt,
      grid(columns: if vertical { (1fr,) } else { tracks },
        column-gutter: korean-material-layout.plan-gap,
        row-gutter: korean-material-layout.plan-gap, align: top, ..cells))
  })
}

#let media-window(body, title: [자료 화면], toolbar: none, caption: none, font-config: fonts) = context {
  let style = if print-mode.get() { print-typography-profiles.korean } else { typography-profiles.korean }
  let unit(value) = value * (text.size / style.body-size)
  let panel-size = unit(if print-mode.get() { sizes.print-korean-media } else { sizes.korean-media })
  let stroke = unit(korean-material-layout.stroke)
  set text(font: font("body", config: font-config), size: panel-size)
  set par(first-line-indent: 0pt, justify: false, leading: 0.35em, spacing: 0.35em)
  block(width: 100%, stroke: stroke, breakable: false, above: 0pt, below: 0pt)[
    #block(width: 100%, fill: luma(88%), inset: korean-material-layout.panel-heading-inset,
      above: 0pt, below: 0pt, {
        set text(font: font("directive", config: font-config))
        as-content(title)
        parbreak()
      })
    #if toolbar != none {
      block(width: 100%, fill: luma(96%), inset: korean-material-layout.panel-heading-inset,
        above: 0pt, below: 0pt, {
          set text(font: font("directive", config: font-config))
          as-content(toolbar)
          parbreak()
        })
    }
    #pad(korean-material-layout.panel-inset, as-blocks(body))
  ]
  if caption != none {
    v(0.35em)
    align(center, text(font: font("body", config: font-config),
      size: unit(if print-mode.get() { sizes.print-korean-note } else { sizes.korean-note }), as-content(caption)))
  }
}

#let media-post(author, body, time: none, font-config: fonts) = {
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt, justify: false)
  block(width: 100%, breakable: false, above: 0pt, below: korean-material-layout.post-rule-gap)[
    #text(font: font("directive", config: font-config), as-content(author))
    #if time != none { h(0.6em); as-content(time) }
    #parbreak()
    #v(korean-material-layout.post-gap)
    #as-blocks(body)
    #parbreak()
  ]
}

// A reading set stays in ordinary column flow: the preceding passage may
// leave only part of a column available for the first whole question.
#let reading-set(from: 1, to: none, lead: [다음 글을 읽고 물음에 답하시오.],
  sections: (), questions: (), gap: 1.45em, font-config: fonts) = {
  instruction(from, to: to, body: lead, font-config: font-config)
  if sections.len() > 0 { passage-sections(sections, font-config: font-config) }
  if questions.len() > 0 {
    v(1em)
    spread-questions(questions, gap: gap)
  }
}
