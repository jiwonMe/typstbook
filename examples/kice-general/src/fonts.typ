#import "math.typ": math-height, structure-style
// All font-family names live here. Components use roles, never their own families.
// The KICE profile uses the SM/HY fonts already held by this workspace.
// Register font files with --font-path or TYPST_FONT_PATHS; see ../README.md.
#let font-profiles = (
  kice: (
    body: ("SM JMyungJo Std", "Libertinus Serif"),
    prompt: ("SM JMyungJo Std", "Libertinus Serif"),
    heading: ("신그래픽체", "Libertinus Serif"),
    material: ("SM JMyungJo Std", "Libertinus Serif"),
    table: ("SM JGothic Std", "Libertinus Serif"),
    table-heading: ("SM JGothic Std", "Libertinus Serif"),
    directive: ("SM JGothic Std", "Libertinus Serif"),
    label: ("SM SMyungJo Std", "Libertinus Serif"),
    number: ("SM KMyungJo Std", "Libertinus Serif"),
    title: ("SM Dinaru Std", "Libertinus Serif"),
    badge: ("SM TGothic Std", "Libertinus Serif"),
    notice: ("HYGraPhic M", "Libertinus Serif"),
    math: ("Latin Modern Math", "SM JMyungJo Std"),
  ),
  answers: (
    body: ("Bookk Myungjo", "Libertinus Serif"),
    prompt: ("Bookk Myungjo", "Libertinus Serif"),
    heading: ("Toss Product Sans", "Libertinus Serif"),
    material: ("Bookk Myungjo", "Libertinus Serif"),
    table: ("Toss Product Sans", "Libertinus Serif"),
    table-heading: ("Toss Product Sans", "Libertinus Serif"),
    directive: ("Toss Product Sans", "Libertinus Serif"),
    label: ("Bookk Myungjo", "Libertinus Serif"),
    number: ("Toss Product Sans", "Libertinus Serif"),
    title: ("Toss Product Sans", "Libertinus Serif"),
    badge: ("Toss Product Sans", "Libertinus Serif"),
    notice: ("Toss Product Sans", "Libertinus Serif"),
    math: ("Latin Modern Math", "Bookk Myungjo"),
  ),
  // Set `fonts` to this profile for machines without the SM/HY families.
  // Korean families must be installed; only the Latin/math fallback is built in.
  portable: (
    body: ("Bookk Myungjo", "Libertinus Serif"),
    prompt: ("Bookk Myungjo", "Libertinus Serif"),
    heading: ("Pretendard", "Libertinus Serif"),
    material: ("Bookk Myungjo", "Libertinus Serif"),
    table: ("Pretendard", "Libertinus Serif"),
    table-heading: ("Pretendard", "Libertinus Serif"),
    directive: ("Pretendard", "Libertinus Serif"),
    label: ("Bookk Myungjo", "Libertinus Serif"),
    number: ("Bookk Myungjo", "Libertinus Serif"),
    title: ("Pretendard", "Libertinus Serif"),
    badge: ("Pretendard", "Libertinus Serif"),
    notice: ("Pretendard", "Libertinus Serif"),
    math: ("New Computer Modern Math", "Bookk Myungjo"),
  ),
)

#let fonts = font-profiles.kice
#let answer-fonts = font-profiles.answers
#let answer-weights = (body: 300, title: 700, number: 600, label: 500, meta: 400)
#let font(role, config: fonts) = config.at(role)

// Reference sizes at the original PDF scale. Components express local sizes
// relative to `body`, so the A4 preset scales the complete hierarchy together.
#let sizes = (
  body: 11.5pt, math-body: 11.48pt, material: 11.5pt, question-number: 13pt,
  table: 10pt, korean-table: 11pt, korean-table-heading: 10.5pt,
  response-heading: 15pt,
  exam-name: 21pt, area: 40pt, subject: 30pt,
  period: 22pt, corner-page: 33pt,
  running-area: 27pt, running-subject: 23pt,
  field: 16pt, footer: 12pt, notice: 10pt, final-notice: 11pt, tab: 14pt,
  answer-title: 18pt, answer-section: 11pt, answer-number: 13pt,
  answer-label: 10.5pt, answer-meta: 9.5pt, answer-key: 10.5pt, answer-running: 9pt,
)

// `text(stretch:)` selects a font variant; SM's static font does not provide one.
// Lay each paragraph out at its uncompressed width, then compress only x. The
// resulting paragraph still wraps to the column and keeps its original height.
#let condensed-paragraph(body, ratio: 95%) = layout(available => {
  scale(x: ratio, y: 100%, reflow: true,
    block(width: available.width / (ratio / 100%), body))
})

#let styled-body(body, condense: true) = {
  if condense {
    show par: it => condensed-paragraph(it)
    body
  } else { body }
}

#let body-style(body, size: sizes.body, font-config: fonts, condense: true, math-adjust: true, tracking: -0.05em, leading: 0.5em) = {
  set text(
    font: font("body", config: font-config), size: size,
    lang: "ko", region: "kr", fill: black, hyphenate: false,
    cjk-latin-spacing: none, tracking: tracking, stretch: 100%,
    top-edge: "ascender", bottom-edge: "descender",
  )
  set par(justify: true, leading: leading, spacing: 0.45em, first-line-indent: 0pt)
  show math.equation: set text(font: font("math", config: font-config))
  if math-adjust {
    show: math-height
    show: structure-style
    styled-body(body, condense: condense)
  }
  else { styled-body(body, condense: condense) }
}
