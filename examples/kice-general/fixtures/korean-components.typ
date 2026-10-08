// Every passage, poem, dramatic scene and question in this fixture is newly
// written. It reproduces types of examination material, never KICE wording.
// The technical discussion fixes Java Edition 1.21.1 and explicitly separates
// saved chunks, ticking eligibility, candidate selection and successful growth.
#import "../src/lib.typ": instruction, framed-passage, passage-sections, paired-passage, verse, source-line, passage-notes, excerpt-gap, marked-range, synopsis, dialogue, stage-direction, draft, editor-note, writing-plan, media-window, media-post, reading-set, question, choices, view, u, mark, final-notice

#let korean-notice = [마인크래프트를 소재로 새로 작성한 비공식 창작 예시입니다.]

#let tick-ga = [
  마인크래프트 Java Edition 1.21.1에서 밭의 변화를 관찰할 때에는 현실의 시계와 게임 안의 처리 시간을 구별해야 한다. 게임 틱은 세계의 상태를 갱신하는 단위이다. 통상적인 목표 속도는 초당 20게임 틱이지만 서버의 처리가 늦어지면 같은 수의 틱에 더 긴 현실 시간이 걸릴 수 있다. 따라서 ‘십 분을 기다렸다’는 기록만으로 생장 기회의 수를 확정할 수는 없다.

  세계는 청크라는 구역으로 나뉜다. 구역의 정보가 저장되어 있다는 사실과 그 구역에서 현재 필요한 틱 처리가 실행된다는 사실은 다르다. 화면에서 보이지 않는다고 모든 처리가 멈추는 것도 아니고, 청크가 메모리에 있다는 이유만으로 모든 종류의 처리가 실행되는 것도 아니다. 어떤 변화를 비교하려면 그 변화에 필요한 처리 조건이 충족되는지 먼저 확인해야 한다.

  무작위 틱은 생장할 작물을 한 포기씩 확정하여 같은 횟수만큼 호출하는 시계가 아니다. 블록 위치의 후보 선택과 선택된 블록의 반응을 구별해야 한다. 예컨대 성숙 전의 밀은 필요한 밝기와 주변 조건을 충족해도 생장 판정에 실패할 수 있다. 성숙한 밀은 후보 위치로 선택되더라도 계속 자라지 않는다. 그러므로 #mark([㉠], [후보 선택 횟수를 곧 생장 횟수로 읽는 일])은 기회와 결과를 혼동한 것이다.
]

#let tick-na = [
  한 기록자는 두 밭을 비교하며 수확량이 많은 쪽을 ‘더 빠른 밭’이라고 불렀다. 그러나 한 포기가 성숙할 가능성과 전체 밭에서 얻는 밀의 수는 같은 양이 아니다. 행마다 밀과 당근을 번갈아 심는 배치는 한 포기의 생장 조건에 이로울 수 있지만, 같은 넓이에 심는 밀의 수를 줄인다. 확률만 비교하면 개체 수를 놓치고, 수확량만 비교하면 그 차이를 만든 조건을 놓친다.

  기록자는 비교의 기준을 바꾸었다. 같은 생장 단계에서 출발한 밀을 정하고 각 위치가 선택된 횟수, 주변 배치와 최종 상태를 따로 적었다. 변화가 없던 기록도 지우지 않았다. ‘선택되었으나 실패함’과 ‘처리 조건이 충족되지 않아 선택 기회가 없었음’은 겉으로는 같은 정지처럼 보여도 서로 다른 사건이기 때문이다.

  관찰의 정확성은 모든 빈칸을 성공이나 실패 중 하나로 채우는 데 있지 않다. 무엇을 확인했고 무엇을 확인하지 못했는지를 구별하는 데 있다. #mark([㉡], [기록의 빈칸을 남겨 두는 일])은 설명을 포기하는 일이 아니라, 근거 없는 설명이 확인된 사실의 자리를 차지하지 못하게 하는 일이다.
]

