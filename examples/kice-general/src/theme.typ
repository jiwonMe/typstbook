// Geometry in physical units; values are calibrated against the reference PDFs.
// suneung matches the original KICE PDF MediaBox, not a physical trim size.
#import "fonts.typ": sizes
#let paper-presets = (
  suneung: (width: 842pt, height: 1191pt, scale: 1),
  a4: (width: 210mm, height: 297mm, scale: 1),
  a4-scaled: (width: 210mm, height: 297mm, scale: 210mm / 842pt),
)

// Reading geometry for an A4 sheet at 100% printing, independent of KICE's
// larger PDF coordinates. Font families and physical sizes stay in fonts.typ.
#let print-geometry = (
  left: 15mm, right: 15mm, gutter: 7mm, bottom: 26mm,
  header-top: 12mm, running-top: 14mm, running-form: 21mm,
  first-rule: 49mm, standard-first-rule: 38mm, running-rule: 25mm,
  first-body-top: 54mm, standard-body-top: 43mm, body-top: 31mm,
  footer-top: 276.5mm, notice-top: 287mm,
  header-rule: 0.7pt, column-rule: 0.5pt,
)
#let geometry = (
  left: 87.9pt, right: 87.8pt,
  first-rule: 246.601pt, running-rule: 147.421pt,
  standard-first-rule: 218.341pt,
  first-column-top: 11.6pt, column-top: 13.04pt, bottom: 123.779pt,
  gutter: 31.02pt, header-rule: 1.14pt, column-rule: 0.9pt,
  body-size: sizes.body,
)

// Original Korean reference coordinates are independent of the native A4
// reading geometry. Optical transforms match the selected 2026 June p1 ink
// bounds with the centrally configured fonts; they do not copy PDF pixels.
#let korean-reference-geometry = (
  column-x: 420.96pt, column-rule: 1.14pt, column-bottom: 1067.281pt,
  area-dx: 1.68pt, area-top: 156.36pt, area-x: 95.8839%, area-y: 103.35%,
  area-gap: 14pt, area-word-tracking: -0.05em,
  capsule-x: 88.44pt, capsule-top: 158.461pt,
  capsule-width: 90.66pt, capsule-height: 31.2pt,
  period-dx: -0.713pt, period-dy: 0.444pt,
  corner-top: 111.26pt, corner-y: 101%,
  page-height: 22.02pt, page-current-x: 4.20pt,
  page-total-x: -4.18445pt,
  notice-right: 75.4pt, notice-top: 1105.59pt,
  notice-x: 101.5274%, notice-y: 94.4444%, notice-fill: rgb("0000ff"),
)
