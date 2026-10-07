// Layout fixtures, not curriculum-constrained assessment items. Minecraft is
// only the fictional subject. Identities and all variables are stated locally.
#import "../src/lib.typ": question, choices, material, view, data-table, display
#import "../src/typography.typ": print-mode

#let separated(..items) = {
  for (index, item) in items.pos().enumerate() {
    if index > 0 { v(2em) }
    item
  }
}

#let math-inline() = separated(
  question(1, [양수 $x$에 대하여 $display(frac(1, 1 + frac(1, x)))$의 값을 살펴보자.], points: 3, body: [
    #material[
      채굴 속도를 $x$라 하자. 첫 줄에는 보통 크기의 $x + 1$을 놓고, 다음 줄에는 키 큰 분수를 놓는다.

      $display(frac(1, 1 + frac(1, x)) = frac(x, x + 1))$이고, 이 식은 $x > 0$에서 성립한다. 분수 뒤의 문장도 같은 줄의 기준선에 놓인다.

      마지막 줄의 $x = 2$에서는 그 값이 $display(frac(2, 3))$이다. 위아래 줄의 글자와 분수선은 서로 겹치지 않아야 한다.
    ]
    #choices([$display(frac(1, 3))$], [$display(frac(1, 2))$], [$display(frac(2, 3))$], [$1$], [$2$], columns: 5)
  ]),
  question(2, [실수 $x$와 양의 정수 $n$에 대한 근호와 첨자의 모양을 비교하자.], body: [
    #view[
      ㄱ. $display(sqrt(1 + frac(1, 1 + x^2)))$는 모든 실수 $x$에서 정의된다.

      ㄴ. $display(root(3, sqrt(1 + frac(1, n^2))))$는 $n > 0$에서 양수이다.

      ㄷ. $display(a_(i_j)^(frac(1, 2)))$는 양수 $a_(i_j)$의 제곱근을 나타낸다. $i$와 $j$는 첨자의 기호이다.
    ]
    #choices([ㄱ], [ㄴ], [ㄱ, ㄷ], [ㄴ, ㄷ], [ㄱ, ㄴ, ㄷ], columns: 2)
  ]),
  question(3, [한 문장 안에서 키가 서로 다른 수식을 연속해서 읽어 보자.], body: [
    #material[
      양수 $t$에 대해 $t$, $display(frac(1, t))$, $display(frac(1 + frac(1, t), sqrt(1 + t^2)))$, $t^2$를 차례로 기록한다. 줄을 바꾼 뒤에도 본문의 줄 간격이 유지되는지 확인한다.

      실수 $u$에 대해 $display(sqrt(frac(1 + u^2, 1 + frac(1, 1 + u^2))))$는 정의된다. 문장 끝에는 보통 크기의 수식 $u = 0$을 둔다.

      양수 $a$에 대해 $display(integral_0^a frac(x, sqrt(1+x^2)) dif x = sqrt(1+a^2)-1)$이다. 이 문장에서는 적분의 상하한도 줄 안에 놓는다.

      양의 정수 $n$에 대해 $display(sum_(k=1)^n frac(1, k(k+1)) = frac(n, n+1))$이다. $k$는 합의 첨자이다.
    ]
  ]),
)

#let math-display() = separated(
  question(4, [양의 정수 $n$에 대한 합과 곱의 항등식을 살펴보자.], points: 3, body: [
    #material[
      $ sum_(k=1)^n frac(1, k(k+1)) &= sum_(k=1)^n (frac(1, k) - frac(1, k+1)) \
        &= 1 - frac(1, n+1) = frac(n, n+1) $
      $ product_(k=1)^n frac(k+1, k) = n+1 $
      여기서 $k$는 합 또는 곱의 첨자이다. 두 수식의 상한·하한과 분수선이 상자 안에 모두 들어간다.
    ]
  ]),
  question(5, [양수 $a$에 대해 적분 기호와 겹친 분수의 높이를 살펴보자.], body: [
    #material[
      $ integral_0^a frac(x, sqrt(1+x^2)) dif x
        = sqrt(1+a^2) - 1 $
      $ frac(1, 1 + frac(1, 1 + frac(1, a)))
        = frac(1 + a, 1 + 2a) $
      두 번째 식의 좌변과 우변은 $a > 0$에서 같다.
    ]
  ]),
  question(6, [여러 줄로 정렬한 전개식의 왼쪽과 오른쪽 끝을 확인하자.], body: [
    #material[
      실수 $x$와 $y$에 대하여
      $ (x+y)^4 &= x^4 + 4x^3 y + 6x^2 y^2 \
        &quad + 4x y^3 + y^4 \
        (x-y)^4 &= x^4 - 4x^3 y + 6x^2 y^2 \
        &quad - 4x y^3 + y^4 $
      이와 같이 긴 식은 등호를 기준으로 줄을 나누어 기록한다.
    ]
  ]),
)

