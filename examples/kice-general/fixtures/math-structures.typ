// Structured-math layout fixtures. The fictional Minecraft subject supplies
// context; every matrix and system is defined here without game-version rules.
// Bare inline mat/cases deliberately exercise the shared automatic display rule.
#import "../src/lib.typ": question, choices, material, view, data-table, display

#let structures-gap = 1em

#let matrix-data(rows: 2) = {
  assert((2, 3).contains(rows))
  if rows == 2 {
    $mat(1, -display(frac(1, 2)); sqrt(2), 3)$
  } else {
    $mat(1, -display(frac(1, 2)), sqrt(2); 0, 3, display(frac(2, 3)); -1, 0, a_(3,3))$
  }
}

#let structures-matrices(rows: 2) = {
  question(21, [마인크래프트 좌표 자료의 #rows#sym.times#rows 행렬 $A$가 #matrix-data(rows: rows)일 때, 각 성분의 크기와 간격을 살펴보자.], body: [
    #material(title: [좌표 자료])[
      모든 성분은 실수이다. $a_(3,3)$이 나타나는 경우에는 그 성분의 값을 $1$로 정한다. 음수·분수·근호·첨자를 같은 행렬 안에 넣는다.

      열벡터 $v = mat(display(frac(1, 2)); -sqrt(2); a_3)$와 행벡터 $w = mat(display(frac(1, 2)), -sqrt(2), a_3)$를 기록한다. 여기서 $a_3 = 1$이다.

      같은 열벡터를 $v = vec(display(frac(1, 2)), -sqrt(2), a_3)$와 같이 기록한다.

      다음 $2 times 3$ 행렬은 별도의 좌표 자료이다.
      $ R = mat(1, -display(frac(1, 2)), sqrt(2); a_(2,1), 0, display(frac(2, 3))) $
      여기서 $a_(2,1) = -1$이다. 행렬 뒤의 문장과 다음 문단이 괄호의 위아래 끝에 닿지 않아야 한다.
    ]
    #view[
      두 좌표의 변환 행렬을 $B = mat(1, display(frac(1, 2)); -1, 2)$로 정한다.

      ㄱ. $display(B mat(2; 4) = mat(4; 6))$이다.

      ㄴ. $display(det(B) = frac(5, 2))$이다.
    ]
  ])
  v(structures-gap)
  question(22, [세 좌표의 연립방정식을 증강행렬로 기록한 자료를 살펴보자.], points: 3, body: [
    #material[
      $ cases(x + y + z = 6, 2x - y + z = 2, x + 2y - z = 7) $
      위 연립방정식의 계수와 우변을 다음과 같이 적는다. 세 번째 열 뒤의 세로선은 우변을 구분한다.
      $ mat(1, 1, 1, 6; 2, -1, 1, 2; 1, 2, -1, 7; augment: #3) $
      이 연립방정식의 해는 $cases(x = 2, y = 3, z = 1)$이다. 증강선과 행렬 괄호는 성분의 높이에 맞춰 늘어난다.
    ]
  ])
}

#let structures-systems(rows: 3) = {
  assert((2, 3).contains(rows))
  let equations = if rows == 2 {
    $cases(x + y &= 3, display(frac(x, 2)) - display(frac(y, 3)) &= 1)$
  } else {
    $cases(x + y + z &= 6, 2x - y + z &= 2, x + 2y - z &= 7)$
  }
  let solution = if rows == 2 {
    $cases(x = display(frac(12, 5)), y = display(frac(3, 5)))$
  } else {
    $cases(x = 2, y = 3, z = 1)$
  }
  question(23, [실수로 된 좌표가 #equations;을 만족한다. 연립식과 해의 줄 배치를 살펴보자.], points: 3, body: [
    #material[
      이 연립방정식의 해는 #solution;이다. 중괄호, 등호 정렬, 각 행의 분수는 하나의 구조를 이룬다.

      위아래 문장에는 보통 크기의 $x$, $y$, $z$를 쓴다. 키 큰 연립식 뒤에 이어지는 문장이 아랫줄과 겹치지 않아야 한다.
    ]
    #view[
      ㄱ. $cases(display(frac(t, 2)) >= -1, 3 - t > 0)$의 해는 $-2 <= t < 3$이다.

      ㄴ. $cases(u + v &= 3, u - v &= 1)$의 해는 $cases(u = 2, v = 1)$이다.
    ]
    #choices([ㄱ], [ㄴ], [ㄱ, ㄴ], [둘 다 성립하지 않음], [조건이 부족함], columns: 2)
  ])
  v(structures-gap)
  question(24, [채굴 기록의 시간 $t$에 따라 다음 함수 $f$를 정의한다.], body: [
    #material[
      $ f(t) = cases(
        display(frac(1, 1+t^2)) & "(" t < 0 "일 때)",
        sqrt(1+t) & "(" 0 <= t < 3 "일 때)",
        display(frac(t+1, 2)) & "(" t >= 3 "일 때)",
      ) $
      모든 실수 $t$에 대해 적용할 식이 하나씩 정해진다. 수식과 한국어 조건을 서로 다른 정렬 지점에 둔다.
      #data-table((0.6fr, 1fr, 1.2fr), header: ([$t$], [$f(t)$], [적용 조건]), rows: (
        ([$-1$], [$display(frac(1, 2))$], [$t < 0$]),
        ([$0$], [$1$], [$0 <= t < 3$]),
        ([$3$], [$2$], [$t >= 3$]),
      ))
    ]
  ])
  v(structures-gap)
  question(25, [실수 $s$와 $t$에 대한 좌표 계산을 등호에 맞춰 기록한다.], body: [
    #material[
      $ mat(1, display(frac(1, 2)); -1, 2) mat(s; t)
        &= mat(s + display(frac(t, 2)); -s + 2t) \
        mat(1, display(frac(1, 2)); -1, 2) mat(2; 4)
        &= mat(4; 6) $
      두 줄의 등호가 같은 위치에 놓인다. 여러 줄 행렬식의 괄호와 분수선은 상자 안에 들어간다.

      양수 $s$에 대한 $display(s^(frac(1, 1 + frac(1, s))) + 1)$은 위첨자가 큰 식이다. $display(a_(frac(1, 1+s)) + 1)$에서 $a$는 아래첨자로 구분하는 기록이다. 첨자가 서로 다른 높이로 놓여도 앞뒤 문장의 줄 간격이 확보되어야 한다.
    ]
  ])
}

