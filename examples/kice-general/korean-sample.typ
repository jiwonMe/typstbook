// Same original manuscript on the reference sheet and native A4 print sheet.
#import "src/lib.typ": exam
#import "fixtures/korean-components.typ": korean-paper, korean-notice
#let paper = sys.inputs.at("paper", default: "suneung")

#exam(paper: paper, year: 2027, session: [6월 모의평가], typography: "korean",
  layout: "standard", area: [국어], subject: none, period: 1, selected: false,
  tab-label: none, notice: korean-notice)[
  #korean-paper()
]
