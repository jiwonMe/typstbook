#import "fonts.typ": sans, serif
#import "parse.typ": as-blocks, as-content
#import "question.typ": choice-marks

#let as-choice-mark(answer) = {
  if type(answer) == int {
    assert(
      answer >= 1 and answer <= 5,
      message: "kice-korean: answer must be 1–5",
    )
    choice-marks.at(answer - 1)
  } else {
    answer
  }
}

// 세트 맨 위 정답표. 문항 번호와 정답 기호를 한 줄에 둔다.
#let answer-strip(items) = {
  set text(font: sans)
  set par(first-line-indent: 0pt, justify: false)
  block(
    width: 100%,
    stroke: (y: 0.5pt),
    inset: (y: 0.42em),
  )[
    #box(width: 2.4em, text(weight: "bold")[정답])
    #for (i, item) in items.enumerate() {
      if i > 0 { h(1.15em) }
      [#item.number #text(font: serif, weight: "bold")[#as-choice-mark(item.answer)]]
    }
  ]
}

#let key-label(title) = text(font: sans, weight: "bold")[[#title]]

#let key-section(title, body) = {
  set par(first-line-indent: 0pt, justify: true)
  block(width: 100%, above: 0pt, below: 0pt)[
    #key-label(title)
    #v(0.28em)
    #set text(font: serif)
    #set par(
      first-line-indent: (amount: 1em, all: true),
      justify: true,
      leading: 0.68em,
      spacing: 0.68em,
    )
    #body
  ]
}

#let _paragraph-item(item, index) = {
  let label = if type(item) == dictionary {
    item.at("label", default: [#(index + 1)문단])
  } else {
    [#(index + 1)문단]
  }
  let body = if type(item) == dictionary {
    item.at("body", default: item.at("explain", default: []))
  } else {
    item
  }
  block(width: 100%, spacing: 0.55em)[
    #grid(
      columns: (2.85em, 1fr),
      column-gutter: 0.3em,
      text(font: sans, weight: "bold")[#as-content(label)],
      {
        set par(
          first-line-indent: 0pt,
          justify: true,
          leading: 0.68em,
          spacing: 0.68em,
        )
        as-blocks(body)
      },
    )
  ]
}

// 지문 전체 해설. 주제·구조·단락을 나눠 두어 EBS식 해설지와 맞춘다.
#let passage-key(
  heading: [지문 해설],
  label: none,
  topic: none,
  outline: (),
  paragraphs: (),
  body: none,
) = {
  let sections = ()
  if topic != none {
    sections = sections + (key-section([주제], as-blocks(topic)),)
  }
  if outline.len() > 0 {
    sections = sections + (key-section(
      [글의 구조],
      {
        set par(first-line-indent: 0pt, justify: false)
        outline.map(as-content).join([ → ])
      },
    ),)
  }
  if paragraphs.len() > 0 {
    sections = sections + (key-section(
      [내용 해설],
      {
        set par(first-line-indent: 0pt)
        for (i, item) in paragraphs.enumerate() {
          _paragraph-item(item, i)
        }
      },
    ),)
  }
  if body != none {
    sections = sections + ({
      set par(
        first-line-indent: (amount: 1em, all: true),
        justify: true,
        leading: 0.68em,
        spacing: 0.68em,
      )
      as-blocks(body)
    },)
  }

  set text(font: serif)
  set par(first-line-indent: 0pt, justify: true)
  block(breakable: true, width: 100%, above: 0pt, below: 0pt)[
    #set text(font: sans)
    #set par(first-line-indent: 0pt, justify: false)
    #block(below: 0.5em, width: 100%)[
      #text(weight: "bold")[#heading]
      #if label != none {
        h(0.4em)
        as-content(label)
      }
    ]
    #set text(font: serif)
    #if sections.len() > 0 {
      sections.at(0)
      for section in sections.slice(1) {
        v(0.75em)
        section
      }
    }
  ]
}

#let explanation(number, answer, body, wrongs: ()) = {
  set par(first-line-indent: 0pt, justify: true)
  let mark = as-choice-mark(answer)
  block(breakable: true, width: 100%, above: 0pt, below: 0pt)[
    #par(hanging-indent: 1em)[
      #box(width: 1em, text(size: 1.18em, weight: "bold")[#number.])
      #text(font: sans)[[정답]]
      #text(weight: "bold")[#mark]
    ]
    #v(0.45em)
    #set par(
      first-line-indent: (amount: 1em, all: true),
      justify: true,
      leading: 0.68em,
      spacing: 0.68em,
    )
    #as-blocks(body)
    #if wrongs.any(note => note != none and note != "") {
      v(0.55em)
      set par(first-line-indent: 0pt)
      text(font: sans, weight: "bold")[[오답 풀이]]
      v(0.28em)
      for (i, note) in wrongs.enumerate() {
        if note != none and note != "" {
          block(spacing: 0.45em, width: 100%)[
            #grid(
              columns: (1em, 1fr),
              column-gutter: 0.15em,
              choice-marks.at(i),
              as-content(note),
            )
          ]
        }
      }
    }
  ]
}

#let _as-passage-key(value) = {
  if type(value) == dictionary {
    passage-key(
      heading: value.at("heading", default: [지문 해설]),
      label: value.at("label", default: none),
      topic: value.at("topic", default: none),
      outline: value.at("outline", default: ()),
      paragraphs: value.at("paragraphs", default: ()),
      body: value.at("body", default: value.at("explain", default: none)),
    )
  } else {
    passage-key(body: value)
  }
}

#let reading-key(
  from: 1,
  to: none,
  heading: [정답 및 해설],
  passage: none,
  passages: (),
  items: (),
  gap: 1.2em,
) = {
  if passage != none and passages.len() > 0 {
    panic("kice-korean: use passage or passages, not both")
  }
  let passage-items = if passage != none { (passage,) } else { passages }

  set text(font: sans)
  set par(first-line-indent: 0pt, justify: false)
  let range = if to == none or to == from {
    [[#from]]
  } else {
    [[#from～#to]]
  }
  block(below: 0.55em, width: 100%)[
    #range
    #h(0.35em)
    #text(weight: "bold")[#heading]
  ]
  if items.len() > 0 {
    answer-strip(items)
    v(0.85em)
  } else if passage-items.len() > 0 {
    v(0.35em)
  }
  set text(font: serif)
  if passage-items.len() > 0 {
    _as-passage-key(passage-items.at(0))
    for item in passage-items.slice(1) {
      v(gap)
      _as-passage-key(item)
    }
  }
  if items.len() > 0 {
    if passage-items.len() > 0 {
      v(1em)
      set text(font: sans)
      set par(first-line-indent: 0pt, justify: false)
      block(below: 0.55em, width: 100%)[
        #text(weight: "bold")[문항 해설]
      ]
      set text(font: serif)
    }
    explanation(
      items.at(0).number,
      items.at(0).answer,
      items.at(0).at("explain", default: items.at(0).at("body", default: [])),
      wrongs: items.at(0).at("wrongs", default: ()),
    )
    for item in items.slice(1) {
      v(gap)
      explanation(
        item.number,
        item.answer,
        item.at("explain", default: item.at("body", default: [])),
        wrongs: item.at("wrongs", default: ()),
      )
    }
  }
}
