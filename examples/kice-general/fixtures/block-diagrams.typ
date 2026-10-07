// Geometry fixtures for component stories, independent of game mechanics.
#let block-map() = align(center, table(
  columns: (13mm,) * 5,
  rows: (10mm,) * 4,
  inset: 0pt,
  align: center + horizon,
  stroke: 0.4pt,
  [], [], [], [], [B],
  [], [], [], [], [],
  [], [], table.cell(fill: luma(75%))[], [], [],
  [A], [], table.cell(fill: luma(75%))[], [], [],
))

#let crafting-grid() = align(center, table(
  columns: (17mm,) * 3,
  rows: (11mm,) * 3,
  inset: 1pt,
  align: center + horizon,
  stroke: 0.4pt,
  [철], [철], [],
  [철], [막대], [],
  [], [막대], [],
))

#let torch-grid() = align(center, table(
  columns: (14mm,) * 3,
  rows: (11mm,) * 3,
  inset: 0pt,
  align: center + horizon,
  stroke: 0.4pt,
  [], [], [],
  [], [횃불], [],
  [], [], [],
))