#let korean-paired() = paired-passage(tick-ga, tick-na)

#let poem-ga = [
  #verse((
    ([비가 그친 밭에], [마지막 횃불을 꽂고], [나는 자란 것을 세었다.]),
    ([아직 자라지 않은 한 칸이], [내 숫자 밖에서], [조용히 밤을 밝히고 있었다.]),
  ))
  #marked-range([A], [
    #verse((([그 한 칸을 비워 둔 채], [돌아오는 길에], [나는 처음으로 밭의 넓이를 알았다.]),))
  ])
  #source-line([창작], [한 칸])
]

#let poem-na = [
  #verse((
    ([아버지는 길을 만들 때], [가장 곧은 선을 고르지 않았다.]),
    ([물가를 따라 돌아서고], [작은 언덕의 그늘을 남겨 두었다.]),
    ([오래 뒤 혼자 돌아와], [끊어진 다리 한 칸을 놓는다.]),
    ([건너는 발 아래], [돌아가는 길이 다시 이어진다.]),
  ))
  #source-line([창작], [돌아가는 길])
  #passage-notes((
    (term: [돌아가는 길], body: [곧바로 가로지르지 않고 주변을 지나 이어지는 길.]),
  ))
]

#let korean-poems() = passage-sections(((label: [(가)], body: poem-ga), (label: [(나)], body: poem-na)))

#let drama-body = [
  #synopsis[민서는 멀리 떨어진 밭에 다녀오면 언제나 같은 수확량이 쌓일 것이라고 생각한다. 준호는 둘의 관찰 방법을 먼저 확인하려 한다.]
  #dialogue((
    (speaker: [민서], body: [어제는 십 분 뒤 돌아왔더니 여섯 포기가 자랐어. 오늘도 십 분을 기다리면 여섯 포기가 자랄 거야.]),
    (speaker: [준호], body: [어제는 밭 옆에 있었지? 오늘은 밭에서 멀리 떠날 계획이고. 같은 현실 시간이 곧 같은 생장 기회라는 뜻은 아니야.]),
    (speaker: [민서], body: [그럼 화면에 밭이 보이는 동안만 세면 되겠네.]),
    (speaker: [준호], body: [보이는지보다 그 밭에서 필요한 처리가 실행되는지 확인해야 해. 처리되고 있어도 각 위치가 선택되는 횟수와 생장 결과는 같지 않을 수 있고.]),
  ))
  #excerpt-gap(label: [중략])
  #dialogue((
    (speaker: [민서], body: [오늘의 표에는 왜 변화가 없는 칸이 이렇게 많지? 결과가 없으니 지워도 될까?]),
    (speaker: [준호], body: [#mark([㉢], [지우기 전에 무엇을 세었는지 적자.]) 후보 선택은 확인했지만 성숙하지 않은 것인지, 선택 여부 자체를 모르는 것인지 말이야.]),
    (speaker: [민서], body: [그러면 오늘 표가 어제보다 빈약해 보이지 않을까?]),
    (speaker: [준호], body: [표가 빽빽해지는 것과 설명이 정확해지는 것은 다르잖아.]),
  ))
  #stage-direction[(민서는 ‘변화 없음’ 옆에 관찰 조건을 적고, 빈칸 하나를 지우려던 손을 멈춘다.)]
  #source-line([창작], [지우기 전의 표])
]

#let korean-drama() = framed-passage(drama-body)

#let writing-stages = (
  (title: [독자·목적], body: [새 회원의 관찰 오류를 줄이는 안내 글]),
  (title: [내용 조직], body: [처리 조건·후보 선택·생장 결과의 순서로 설명]),
  (title: [기록 예시], body: [시작 상태·배치·미확인 정보를 구별]),
)

