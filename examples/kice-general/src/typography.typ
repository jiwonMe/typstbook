// Subject differences measured from the 2026 June KICE source PDFs.
// Family names and reference sizes remain in fonts.typ.
#import "fonts.typ": sizes
#let typography-profiles = (
  science: (
    body-size: sizes.body, material-size: sizes.material,
    tracking: -0.05em, body-leading: 0.5em, material-leading: 0.45em,
    view-leading: 0.45em, choice-leading: 0.45em,
    body-offset: 1.14pt, number-scale: 100%, all-points: false,
    outer-left: 11.28pt, outer-right: 0.18pt, material-x: 7.08pt,
    material-top: 9.098pt, material-bottom: 9.892pt, first-indent: 0pt,
    view-x: 8.52pt, view-top: 13.417pt, view-bottom: 7.933pt,
    choice-continuation: 15.776pt,
    table-role: "table", table-size: sizes.table,
    table-heading-role: "table-heading", table-heading-size: sizes.table,
    table-leading: 0.30em,
  ),
  math: (
    body-size: sizes.math-body, material-size: sizes.math-body,
    tracking: -0.0317em, body-leading: 0.65em, material-leading: 0.65em,
    view-leading: 0.65em, choice-leading: 0.45em,
    body-offset: 0pt, number-scale: 95%, all-points: true,
    outer-left: 12pt, outer-right: 0.9pt, material-x: 10pt,
    material-top: 8.73pt, material-bottom: 7.08pt, first-indent: 0pt,
    view-x: 10pt, view-top: 17.395pt, view-bottom: 7.895pt,
    choice-continuation: 15.776pt,
    table-role: "body", table-size: sizes.math-body,
    table-heading-role: "body", table-heading-size: sizes.math-body,
    table-leading: 0.30em,
  ),
  korean: (
    body-size: sizes.body, material-size: sizes.material,
    prompt-size: sizes.korean-prompt, prompt-indent: 18.18pt,
    prompt-indent-wide: 25.14pt, number-baseline-offset: -0.12pt,
    tracking: -0.0554em, body-leading: 0.59826em, material-leading: 0.59826em,
    view-leading: 0.59826em, choice-leading: 0.59826em,
    body-offset: 0pt, number-scale: 95%, all-points: false,
    outer-left: 11.28pt, outer-right: 0.24pt, material-x: 8.52pt,
    material-top: 10.539pt, material-bottom: 7.661pt,
    first-indent: 10.26pt,
    view-x: 8.52pt, view-top: 12.279pt, view-bottom: 9.10105pt,
    choice-continuation: 10.313025pt,
    table-role: "body", table-size: sizes.korean-table,
    table-heading-role: "table-heading", table-heading-size: sizes.korean-table-heading,
    table-leading: 0.30em,
  ),
)
#let typography-state = state("kice-general.typography", "science")
#let print-mode = state("kice-general.print", false)
#let print-flow-geometry = state("kice-general.print-flow-geometry", none)
#let print-type = (
  body-size: sizes.print-body, material-size: sizes.print-body,
  body-leading: 0.55em, material-leading: 0.5em, view-leading: 0.5em,
  table-size: sizes.print-table, table-heading-size: sizes.print-table,
  compact-choice-marker: 12pt, compact-choice-gutter: 3pt,
  material-x: 7pt, material-top: 7pt, material-bottom: 7pt,
  view-x: 7pt, view-top: 10pt, view-bottom: 7pt,
  material-gap: 0.4em, table-cell-y: 0.25em, statement-indent: 14pt,
)
#let print-typography-profiles = (
  science: typography-profiles.science + print-type,
  math: typography-profiles.math + print-type,
  korean: typography-profiles.korean + print-type,
)

// Called from context-aware components so one manuscript can use either the
// measured reference profile or its readable A4 print counterpart.
#let typography-config() = {
  let name = typography-state.get()
  if print-mode.get() { print-typography-profiles.at(name) }
  else { typography-profiles.at(name) }
}
