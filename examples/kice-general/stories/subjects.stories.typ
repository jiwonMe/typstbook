#import "@preview/typstbook:0.1.0": story
#import "/src/lib.typ": exam, question, choices, material, view, passage, statements, response-section, font, display

#story(
  title: "과목별 자료와 보기",
  description: "수학·국어·과학탐구 PDF에서 측정한 자료 크기, 보기 행간, 번호 장평, 긴 선지의 들여쓰기를 비교한다.",
  args: (typography: "science", paper: "suneung"),
  arg-types: (
    typography: (control: "select", options: ("science", "math", "korean")),
    paper: (control: "select", options: ("suneung", "a4")),
  ),
  render: (args) => exam(typography: args.typography, paper: args.paper)[
    #question(19, [다음 작물의 상태 변화에 대한 설명으로 옳은 것은?], points: 2, body: [
      #material[
        성숙 전의 밀은 생장 판정이 성공할 때 한 단계 자란다. 단계 7에 이르면 성숙하여 같은 상태를 유지한다.

        후보 위치가 세 번 선택되고, 각 생장 판정의 성공 확률이 $display(1/3)$이라고 하자. 관측 전의 단계는 5이다.
      ]
      #view[
        #statements(
          [성숙 상태는 흡수 상태이므로, 성숙한 뒤 후보 위치가 선택되어도 단계가 바뀌지 않는다.],
          [열벡터로 기록한 상태 확률은 $display(v_3=T(1/3)^3 mat(1;0;0))$로 나타낼 수 있다.],
        )
      ]
      #choices(
        [성숙한 뒤에도 성공 횟수와 관계없이 매번 생장 단계가 증가한다.],
        [성숙 상태에 도달한 뒤에는 그 상태를 유지한다.],
        [첫 번째 성공에서 곧바로 단계 7에 도달한다.],
        [후보 선택 횟수는 언제나 실제 생장 판정 횟수와 같다.],
        [전이행렬은 성숙 전 상태만 기록할 수 있다.],
      )
    ])
  ],
)

#story(
  title: "국어형 지문과 보기",
  description: "국어의 단 전체 폭 지문, 18.38pt 본문 행간과 문단 첫 줄, 긴 선지의 후속 줄을 확인한다.",
  args: (paper: "suneung"),
  arg-types: (paper: (control: "select", options: ("suneung", "a4"))),
  render: (args) => exam(paper: args.paper, typography: "korean", layout: "standard",
    area: "마인크래프트", subject: none, period: 1, tab-label: none)[
    #text(font: font("directive"), "[1~2] 다음 글을 읽고 물음에 답하시오.")
    #v(0.8em)
    #passage[
      작물의 생장 속도를 비교할 때에는 한 포기가 자랄 확률과 밭 전체에서 수확할 작물의 수를 구별해야 한다. 밀을 당근과 행마다 번갈아 심으면 같은 작물의 이웃 배치가 달라진다. 이때 한 포기의 생장 확률은 높아질 수 있지만, 같은 넓이에서 심은 밀의 수는 줄어든다.

      두 번의 독립적인 생장 판정 중 적어도 한 번 성공할 확률은 한 번의 성공 확률만 두 배 한 값과 같지 않다. 두 번 모두 성공하는 경우가 중복되기 때문이다. 판정의 성공 확률을 정하고, 성숙 전 단계와 관찰할 밀의 수를 함께 기록해야 총 수확량을 비교할 수 있다.
    ]
    #v(1.1em)
    #question(1, [윗글의 내용과 일치하는 것은?], body: [
      #choices(
        [한 포기의 생장 확률이 높으면 같은 넓이의 모든 밭에서 밀의 총 수확량도 반드시 많다.],
        [행 교대 배치는 같은 넓이에 심은 밀의 수와 각 밀의 생장 확률을 함께 바꿀 수 있다.],
        [두 번 모두 성공하는 경우는 적어도 한 번 성공하는 경우에서 제외한다.],
        [한 번의 성공 확률을 두 배 하면 두 번 중 적어도 한 번 성공할 확률이 된다.],
        [성숙 전 단계는 관찰할 작물의 수만 정하면 생략할 수 있다.],
      )
    ])
    #colbreak()
    #question(2, [윗글을 바탕으로 #text("<보기>")를 이해한 내용으로 적절한 것은?], points: 3, body: [
      #view[
        같은 넓이의 밭 A에는 밀 64포기, 밭 B에는 밀 32포기를 심었다. 모두 성숙 직전이며 각 위치가 두 번씩 무작위 틱 후보로 선택된다. 각 판정의 성공 확률은 A에서 $display(1/6)$, B에서 $display(1/3)$이다.

        생장 판정은 성숙 전에서만 실행하고, 성공하면 성숙 상태를 유지한다.
      ]
      #choices([A가 많다.], [B가 많다.], [같다.], [어느 쪽도 성숙하지 않는다.], [확률로는 비교할 수 없다.])
    ])
  ],
)

#story(
  title: "수학형 응답 구분",
  description: "수학의 15pt 응답 유형 상자, 95% 문항 번호, 2점 배점 표시와 키 큰 수식을 함께 확인한다.",
  args: (label: "5지선다형", paper: "suneung"),
  arg-types: (
    label: (control: "select", options: ("5지선다형", "단답형")),
    paper: (control: "select", options: ("suneung", "a4")),
  ),
  render: (args) => exam(paper: args.paper, typography: "math", layout: "standard",
    area: "마인크래프트", subject: none, period: 2, tab-label: none)[
    #response-section(label: args.label)
    #question(1, [$display(1/(1+1/3))$의 값은?], points: 2, body: [
      #if args.label == "5지선다형" {
        choices([$display(1/4)$], [$display(1/3)$], [$display(1/2)$], [$display(2/3)$], [$display(3/4)$], columns: 5)
      }
    ])
    #colbreak()
    #question(3, [함수 $f(t)$를 다음과 같이 정의한다.], points: 3, body: [
      #material[
        $ f(t)=cases(display(1/(1+t^2)) & (t<0), sqrt(1+t) & (t>=0)) $
        $f(0)$의 값과 $display(lim_(t arrow 0^-) f(t))$의 값을 비교하자.
      ]
      #view[
        #statements([두 값은 모두 1이다.], [함수는 $t=0$에서 연속이다.])
      ]
      #choices([ㄱ], [ㄴ], [ㄱ, ㄴ], [모두 거짓], [조건 부족], columns: 2)
    ])
  ],
)