#let student-draft = [
  우리가 멀리 다녀오는 동안에도 밭의 시간이 언제나 똑같이 흐른다고 생각하기 쉽다. 그러나 저장된 밭이 있다는 사실만으로 그곳에서 필요한 틱 처리가 실행된다고 말할 수는 없다. 먼저 처리 조건을 확인해야 한다.

  다음으로는 무엇을 센 것인지 밝혀야 한다. 한 위치가 무작위 틱 후보로 선택되는 것과 밀의 생장 단계가 오르는 것은 다르다. #u[선택되었다면 생장에 성공한 것이다.] 같은 단계에서 출발한 밀도 판정 결과에 따라 최종 상태가 달라질 수 있다.

  동아리의 새 기록표에는 버전, 시작 단계, 주변 배치, 후보 선택의 확인 여부와 최종 상태를 적자. 모르는 값은 ‘미확인’으로 남긴다. 빈칸이 없는 표보다 조건과 결과가 구별되는 표가 비교에 도움이 된다.
]

#let korean-writing() = [
  #writing-plan(writing-stages)
  #v(0.8em)
  #draft(student-draft, title: [학생의 초고])
  #v(0.7em)
  #editor-note([교사의 메모], [둘째 문단에서 후보 선택과 생장 성공을 혼동한 문장을 고쳐 보자.])
]

#let media-body = [
  #media-post([동아리 운영자], [
    이번 주 관찰 기록은 Java Edition 1.21.1을 기준으로 올려 주세요. ‘십 분 뒤 수확’만 적지 말고, 처리 조건과 시작 상태를 함께 적어 주세요. 후보 선택을 직접 확인하지 못했다면 미확인이라고 표시해도 됩니다.
  ], time: [오늘 09:00])
  #v(0.7em)
  #media-post([새싹], [
    화면에 밭이 보였는데 변화가 없었어요. 사진만으로 후보가 몇 번 선택되었는지도 알 수 있을까요?
  ], time: [오늘 09:12])
  #v(0.7em)
  #media-post([기록 담당], [
    정지 사진은 그 순간의 상태를 보여 주지만 선택 횟수를 직접 보여 주지는 않아요. 사진에 시작·끝 상태를 붙이고, 확인하지 못한 처리 조건은 따로 표시해 주세요. 관찰 양식은 아래에 공유할게요.
  ], time: [오늘 09:18])
]

#let korean-media() = media-window(media-body, title: [밭 관찰 동아리 게시판], toolbar: [기록 모음#h(1.2em)질문#h(1.2em)공지], caption: [학생들이 동아리 게시판에서 관찰 방법을 논의한 화면])

