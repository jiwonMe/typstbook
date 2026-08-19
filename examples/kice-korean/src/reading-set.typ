#import "passage.typ": instruction, paired-passage, passage
#import "question.typ": choices, question, spread-blocks, view

#let reading-set(
  from: 1,
  to: none,
  lead: [다음 글을 읽고 물음에 답하시오.],
  passages: (),
  questions: (),
  gap: 1.45em,
) = {
  instruction(from, to: to, body: lead)
  // 지문 1개=단독, 2개=(가)/(나) 대응. 그 외는 허용하지 않는다.
  if passages.len() == 1 {
    let item = passages.at(0)
    passage(
      label: item.at("label", default: none),
      item.at("body"),
    )
  } else if passages.len() == 2 {
    paired-passage(passages.at(0).at("body"), passages.at(1).at("body"))
  } else if passages.len() > 0 {
    panic("kice-korean: passages must be 1 (single) or 2 (paired)")
  }

  if questions.len() > 0 {
    // 지문과 첫 문항은 1em만. 문항 사이 최소 간격은 spread-blocks의 gap.
    v(1em)
    spread-blocks(
      questions.map(item => {
        let view-data = item.at("view", default: none)
        question(
          item.number,
          points: item.at("points", default: none),
          item.prompt,
          body: {
            if view-data != none {
              view(
                title: view-data.at("title", default: "<보기>"),
                view-data.at("body", default: view-data.at("blocks", default: ())),
              )
            }
            let options = item.at("choices", default: ())
            if options.len() > 0 {
              choices(..options)
            }
          },
        )
      }),
      gap: gap,
    )
  }
}
