// Geometry in physical units; values are calibrated against the reference PDFs.
// suneung matches the original KICE PDF MediaBox, not a physical trim size.
#import "fonts.typ": sizes
#let paper-presets = (
  suneung: (width: 842pt, height: 1191pt, scale: 1),
  a4: (width: 210mm, height: 297mm, scale: 210mm / 842pt),
)
#let geometry = (
  left: 87.9pt, right: 87.8pt,
  first-rule: 246.601pt, running-rule: 147.421pt,
  standard-first-rule: 218.341pt,
  first-column-top: 11.6pt, column-top: 13.04pt, bottom: 123.779pt,
  gutter: 31.02pt, header-rule: 1.14pt, column-rule: 0.9pt,
  body-size: sizes.body,
)
