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
    tracking: -0.0554em, body-leading: 0.59826em, material-leading: 0.59826em,
    view-leading: 0.59826em, choice-leading: 0.59826em,
    body-offset: 0pt, number-scale: 95%, all-points: false,
    outer-left: 11.28pt, outer-right: 0.18pt, material-x: 8.52pt,
    material-top: 10.539pt, material-bottom: 7.661pt,
    first-indent: 10.26pt,
    view-x: 8.52pt, view-top: 12.279pt, view-bottom: 9.071pt,
    choice-continuation: 10.32pt,
    table-role: "body", table-size: sizes.korean-table,
    table-heading-role: "table-heading", table-heading-size: sizes.korean-table-heading,
    table-leading: 0.30em,
  ),
)
#let typography-state = state("kice-general.typography", "science")
