#import "fonts.typ": sans, serif

// 매 단(페이지 첫 단, 다음 단, 다음 장) 상단에 두는 여백.
#let column-top-inset = 1em

#let _margin-side(margin, side, axis) = {
  if type(margin) == dictionary {
    margin.at(side, default: margin.at(axis, default: 0pt))
  } else if margin == auto {
    0pt
  } else {
    margin
  }
}

// 2단 이상일 때 gutter 가운데에 세로선을 그린다. 높이는 본문 단(여백 안)과 같다.
#let column-rule(gutter: 6.5mm, stroke: 0.8pt) = context {
  let cols = page.columns
  if cols < 2 {
    none
  } else {
    let margin = page.margin
    let margin-left = _margin-side(margin, "left", "x")
    let margin-right = _margin-side(margin, "right", "x")
    let margin-top = _margin-side(margin, "top", "y")
    let margin-bottom = _margin-side(margin, "bottom", "y")
    let col-w = (page.width - margin-left - margin-right - gutter * (cols - 1)) / cols
    // 본문 상단 여백(column-top-inset)까지 포함해 헤더 밑줄부터 그린다.
    let pad = measure(block(height: column-top-inset)).height
    let height = page.height - margin-top - margin-bottom + pad
    range(cols - 1)
      .map(i => {
        // i번째 gutter의 중앙.
        let x = margin-left + (i + 1) * col-w + i * gutter + gutter / 2
        place(
          top + left,
          dx: x,
          dy: margin-top - pad,
          line(length: height, angle: 90deg, stroke: stroke),
        )
      })
      .join()
  }
}

// 매 페이지 상단. 본문 set text(장평/자간)와 섞이지 않게 따로 둔다.
#let exam-header(title: [국어 영역], right: none) = {
  set text(font: sans, size: 9pt, tracking: 0em, stretch: 100%)
  set par(leading: 0.6em, spacing: 0.4em)
  grid(
    columns: (1fr, auto),
    align: (start + bottom, end + bottom),
    title,
    if right != none { right },
  )
  v(0.28em)
  line(length: 100%, stroke: 0.8pt)
}

// 매 페이지 하단. 대각선 상자: 왼쪽 위=현재 쪽, 오른쪽 아래=전체 쪽.
#let exam-footer() = context {
  set text(font: serif, size: 10pt, weight: "bold", tracking: 0em, stretch: 100%)
  set par(leading: 0.55em, spacing: 0pt)
  let current = counter(page).display()
  let total = counter(page).final().first()
  let slot = measure[00000]
  let pad-x = 0.25em
  let pad-y = 0.125em
  let width = slot.width + pad-x * 2 + 0.75em
  let height = slot.height + pad-y * 2 + 0.75em
  align(center, box(width: width, height: height, stroke: 0.55pt, {
    place(line(start: (0pt, height), end: (width, 0pt), stroke: 0.55pt))
    place(top + left, dx: pad-x, dy: pad-y, box(width: slot.width, current))
    place(bottom + right, dx: -pad-x, dy: -pad-y, box(width: slot.width, align(end)[#total]))
  }))
}

#let exam(
  paper: "a4",
  column-count: 2,
  margin: (x: 13mm, top: 18mm, bottom: 16mm),
  gutter: 5mm,
  size: 9.5pt,
  title: [국어 영역],
  header-right: none,
  header: auto,
  footer: auto,
  body,
) = {
  let header-body = if header == auto {
    exam-header(title: title, right: header-right)
  } else {
    header
  }
  let footer-body = if footer == auto {
    exam-footer()
  } else {
    footer
  }
  // 장평 95%(stretch), 자간 -5%(tracking).
  set text(
    lang: "ko",
    size: size,
    font: serif,
    top-edge: "ascender",
    bottom-edge: "descender",
    tracking: -0.05em,
    stretch: 95%,
    spacing: 0.35em,
  )
  set par(justify: true, leading: 0.7em, spacing: 0.7em)
  // sticky/grid.header는 같은 페이지 단 나눔에 반복되지 않는다.
  // 헤더 아래 inset을 넣고 top margin을 늘리면 모든 단 상단에 같은 여백이 생긴다.
  context {
    let pad = measure(block(height: column-top-inset)).height
    set page(
      paper: paper,
      margin: (
        left: _margin-side(margin, "left", "x"),
        right: _margin-side(margin, "right", "x"),
        top: _margin-side(margin, "top", "y") + pad,
        bottom: _margin-side(margin, "bottom", "y"),
      ),
      columns: column-count,
      header: {
        header-body
        v(pad, weak: false)
      },
      footer: footer-body,
      header-ascent: 0pt,
      footer-descent: 4mm,
      foreground: if column-count >= 2 { column-rule(gutter: gutter) },
    )
    set columns(gutter: gutter)
    body
  }
}
