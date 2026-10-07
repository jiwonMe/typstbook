// Compile from this package root: typst compile --root . sample.typ sample.pdf
#import "src/lib.typ": exam
#import "fixtures/minecraft.typ": minecraft-paper, minecraft-notice

#let paper = sys.inputs.at("paper", default: "suneung")

#exam(
  paper: paper,
  year: 2027,
  session: [6월 모의평가],
  area: [게임탐구],
  subject: [마인크래프트],
  period: 4,
  selected: true,
  total-pages: if paper == "a4" { auto } else { 4 },
  notice: minecraft-notice,
)[
  #minecraft-paper(flow: if paper == "a4" { "continuous" } else { "paged" })
]
