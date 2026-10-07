#import "../src/lib.typ": body-style, font, sizes, choice-marks
#import "minecraft.typ": minecraft-questions, minecraft-answer-key, minecraft-points

// The direct PDF and native story use the same A4 answer sheet. Apply math
// height correction here once; the workbench preview supplies neutral styles.
#let minecraft-answers() = {
  set document(title: "마인크래프트 심화 모의평가 — 정답과 해설")
  set page(
    paper: "a4", margin: (x: 18mm, top: 17mm, bottom: 18mm),
    numbering: (number, ..rest) => text(font: font("number"), size: sizes.body, str(number)),
  )
  show: body-style.with(size: sizes.body, condense: false, math-adjust: true, leading: 0.4em)

  align(center)[
    #text(font: font("title"), size: sizes.exam-name)[마인크래프트 — 정답과 해설]
    #v(0.3em)
    Java Edition 1.21.1 · #(minecraft-questions.len())문항 · #(minecraft-points.sum())점
  ]
  v(0.8em)
  table(
    columns: (1fr,) * 10, align: center, inset: 4pt, stroke: 0.35pt,
    ..range(1, 11).map(n => [#n]),
    ..minecraft-answer-key.slice(0, 10).map(a => [#choice-marks.at(a - 1)]),
    ..range(11, 21).map(n => [#n]),
    ..minecraft-answer-key.slice(10, 20).map(a => [#choice-marks.at(a - 1)]),
  )
  v(1em)
  columns(2, gutter: 8mm)[
    #for (index, item) in minecraft-questions.enumerate() {
      block(breakable: false, above: 0.35em, below: 0.4em)[
        #text(font: font("number"), size: sizes.question-number)[#(index + 1)]
        #h(0.6em)
        #text(font: font("label"))[정답 #choice-marks.at(item.answer - 1) · #minecraft-points.at(index)점]
        #v(0.3em)
        #item.explanation
        #parbreak()
      ]
    }
  ]
}
