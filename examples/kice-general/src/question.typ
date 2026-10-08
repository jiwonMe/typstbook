#import "fonts.typ": fonts, font, sizes
#import "inline.typ": as-content, print-prose
#import "typography.typ": typography-profiles, typography-state, typography-config, print-mode, print-flow-geometry
#import "question-flow.typ": balanced-question-flow

#import "math.typ": choice-row-strut

#let choice-marks = ("①", "②", "③", "④", "⑤")
// The number shares the prompt baseline; wrapped lines begin after the number.
// A complete question is kept together in the exam's two-column flow.
#let question(number, prompt, points: none, show-points: auto, body: none, font-config: fonts) = context {
  let style = typography-config()
  let reference-korean = typography-state.get() == "korean" and not print-mode.get()
  // First-line text clears the number; continuation lines use a smaller indent.
  // These widths are laid out before the paragraph's 95% horizontal scale.
  let prompt-indent = (if type(number) == int and number < 10 {
    if reference-korean { style.prompt-indent } else { 18.84pt }
  } else { if reference-korean { style.prompt-indent-wide } else { 25.8pt } }) / style.body-size / 0.95 * 1em
  let show-score = if show-points == auto { points != none and (style.all-points or points != 2) } else { show-points and points != none }
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt, justify: false)
  block(breakable: false, width: 100%, above: 0pt, below: 0pt)[
    #text(font: font("prompt", config: font-config))[
      #par(hanging-indent: 11.28pt / style.body-size / 0.95 * 1em)[
        #box(width: prompt-indent, box(move(dy: if reference-korean { style.number-baseline-offset / style.body-size * 1em } else { 0pt }, scale(x: style.number-scale / 95% * 100%, y: 100%, reflow: true, text(
          font: font("number", config: font-config),
          weight: 400,
          size: (if print-mode.get() { sizes.print-question-number } else { sizes.question-number }) / style.body-size * 1em,
          stretch: 100%,
          tracking: -0.05em,
          str(number) + ".",
        )))))#if print-mode.get() { print-prose(as-content(prompt)) } else if reference-korean {
          text(size: style.prompt-size / style.body-size * 1em, as-content(prompt))
        } else { as-content(prompt) }#if show-score {
          if print-mode.get() { [~#box(text("[" + str(points) + "점]"))] }
          else { [ #box(text("[" + str(points) + "점]"))] }
        }
      ]
    ]
    #if body != none { body }
  ]
}

// Each option owns a number column, so long options retain a hanging indent in
// every supported layout. Options fill rows in reading order.
#let choices(columns: 1, font-config: fonts, ..items) = context {
  let style = typography-config()
  let compact = print-mode.get() and columns == 5
  let marker-width = if compact { style.compact-choice-marker } else { 15.776pt }
  let continuation = if compact { marker-width } else { style.choice-continuation }
  let column-gap = if compact { style.compact-choice-gutter } else { 0.7em }
  let values = items.pos()
  assert(values.len() == 5, message: "kice-general: 선지는 정확히 5개여야 합니다")
  assert((1, 2, 3, 5).contains(columns), message: "kice-general: 선지 열 수는 1, 2, 3, 5 중 하나여야 합니다")
  set text(font: font("body", config: font-config))
  set par(first-line-indent: 0pt, justify: false, leading: style.choice-leading, spacing: style.choice-leading)
  let options = values.enumerate().map(((index, item)) => {
    // Keep the marker and first math line in one paragraph so their baselines
    // agree even for tall fractions. The outer pad indents every later line or
    // paragraph; the first-line outdent compensates the 95% paragraph scale.
    let row-start = calc.floor(index / columns) * columns
    let strut = if print-mode.get() { choice-row-strut(values.slice(row-start, calc.min(row-start + columns, values.len()))) } else { [] }
    pad(left: continuation / style.body-size * 1em, {
      set par(hanging-indent: 0pt)
      [#strut#h(-continuation / style.body-size / 0.95 * 1em)#box(width: marker-width / style.body-size / 0.95 * 1em,
        text(font: font("label", config: font-config), choice-marks.at(index)))#as-content(item)#parbreak()]
    })
  })
  v(0.6em)
  pad(left: 11.28pt / style.body-size * 1em, grid(
    columns: (1fr,) * columns,
    column-gutter: column-gap,
    row-gutter: style.choice-leading,
    align: top,
    ..options,
  ))
}

#let spread-questions(items, gap: 1.8em, balance: false) = context {
  let geometry = print-flow-geometry.get()
  if balance and print-mode.get() and geometry != none {
    balanced-question-flow(items, gap: gap, width: geometry.width,
      first-height: geometry.first-height, height: geometry.height)
  } else if items.len() > 0 {
    items.at(0)
    for item in items.slice(1) {
      v(gap)
      item
    }
  }
}