// Five-column options are narrow column vectors. Wider matrix and system
// options use one or two columns instead of forcing their contents to shrink.
#let structures-choices(columns: 2) = {
  assert((1, 2, 5).contains(columns))
  let values = if columns == 5 {
    (
      [$mat(1; -1)$], [$mat(2; -2)$], [$mat(3; -3)$],
      [$mat(4; -4)$], [$mat(5; -5)$],
    )
  } else {
    (
      [$mat(display(frac(1, 2)), -1; 0, sqrt(2))$],
      [$mat(display(frac(2, 3)), 0; -1, sqrt(3))$],
      [$mat(-1, display(frac(1, 3)); sqrt(2), 0)$],
      [$mat(0, sqrt(3); display(frac(1, 2)), -1)$],
      [$mat(sqrt(2), 0; -1, display(frac(2, 3)))$],
    )
  }
  question(26, [다섯 좌표 자료의 괄호·성분·선지 번호의 기준선을 살펴보자.], body: [
    #choices(..values, columns: columns)
  ])
  v(structures-gap)
  question(27, [각 선지의 두 좌표는 그 아래 연립방정식의 해이다.], points: 3, body: [
    #choices(
      [$cases(x = 1, y = 2)$ #linebreak() $cases(x + y = 3, x - y = -1)$],
      [$cases(x = 2, y = 1)$ #linebreak() $cases(x + y = 3, x - y = 1)$],
      [$cases(x = -1, y = 3)$ #linebreak() $cases(x + y = 2, x - y = -4)$],
      [$cases(x = 3, y = -1)$ #linebreak() $cases(x + y = 2, x - y = 4)$],
      [$cases(x = 0, y = 2)$ #linebreak() $cases(x + y = 2, x - y = -2)$],
      columns: if columns == 5 { 2 } else { columns },
    )
  ])
  v(structures-gap)
  question(28, [행렬과 연립식이 같은 표의 서로 다른 셀에 놓인 자료를 살펴보자.], body: [
    #material[
      #data-table((0.45fr, 1fr, 1.1fr), header: ([기록], [행렬], [연립식]), rows: (
        ([갑], [$mat(1, -1; 0, 2)$], [$cases(x + y = 3, x - y = 1)$]),
        ([을], [$mat(display(frac(1, 2)), 0; -1, sqrt(2))$], [$cases(x = display(frac(1, 2)), y = sqrt(2))$]),
      ))
      각 셀의 높이는 안에 들어간 수식 전체를 포함한다. 분모·근호·중괄호가 셀의 테두리에 닿지 않아야 한다.
    ]
  ])
}

#let structured-boundary-question(number) = question(number, [다음 좌표 자료 전체가 한 문항으로 단·쪽을 이동한다.], points: 3, body: [
  #view[
    $ A = mat(display(frac(1, 2)), -1; sqrt(2), 3) $
    이 행렬은 좌표 자료이다. 별도로 정의한 연립방정식
    $ cases(x + y + z &= 6, 2x - y + z &= 2, x + 2y - z &= 7) $
    의 해는 $cases(x = 2, y = 3, z = 1)$이다.
  ]
  #choices([$mat(1; -1)$], [$mat(2; -2)$], [$mat(3; -3)$], [$mat(4; -4)$], [$mat(5; -5)$], columns: 5)
])

// The deliberately reserved space is smaller than the next complete question.
// question() must advance naturally, with no colbreak/pagebreak inside it.
#let structures-boundaries() = context {
  let scale = text.size / 11.5pt
  block(height: 690pt * scale, above: 0pt, below: 0pt)[
    #question(29, [다음 문항의 자연스러운 단 이동을 확인하기 위해 여백을 예약한다.], body: [
      #material[30번의 행렬·연립식·벡터 선지는 함께 오른쪽 단으로 이동해야 한다.]
    ])
  ]
  structured-boundary-question(30)
  v(structures-gap)
  block(height: 500pt * scale, above: 0pt, below: 0pt)[
    #question(31, [다음 문항의 자연스러운 쪽 이동을 확인하기 위해 여백을 예약한다.], body: [
      #material[32번의 행렬·연립식·벡터 선지는 함께 다음 쪽으로 이동해야 한다.]
    ])
  ]
  structured-boundary-question(32)
}

#let math-structures-paper() = {
  structures-matrices(rows: 2)
  colbreak()
  structures-matrices(rows: 3)
  colbreak()
  structures-systems(rows: 2)
  colbreak()
  structures-systems(rows: 3)
  colbreak()
  structures-choices(columns: 1)
  colbreak()
  structures-choices(columns: 2)
  colbreak()
  structures-choices(columns: 5)
}