#let math-material() = separated(
  question(7, [두 좌표를 열벡터로 나타낸 자료와 조건을 살펴보자.], points: 3, body: [
    #material(title: [좌표 변환 자료])[
      실수 $x$와 $y$에 대해 $display(v = mat(x; y))$라 하고,
      $ A = mat(1, display(frac(1, 2)); display(frac(2, 3)), 1), quad
        A v = mat(x + display(frac(y, 2)); display(frac(2x, 3)) + y) $
      로 정한다. 행렬의 각 행에 들어간 분수도 상자 안에 둔다.
    ]
    #view[
      ㄱ. $display(A mat(0; 0) = mat(0; 0))$이다.

      ㄴ. $display(A mat(2; 3) = mat(display(frac(7, 2)); display(frac(13, 3))))$이다.

      ㄷ. $display(det(A) = frac(2, 3))$이다.
    ]
    #choices([ㄱ], [ㄴ], [ㄱ, ㄷ], [ㄴ, ㄷ], [ㄱ, ㄴ, ㄷ], columns: 2)
  ]),
  question(8, [조건에 따라 정의되는 함수와 수식이 들어간 표를 살펴보자.], body: [
    #material[
      실수 $x$에 대해 함수 $f$를 다음과 같이 정한다.
      $ f(x) = cases(
        display(frac(1, 1+x^2)) & "(" x < 0 ")",
        sqrt(1+x) & "(" x >= 0 ")",
      ) $
      #data-table((1fr, 1fr, 1fr), header: ([$x$], [$f(x)$], [적용 조건]), rows: (
        ([$-1$], [$display(frac(1, 2))$], [$x < 0$]),
        ([$0$], [$1$], [$x >= 0$]),
        ([$3$], [$2$], [$x >= 0$]),
      ))
    ]
    #view[
      $display(cases(x + y &= 3, display(frac(x, 2)) - display(frac(y, 3)) &= 1))$의 해는 $display(cases(x = display(frac(12, 5)), y = display(frac(3, 5))))$이다.
    ]
  ]),
)

// Width is a genuine choice of layout. The 1/2-column variants use long
// displayed identities; 3/5-column variants use narrow but equally tall terms.
#let math-choices(columns: 1) = {
  let values = if columns <= 2 {
    (
      [$display(frac(1, 1 + frac(1, x)) = frac(x, x + 1))$],
      [$display(sqrt(frac((x+1)^2, x^2)) = frac(x+1, x))$],
      [$display(frac(1, x) + frac(1, x+1) = frac(2x+1, x(x+1)))$],
      [$display(frac(1, x) - frac(1, x+1) = frac(1, x(x+1)))$],
      [$display(frac(1 + frac(1, x), 1 - frac(1, x)) = frac(x+1, x-1))$],
    )
  } else {
    (
      [$display(frac(1, x))$],
      [$display(frac(1, x^2))$],
      [$display(sqrt(frac(1, x)))$],
      [$display(frac(1, sqrt(x)))$],
      [$display(frac(1, 1 + frac(1, x)))$],
    )
  }
  question(9, [양수 $x > 1$에 대한 다섯 수식의 선지 배열을 살펴보자.], points: 3, body: [
    #choices(..values, columns: columns)
  ])
  v(2em)
  question(10, [다음 선지의 첫 줄과 둘째 줄은 같은 항등식을 나타낸다.], body: [
    #choices(
      [$display(frac(1, x))$ #linebreak() $display(frac(x, x^2))$],
      [$display(frac(2, x))$ #linebreak() $display(frac(2x, x^2))$],
      [$display(frac(3, x))$ #linebreak() $display(frac(3x, x^2))$],
      [$display(frac(4, x))$ #linebreak() $display(frac(4x, x^2))$],
      [$display(frac(5, x))$ #linebreak() $display(frac(5x, x^2))$],
      columns: columns,
    )
  ])
}

#let boundary-question(number) = question(number, [키 큰 수식이 있는 문항 전체의 단·쪽 이동을 확인하자.], points: 3, body: [
  #view[
    양수 $x$에 대한 다음 식은 항등식이다.
    $ frac(1, 1 + frac(1, 1 + frac(1, x)))
      = frac(x+1, 2x+1) $
    $ mat(display(frac(1, 2)), display(frac(1, 3)); display(frac(2, 3)), display(frac(3, 4))) $
    위 행렬은 수식의 높이를 확인하는 자료이다.
  ]
  #choices([$display(frac(1, 2))$], [$display(frac(1, 3))$], [$display(frac(2, 3))$], [$display(frac(3, 4))$], [$1$], columns: 5)
])

// Reserved blocks intentionally leave too little room for the next complete
// question. No manual break is used: question() must carry its box and choices
// intact to the next column, then to the next page.
#let math-boundaries() = context {
  let compact = print-mode.get()
  block(height: if compact { 420pt } else { 675pt }, above: 0pt, below: 0pt)[
    #question(11, [다음 문항을 단 끝에 가깝게 보내기 위해 여백을 예약하였다.], body: [
      #material[이 아래의 예약 여백은 경계 검사용이다. 이어지는 12번의 보기와 선지가 한 문항으로 다음 단에 이동해야 한다.]
    ])
  ]
  boundary-question(12)
  v(2em)
  block(height: if compact { 400pt } else { 670pt }, above: 0pt, below: 0pt)[
    #question(13, [다음 문항을 쪽 끝에 가깝게 보내기 위해 여백을 예약하였다.], body: [
      #material[이어지는 14번의 보기와 선지가 한 문항으로 다음 쪽에 이동해야 한다.]
    ])
  ]
  boundary-question(14)
}

#let math-stress-paper() = {
  math-inline()
  colbreak()
  math-display()
  colbreak()
  math-material()
  colbreak()
  math-choices(columns: 1)
  colbreak()
  math-choices(columns: 2)
  colbreak()
  math-choices(columns: 3)
  colbreak()
  math-choices(columns: 5)
}