// Question data is the single source for rendered options and QA answers.
#let korean-questions = (
  (
    prompt: [(가), (나)의 설명 방식에 대한 이해로 가장 적절한 것은?],
    choices: (
      [(가)는 시간의 단위를 없애야 생장 속도를 정확히 비교할 수 있다고 주장한다.],
      [(나)는 한 포기의 생장 가능성을 알면 밭 전체의 수확량을 확정할 수 있다고 주장한다.],
      [(가)는 처리 과정의 구별을, (나)는 비교 기준과 기록 조건의 구별을 통해 관찰의 오류를 설명한다.],
      [(가)와 (나)는 화면에 보이는 상태만으로 모든 처리의 실행 여부를 판정한다.],
      [(가)와 (나)는 관찰의 빈칸을 성공이나 실패 중 하나로 채우는 방법을 제안한다.],
    ), answer: 3,
    explanation: [(가)는 저장·처리·선택·생장을 구별한다. (나)는 확률과 전체 수확량, 미확인과 실패를 구별하여 비교의 근거를 분명히 한다.],
  ),
  (
    prompt: [㉠, ㉡에 대한 설명으로 가장 적절한 것은?],
    choices: (
      [㉠은 선택 횟수를 적지 않아도 생장 결과를 알 수 있다는 뜻이다.],
      [㉠은 기회를 결과로 바꾸어 읽는 오류이며, ㉡은 미확인 사실을 확정된 사실과 구별하는 태도이다.],
      [㉡은 생장에 실패한 모든 기록을 표에서 삭제하는 방법이다.],
      [㉠과 ㉡은 모두 관찰한 결과를 임의로 바꾸어 비교를 단순하게 한다.],
      [㉠과 ㉡은 모두 성숙한 밀의 생장 횟수를 늘리는 방법이다.],
    ), answer: 2,
    explanation: [후보 선택과 생장 성공은 다른 사건이다. 미확인 값을 남겨 두면 근거 없는 판정이 확인된 관찰과 섞이는 것을 막을 수 있다.],
  ),
  (
    prompt: [윗글을 바탕으로 #text("<보기>")를 이해한 내용으로 가장 적절한 것은?], points: 3,
    view: [
      관찰자 X는 밭의 시작·끝 사진만 기록했다. 관찰자 Y는 같은 버전의 다른 밭에서 필요한 틱 처리 조건이 유지됨을 확인하고, 성숙 전 밀의 한 위치가 후보로 세 번 선택되었으나 생장하지 않았음을 기록했다. 그 밖의 조건과 선택 여부는 X의 기록에 없다.
    ],
    choices: (
      [X의 사진에 변화가 없으면 선택 횟수는 반드시 0회이다.],
      [Y의 밀은 세 번 선택되었으므로 생장 단계가 세 단계 올랐다.],
      [X와 Y는 관찰한 현실 시간과 무관하게 같은 횟수의 선택을 확인했다.],
      [Y는 선택 뒤의 실패를 확인했지만, X는 사진만으로 같은 사건을 확인했다고 할 수 없다.],
      [X의 사진은 그 순간의 상태를 보여 줄 수 없으므로 비교 자료가 되지 않는다.],
    ), answer: 4,
    explanation: [Y에는 선택과 결과의 기록이 모두 있다. X에는 두 시점의 상태만 있으므로 선택의 부재와 선택 뒤의 실패를 구별할 수 없다.],
  ),
  (
    prompt: [(가), (나)의 표현에 대한 설명으로 가장 적절한 것은?],
    choices: (
      [(가)는 자라지 않은 칸을 없애고 모든 상태를 하나의 숫자로 확정한다.],
      [(가)는 세지 못한 공간을 새롭게 바라보며, (나)는 길을 보수하는 행동으로 타인에게서 받은 관계를 이어 간다.],
      [(나)의 화자는 곧은 길을 만들지 않은 아버지를 끝까지 원망한다.],
      [(가)와 (나)는 모두 자연의 장애물을 제거하는 일을 유일한 가치로 제시한다.],
      [(가)와 (나)는 모두 현재의 행동 없이 과거의 완성된 풍경만 제시한다.],
    ), answer: 2,
    explanation: [(가)는 숫자 밖에 있던 한 칸을 통해 밭을 다시 인식한다. (나)는 끊어진 다리 한 칸을 놓아 아버지의 길을 현재의 행동으로 잇는다.],
  ),
  (
    prompt: [#text("<보기>")를 참고하여 [A]를 감상한 내용으로 가장 적절한 것은?], points: 3,
    view: [
      문학에서 비어 있는 자리는 단순한 결핍으로만 기능하지 않는다. 화자가 자신이 세거나 소유한 것의 경계를 자각할 때, 빈자리는 그 경계 밖의 존재를 다시 바라보게 하는 계기가 될 수 있다.
    ],
    choices: (
      [한 칸을 비워 둔 것은 모든 칸이 성숙했다고 확정한 결과이겠군.],
      [돌아오는 길은 밭의 빈자리가 완전히 제거되었음을 뜻하겠군.],
      [처음으로 넓이를 안다는 것은 숫자로 세던 방식의 경계를 자각하고 밭을 새롭게 바라본 일이겠군.],
      [화자는 빈칸 때문에 자신의 관찰을 모두 무가치하게 여기겠군.],
      [화자는 숫자 밖의 존재를 보지 않으려고 밭의 넓이를 줄이겠군.],
    ), answer: 3,
    explanation: [‘처음으로’는 인식의 변화를 드러낸다. 세지 못한 한 칸을 남기는 행동과 연결하면 계량의 경계를 깨닫는 장면으로 읽을 수 있다.],
  ),
  (
    prompt: [윗글의 대화 내용에 대한 이해로 가장 적절한 것은?],
    choices: (
      [민서는 첫 발화에서 두 관찰의 처리 조건이 같음을 확인한 뒤 결과를 예측한다.],
      [준호는 화면에 보이는 밭에서는 반드시 같은 횟수의 후보 선택이 일어난다고 말한다.],
      [민서는 대화가 진행될수록 관찰 조건을 적는 일을 일관되게 거부한다.],
      [준호는 변화가 없는 모든 기록을 실패로 확정한 뒤 지우라고 제안한다.],
      [준호는 현실 시간이 같다는 이유만으로 생장 기회와 결과가 같다고 판단하는 것을 경계한다.],
    ), answer: 5,
    explanation: [준호는 첫 비교의 처리 조건이 다르며, 처리·선택·결과도 구별해야 한다고 말한다. 마지막 행동은 민서가 관찰 조건을 다시 고려했음을 보여 준다.],
  ),
  (
    prompt: [㉢에 나타난 준호의 말하기 방식으로 가장 적절한 것은?],
    choices: (
      [행동에 앞서 판단의 근거를 점검하도록 제안한다.],
      [상대의 경험을 거짓이라고 단정하여 대화를 끝낸다.],
      [자료의 형식을 문제 삼아 모든 기록을 폐기하게 한다.],
      [앞서 확인하지 않은 선택 횟수를 정확한 숫자로 제시한다.],
      [자신의 실패를 숨기기 위해 다른 주제로 화제를 돌린다.],
    ), answer: 1,
    explanation: [‘지우기 전에’는 예정된 행동을 잠시 멈추게 하고, ‘무엇을 세었는지’는 판단의 근거를 확인하게 한다.],
  ),
  (
    prompt: [#text("<작성 계획>")이 #text("<학생의 초고>")에 반영된 양상으로 가장 적절한 것은?],
    choices: (
      [세계 구현의 모든 세부 규칙을 버전과 관계없이 열거했다.],
      [독자를 숙련된 개발자로 한정하여 전문 용어의 설명을 생략했다.],
      [사진만으로 후보 선택 횟수를 알 수 있음을 근거로 제시했다.],
      [처리 조건을 먼저 설명하고, 후보 선택과 생장 결과를 구별해야 하는 이유를 이어 설명했다.],
      [관찰하지 못한 값을 전부 실패로 바꾸도록 기록 양식을 정했다.],
    ), answer: 4,
    explanation: [초고의 첫 문단은 처리 조건, 둘째 문단은 무엇을 셌는지, 마지막 문단은 기록 양식의 순서로 조직되어 있다.],
  ),
  (
    prompt: [밑줄 친 문장을 고쳐 쓴 것으로 가장 적절한 것은?],
    choices: (
      [선택 여부를 확인하지 못했다면 생장에 실패한 것이다.],
      [화면에 보였다면 모든 종류의 틱 처리가 실행된 것이다.],
      [선택되었다고 해서 생장 판정에 반드시 성공한 것은 아니다.],
      [생장 단계가 같으면 후보 선택 횟수도 언제나 같다.],
      [저장된 밭은 현실 시간에 비례하여 항상 같은 수확량을 만든다.],
    ), answer: 3,
    explanation: [초고의 목적과 뒤 문장의 내용에 맞게 선택 기회와 생장 성공을 구별해야 한다. 다른 선지는 확인되지 않은 정보를 확정하거나 처리 조건을 지운다.],
  ),
  (
    prompt: [게시판 참여자의 매체 이용에 대한 설명으로 가장 적절한 것은?],
    choices: (
      [운영자는 관찰의 버전을 숨겨 모든 기록이 같은 조건임을 보장한다.],
      [기록 담당은 정지 사진으로 확인할 수 있는 정보의 범위를 설명하고 공동 기록 양식을 공유한다.],
      [새싹은 사진이 후보 선택 횟수를 직접 보여 준다는 사실을 증명한다.],
      [기록 담당은 사진 자료를 사용할 수 없으므로 모든 사진을 삭제하게 한다.],
      [운영자와 기록 담당은 미확인 정보도 반드시 확정된 수치로 제출하게 한다.],
    ), answer: 2,
    explanation: [기록 담당은 사진을 버리지 않고 시작·끝 상태 자료로 사용하며, 직접 보여 주지 않는 선택 횟수와 처리 조건은 별도로 표시하게 한다.],
  ),
)

#let korean-answer-key = korean-questions.map(item => item.answer)
#assert(korean-questions.len() == 10)
#for item in korean-questions { assert(item.choices.len() == 5 and item.answer >= 1 and item.answer <= 5) }

#let korean-question(number) = {
  let item = korean-questions.at(number - 1)
  question(number, item.prompt, points: item.at("points", default: none), body: [
    #if "view" in item { view(item.view) }
    #choices(..item.choices)
  ])
}

#let korean-reading-set(kind: "paired") = {
  if kind == "paired" {
    reading-set(from: 1, to: 3, lead: [다음 글을 읽고 물음에 답하시오.],
      sections: ((label: [(가)], body: tick-ga), (label: [(나)], body: tick-na)),
      questions: range(1, 4).map(korean-question))
  } else if kind == "poems" {
    reading-set(from: 4, to: 5, lead: [다음 글을 읽고 물음에 답하시오.],
      sections: ((label: [(가)], body: poem-ga), (label: [(나)], body: poem-na)),
      questions: range(4, 6).map(korean-question))
  } else if kind == "drama" {
    reading-set(from: 6, to: 7, lead: [다음 글을 읽고 물음에 답하시오.],
      sections: ((body: drama-body),), questions: range(6, 8).map(korean-question))
  } else if kind == "writing" {
    reading-set(from: 8, to: 9, lead: [다음은 학생의 작성 계획과 초고이다. 물음에 답하시오.],
      sections: ((label: [작성 계획], body: writing-plan(writing-stages)), (label: [학생의 초고], body: student-draft)),
      questions: range(8, 10).map(korean-question))
  } else {
    assert(kind == "media")
    // media-window already supplies a source frame; avoid a second frame.
    instruction(10, body: [다음은 동아리 게시판 화면이다. 물음에 답하시오.])
    korean-media()
    v(1em)
    korean-question(10)
  }
}

#let korean-paper() = {
  for (index, kind) in ("paired", "poems", "drama", "writing", "media").enumerate() {
    if index > 0 { v(1.5em) }
    korean-reading-set(kind: kind)
  }
  final-notice()
}

// The range deliberately outgrows one column. Its content remains normal
// paragraphs so the bracket is tested at both a column and a page boundary.
#let korean-range-probe(side: left) = framed-passage[
  #marked-range([B], side: side, [
    #for i in range(1, 19) {
      [기록 #i. 플레이어는 같은 길을 걸었지만 매번 같은 밭을 보지는 않았다. 처음에는 자란 밀의 수만 적었다. 다음에는 시작 상태와 관찰 조건을 함께 적었다. 변화가 없던 자리도 남겨 두었다. ‘변화 없음’이라는 같은 표현 아래 서로 다른 조건이 숨을 수 있기 때문이다. 사진으로 확인한 것과 로그로 확인한 것을 나누어 적고 나니, 빈칸은 실수의 흔적이 아니라 다음 관찰의 질문이 되었다.#parbreak()]
    }
  ])
]
