#import "../src/lib.typ": answer-sheet
#import "minecraft.typ": minecraft-questions, minecraft-points

#let minecraft-answer-items = minecraft-questions.enumerate().map(pair => {
  let (index, item) = pair
  (number: index + 1, answer: item.answer,
    points: minecraft-points.at(index), explanation: item.explanation)
})

// The direct PDF and native story share the reusable answer-sheet template
// and the same examination records; there is no answer transcription.
#let minecraft-answers(columns: 2) = answer-sheet(
  title: [마인크래프트 — 정답과 해설],
  subtitle: [Java Edition 1.21.1 · #(minecraft-questions.len())문항 · #(minecraft-points.sum())점],
  running-title: [마인크래프트 · 정답과 해설],
  items: minecraft-answer-items, columns: columns,
)
