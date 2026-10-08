# kice-general

평가원 시험지 PDF의 판면을 기준으로 만든 과목 공용 Typst 템플릿이다. `kice-korean`의 Typst-native story 구조를 따르며, 탐구형 첫 쪽과 공통 영역형 첫 쪽을 지원한다. 예시는 실제 수능에 없는 **마인크래프트** 영역이다.

## 실행

typstbook 저장소 루트에서 실행한다. 설치된 Typst 0.15.1과 저장소의 Node 의존성을 사용한다.

```sh
node examples/kice-general/workbench.mjs dev
node examples/kice-general/workbench.mjs pdf
node examples/kice-general/workbench.mjs pdf:a4
node examples/kice-general/workbench.mjs pdf:math
node examples/kice-general/workbench.mjs pdf:structures
node examples/kice-general/workbench.mjs pdf:answers
node examples/kice-general/workbench.mjs pdf:korean
node examples/kice-general/workbench.mjs pdf:korean:a4
node examples/kice-general/workbench.mjs pdf:korean:pixel
node examples/kice-general/workbench.mjs test
# 의도한 디자인 변경 후 baseline 갱신
node examples/kice-general/workbench.mjs test --update
```

`pnpm dev:kice-general`, `pnpm pdf:kice-general`, `pnpm pdf:kice-general:a4`, `pnpm test:kice-general`도 같은 명령이다. 원본 판형 문제지는 `dist/minecraft.pdf`, A4 인쇄판은 `dist/minecraft-a4.pdf`, 정답·해설은 `dist/minecraft-answers.pdf`, 수식 검증 PDF는 `dist/math-stress.pdf`, 행렬·연립식 검증 PDF는 `dist/math-structures.pdf`에 나온다. `build --out <경로>`는 기존 typstbook의 정적 story 빌드를 사용한다.

국어 확충 예시는 `dist/korean-reference.pdf`(평가원 판형)와 `dist/korean-a4.pdf`(A4)에 나온다. 독서·운문·극·작문·매체의 창작 10문항이며, 두 판형이 `fixtures/korean-components.typ`의 같은 원고를 사용한다. 검토한 기출 PDF와 형식별 관찰·측정값은 [KOREAN-REFERENCE.md](KOREAN-REFERENCE.md)에 기록했다.

`pdf:korean:pixel`은 `dist/korean-pixel.pdf`를 만든다. **2026학년도 6월 모의평가 국어 1쪽**의 머리말·31행 지문·보기·선지를 고정 좌표로 대조하는 창작 기준판이다. 원본 본문을 복제하지 않으며, 모든 글리프가 완전히 같은 픽셀로 재현되지는 않는다. 측정 범위와 결과는 [PIXEL-CALIBRATION.md](PIXEL-CALIBRATION.md)에 기록한다.

## 폰트는 한 곳에서 관리

모든 글꼴 패밀리와 역할별 기준 크기는 **`src/fonts.typ`**에만 있다. `font-profiles.kice`의 역할별 가족과 `sizes`를 수정하면 시험지와 모든 컴포넌트·story에 함께 반영된다. 본문·발문·자료·표·영역명·시험명·문항 번호·선지 번호·수식·안내문을 각각 지정할 수 있다. 자료 설명과 `<보기>` 내부 본문은 serif이다. 표의 글꼴·크기는 원본처럼 별도 역할을 사용한다. 시험지용 원본 폰트9개와 답지용 폰트3개는 패키지의 `fonts/`에 포함했다. 파일별 출처는 [fonts/NOTICE.md](fonts/NOTICE.md), SHA256은 [fonts/manifest.json](fonts/manifest.json)에 기록했다.

과목별 조판 차이는 `src/typography.typ`의 `science`·`math`·`korean`에 있다. `exam(typography: "science")`가 기본이다. 과학탐구는 11.5pt 명조 설명과 10pt 고딕 표, 수학은 11.48pt 명조·넓은 조건/보기 행간·모든 배점 표시, 국어는 11.5pt 명조·약18.38pt 행간·긴 선지의 후속 줄 들여쓰기를 사용한다. 수학·국어의 문항번호는95%, 과학탐구는100% 장평이다. `layout`은 머리말 구성, `typography`는 본문 조판으로 각각 지정한다. 과목별 원본 측정값은 [REFERENCE.md](REFERENCE.md)에 있다.

launcher는 아래 순서로 폰트 디렉터리를 찾고 `TYPST_FONT_PATHS`를 설정한다. 추출, SVG 미리보기, PDF 다운로드에 같은 경로가 적용된다.

1. 환경 변수 `KICE_GENERAL_FONT_DIR`
2. 패키지에 포함된 `fonts/` 디렉터리
3. 현재 작업공간의 형제 저장소 `trinity-press/templates/kice-suneung/fonts`

기존 `TYPST_FONT_PATHS`도 보존한다. launcher를 사용하면 다른 저장소의 폰트 경로 없이 포함된 서체로 실행할 수 있다. 시험지의 폰트를 교체하려면 `fonts.typ`의 `#let fonts = font-profiles.portable`로 바꾸고 Pretendard를 설치한다. 두 profile은 글리프 모양과 폭이 달라 snapshot을 별도로 갱신해야 한다. 원본 서체를 포함했으므로 공용 CI의 `test:snapshots`에도 이 예제를 추가했다.

```sh
KICE_GENERAL_FONT_DIR=/path/to/licensed-fonts node examples/kice-general/workbench.mjs dev
typst compile --root examples/kice-general --font-path /path/to/licensed-fonts \
  examples/kice-general/sample.typ examples/kice-general/dist/minecraft.pdf
```

폰트 파일의 사용 조건은 각 원본의 라이선스를 따른다. 패키지의 MIT 라이선스는 템플릿 코드에 적용된다. 폰트별 권리자와 라이선스 정보는 [fonts/NOTICE.md](fonts/NOTICE.md)에 있다.

## 사용

```typ
#import "src/lib.typ": *

#show: exam.with(
  year: 2027,
  session: [6월 모의평가], // none 또는 ""이면 본수능
  area: [게임탐구],
  subject: [마인크래프트],
  period: 4,
)

#question(1, [통나무 1개로 판자 4개를 만들 때 판자 16개에 필요한 통나무의 개수는?], body: [
  #material[다른 재료는 필요하지 않으며, 남은 판자는 버리지 않는다.]
  #choices(columns: 5, [2개], [3개], [4개], [5개], [6개])
])
```

| API | 동작 |
| --- | --- |
| `exam(...)` | 기본 842×1191pt 원본 PDF 판형, 2단, 첫 쪽/계속 쪽 머리말, 쪽번호 |
| `typography: "science"/"math"/"korean"` | 과목별 자료·보기·표·선지 행간, 번호 장평, 배점 표시 |
| `layout: "elective"` | 성명·수험번호·선택란이 있는 탐구형 첫 쪽 |
| `layout: "standard", subject: none` | 응시자 정보란 없는 국어·수학·영어형 첫 쪽 |
| `paper: "a4"` | 실제 A4에서 본문10.5pt·표9pt를 유지하는 전용 재조판 |
| `paper: "a4-scaled"` | 원본 판면과 글자를70.7%로 함께 줄인 A4 축소본 |
| `selected: false` | 탐구형의 선택란만 생략 |
| `form: [홀수형]` | 형 표시; 기본 `none` |
| `first-page: false`, `page-offset: 1` | 2쪽처럼 첫 쪽 정보란 없이 시작 |
| `total-pages: auto` | 실제 문서의 최종 쪽수; 명시 정수도 가능 |
| `booklet-offset: 16, booklet-pages: 36` | 위쪽 과목 쪽수 1, 아래쪽 합본 쪽수 17/36 |
| `tab-label: none` | 원본·축소판의 첫 쪽 바깥 회색 세로 과목 탭 숨김; 문자열로 별도 지정 가능 |
| `notice: [...]` | 아래 안내문 교체; 기본은 비공식 창작 예시 표시 |
| `question(number, prompt, points:, body:)` | 문항을 단/쪽 중간에서 나누지 않음; 탐구의 기본 2점은 생략 |
| `show-points: true/false` | 문항 배점의 강제 표시/생략 |
| `spread-questions(items, gap:, balance: true)` | A4 시험지 안에서 문항의 실제 높이를 재어 최소 쪽수와 좌우 단 균형을 함께 계산 |
| `balanced-question-flow(items, gap:, first-height:, height:, width:)` | 직접 지정한 판면의 자동 단 배치; 마지막 안내문은 마지막 문항과 한 블록으로 전달 |
| `choices(columns: 1/2/3/5, ..items)` | 정확히 다섯 선지; 행 순서로 배열하고 긴 선지는 내어쓰기 |
| `material(body, title: none, justify: auto)` | serif 자료 상자; 수식이 많은 자료의 양끝 정렬을 별도 선택 가능 |
| `view(body, title: auto)` | 명조 보기 상자; 제목의 ‘보 기’는 본문 명조, 꺾쇠는 라벨 서체 |
| `data-table(columns, header: (), rows: (), size:, header-size:)` | `columns`는 정수 또는 폭 tuple, 각 행은 셀 tuple; 표 글자 크기를 별도 지정 가능 |
| `passage(body)` | 국어형 단 전체 폭 명조 지문, 첫 줄 들여쓰기, 단·쪽 분할 가능 |
| `statements(..items)` | 보기의 ㄱ·ㄴ·ㄷ 문장을 내어쓰기; 긴 수식도 첫 줄 기준선 공유 |
| `response-section(label: "5지선다형"/"단답형")` | 수학의 15pt 응답 유형 상자 |
| `exam-image(body, width:, caption:)` | native `image(...)`를 가운데 배치하는 분할 방지 블록; 경로는 호출부 기준 |
| `u`, `mark`, `term-box`, `labeled-box` | 밑줄, 표지, 인라인 상자 |
| `display` | Trinity Essence와 같은 `math.display` 함수; 줄 안의 분수·행렬도 본문 크기로 표시 |
| `matrix-style(body, column-gap:, row-gap:)` | Trinity Essence와 같은 행렬 스타일; 기본 열 간격0.8em·행 간격0.3em |
| `math-layout` | `src/math.typ`의 행렬·벡터·연립식 간격 설정 |
| `answer-sheet(title:, subtitle:, items:, columns: 1/2, key-columns: 10)` | A4 정답표와 전체 해설; 계속 쪽 머리말과 전체 쪽수 표시 |
| `answer-key(items, columns: 5/10)` | 문항 번호와 정답을 한 셀에서 읽는 정답표 |
| `solution-entry(number, answer, body, points: none)` | 번호·정답·배점, 구분선, 명조 해설을 한 단에 함께 배치 |
| `answer-layout` | 답지 여백·단 사이 간격·문단과 문항 간격·구분선의 공용 설정 |
| `print-geometry` | A4 문제지의 물리 여백·단간·머리말·쪽번호 위치 |

본문에 Typst content와 일반 문자열을 모두 쓸 수 있다. 문자열을 임의 코드로 `eval`하지 않으므로 수식과 밑줄은 `$...$`, `#u[...]` 등의 **content**로 작성한다. 단/쪽을 직접 나누려면 `#colbreak()`를 사용한다. `columns` 안에서 `#pagebreak()`는 Typst가 지원하지 않는다. 두 단 뒤에 다시 `#colbreak()`를 쓰면 다음 쪽으로 넘어간다.

분수와 행렬이 있는 인라인 수식은 Trinity Essence 원고처럼 `display`로 감싼다. 등식 전체에 같은 스타일을 적용하여 양변의 분수 크기를 맞춘다. 블록 수식 `$ ... $`는 이미 display 스타일이다.

```typ
#import "src/lib.typ": display

$display(1 / (1 + 1/x) = x / (x + 1))$이다.
$display(A mat(2; 3) = mat(7/2; 13/3))$이다.
```

`mat`, `vec`, `cases`에는 display와 구조 간격이 자동 적용된다. 행렬 성분이나 연립식의 행 안에 들어간 분수는 그 분수도 `display`로 감싼다. Typst의 구조 내부는 자체 수식 스타일을 사용하므로 바깥의 display만으로 내부 분수 크기가 통일되지 않는다. 등호·조건은 `&`로 정렬하고, 증강행렬은 native `augment` 옵션을 사용한다. 함수의 한국어 조건에는 중앙 math 글꼴 설정의 명조 fallback이 적용된다.

```typ
$display(A = mat(1, display(1/2); -1, sqrt(2)))$
$display(cases(x + y &= 3, display(x/2) - display(y/3) &= 1))$
$ f(t) = cases(display(1/(1+t^2)) & (t < 0), sqrt(1+t) & (t >= 0)) $
$ mat(1, 1, 3; 1, -1, 1; augment: #2) $
```

넓은 행렬·연립식 선지는1·2열, 좁은 열벡터는5열을 사용한다. 폭이 부족한 식을 임의로 축소하지 않고 선지 열 수를 조정한다. [행렬 문서](https://typst.app/docs/reference/math/mat/)와 [연립·조건식 문서](https://typst.app/docs/reference/math/cases/)의 native 옵션을 그대로 쓸 수 있다.

전역 폰트 변경은 `fonts.typ`의 `fonts`를 편집한다. 함수의 `font-config:`는 해당 함수의 역할 설정만 교체하는 국소 override다. 사용자 함수 안에서 호출하는 자식 컴포넌트도 같은 override를 사용하려면 각각 전달한다.

답지에는 `fonts.typ`의 `answer-fonts`를 사용한다. 본문과 정답은 **Bookk Myungjo Light**, 제목·문항 번호·라벨·배점은 **Toss Product Sans**이며, 수식은 같은 크기의 Latin Modern Math이다. 본문·수식은10.5pt, 문항 번호12pt, 정답 라벨·정답표10pt이다. 서체·굵기·크기를 각각 `font-profiles.answers`, `answer-weights`, `sizes`에서 관리하며, `sizes.answer-body`로 답지 본문 크기를 원본 문제지와 독립적으로 조절한다.

답지의 `items`에는 `(number: 1, answer: 3, points: 2, explanation: [...])` 같은 dictionary를 넣는다. `points`는 생략할 수 있으며, 정답의 정수 1–5는 원문자 객관식 번호로 표시한다. 단답형은 `answer: [$195$]`처럼 content로 넣는다. `theme: answer-layout + (entry-gap: 1.2em,)`처럼 답지 간격을 한 곳에서 변경할 수 있다.

```typ
#import "src/lib.typ": answer-sheet, display

#answer-sheet(
  title: [정답과 해설],
  items: (
    (number: 1, answer: 3, points: 2, explanation: [
      전체 경우를 같은 기준으로 세면 다음과 같다.
      $ display(3/5 + 1/5 = 4/5) $
      따라서 정답은 ③이다.
    ]),
    (number: 2, answer: [$195$], explanation: [조건을 만족하는 정수는 $195$이다.]),
  ),
)
```

전체 답지는 기본 2단이고 `columns: 1`로 바꿀 수 있다. 문항 사이에 여유를 두고 문항 전체를 같은 단에 유지한다. 긴 등식은 본문 크기의 별도 수식 줄로, 기대값처럼 여러 단계인 계산은 `&`와 `\\`로 정렬해 작성한다. 내용과 열 수에 따라 쪽수가 자연스럽게 늘어난다.

## 국어 자료 컴포넌트

`exam(typography: "korean", layout: "standard", subject: none)`에서 다음 20개 함수를 조합한다. 지문·발화·주석·보기 안의 인용문은 명조이며, 안내·화자·자료 라벨은 중앙 글꼴 역할을 따른다.

| API | 작성과 배치 |
| --- | --- |
| `instruction(from, to:, body:)` | 문항 범위와 안내를 다음 자료에 붙임 |
| `passage-heading(label, alignment:)` | (가)/(나) 등 지문 라벨을 뒤 본문에 붙임 |
| `framed-passage(body, height: auto)` | 긴 지문의 연속 프레임; 중간 단·쪽에는 좌우 선만 유지. 고정 높이는 분할하지 않는 좌표 대조용 |
| `passage-sections(sections)` | `(label: [...], body: [...])` tuple을 한 프레임에 배치; `label` 생략 가능 |
| `paired-passage(ga, na)` | (가)/(나) 두 지문과 프레임을 함께 작성 |
| `verse(stanzas, keep-stanzas:)` | 행 tuple의 tuple로 행·연 보존; 긴 행은 내어쓰기 |
| `source-line(author, title)` | 오른쪽 출처; 제목에 `「 」` 자동 부착 |
| `passage-notes(items)` | `(term: [...], body: [...])` tuple의 작은 어휘 풀이 |
| `excerpt-gap(label:)` | 가운데 생략 표시; 기본 `[중략]` |
| `marked-range(label, body, side:, label-align:, keep:)` | `left`/`right` 범위 괄호와 라벨, 본문 폭 확보 |
| `synopsis(body)` | 앞부분 줄거리 라벨과 설명 |
| `dialogue(turns, speaker-width:, hanging-indent:, speaker-size:, gap:)` | `(speaker: [...], body: [...])` tuple; 화자 칸과 후속 줄 들여쓰기를 각각 조절 |
| `stage-direction(body)` | 화자 없는 독립 무대지시문 |
| `draft(body, title:)` | 제목이 있는 초고 프레임; `title: none`으로 제목 생략 |
| `editor-note(label, body)` | 수정 지시 라벨과 내어쓴 설명 |
| `writing-plan(stages, direction:)` | `(title: [...], body: [...])` 1–4단계; `"auto"`/`"row"`/`"column"` 방향 |
| `media-window(body, title:, toolbar:, caption:)` | 흑백 자료 화면, 도구 영역과 캡션 |
| `media-post(author, body, time:)` | 게시글·댓글의 작성자와 본문 |
| `reading-set(from:, to:, lead:, sections:, questions:, gap:)` | 안내·지문·문항을 자연스러운 단 흐름에 배치; `questions`는 문항 content의 tuple |
| `quotation(body, height:)` | `<보기>` 안의 명조 인용 상자; 짧은 인용문 전체 유지 |

`passage-sections`·`paired-passage`에는 프레임이 이미 포함되어 있다. `framed-passage`로 다시 감싸면 테두리와 안쪽 여백이 중복된다. `verse`·`marked-range`의 기본 `auto`는 짧은 연·범위를 함께 유지하고 긴 내용은 단·쪽에서 나눈다. `keep-stanzas: false`·`keep: false`로 분할을 허용할 수 있다. 긴 범위의 라벨은 첫 조각에 놓이며, `source-line`의 제목에는 괄호 없는 이름만 전달한다.

| 중앙 설정 | 조절 대상 |
| --- | --- |
| `fonts.typ`의 `korean-instruction`·`korean-speaker`·`korean-section` | 안내·화자·지문 라벨의 가족; 안내·라벨 크기는 `sizes.body`/`print-body`, 화자는 `sizes.korean-speaker`/`print-korean-speaker` |
| `korean-layout` | 프레임 여백·선, 안내 간격, 연·출처·주석 간격, 범위 표지 폭과 함께 유지할 높이 |
| `korean-material-layout` | 화자 간격, 초고 제목, 개요 카드, 매체 패널 여백·선 |
| `quotation-layout`·`korean-view-title` | 보기 내부 인용 상자와 국어 보기 제목의 기하 |
| `korean-reference-geometry` | 원본·축소판의 국어 머리말·쪽번호·중앙선 좌표; A4 전용 판면은 `print-geometry` |

자료와 문항을 함께 쓰는 예시는 다음과 같다. `reading-set`은 지문 뒤의 남은 공간부터 문항을 이어 놓으며, 문항 자체는 나누지 않는다.

```typ
#import "src/lib.typ": *
#show: exam.with(typography: "korean", layout: "standard", subject: none, paper: "a4")

#reading-set(
  from: 1,
  sections: (
    (label: [(가)], body: [청크의 저장 여부와 현재 갱신 여부를 구별해야 실험을 비교할 수 있다.]),
    (label: [(나)], body: [
      #verse((([지도에 남은 한 칸], [그 안의 밤은 아직 움직이지 않는다]),))
      #source-line([창작], [한 칸])
    ]),
  ),
  questions: (
    question(1, [두 자료의 공통된 관점으로 적절한 것은?], body: [
      #choices([저장과 갱신을 구별한다.], [모든 청크가 늘 갱신된다.],
        [지도만으로 시간을 잰다.], [밤에는 기록을 지운다.], [저장된 공간은 사라진다.])
    ]),
  ),
)
```

대화의 자동 화자 폭은 가장 긴 이름을 기준으로 한다. 원고의 특정 내어쓰기를 재현하려면 `speaker-width`와 `hanging-indent`를 별도로 지정한다. 보기 안에 인용 상자가 필요한 경우도 같은 본문 글꼴을 사용한다.

```typ
#view[
  #dialogue((
    (speaker: [학생], body: [저장된 청크라면 작물도 지금 자라고 있을까요?]),
    (speaker: [연구자], body: [아래 기록의 두 상태를 먼저 구별해 보세요.]),
  ), speaker-width: 3.3em, hanging-indent: 1.65em)
  #quotation[저장 여부는 공간의 기록이고, 갱신 여부는 현재의 처리 상태이다.]
]
```

원본과 축소판의 정밀 기하 보정은 읽기 크기로 다시 조판하는 `paper: "a4"`와 분리되어 있다. A4 전용판은 같은 창작 원고를 자연스럽게 배치한다.

## A4 인쇄판

`exam(paper: "a4")`는210×297mm 용지에 직접 조판한다. 본문·발문·자료·보기·선지는10.5pt,
표는9pt이며, 수식도 본문 크기의 Trinity `display`와 높이 보정을 사용한다.
서체는 평가원 계열의 공용 profile을 유지하고, 인쇄판 크기는 `fonts.typ`의 `sizes.print-*`,
판면은 `theme.typ`의 `print-geometry`에서 조정한다. 좌우15mm·단간7mm로 두 단의 폭은각86.5mm다.

마인크래프트는 `minecraft-paper(flow: "continuous")`로20문항을 순서대로 배치한다.
원본의 쪽당5문항·수동 단 나눔 대신 문항 전체를 유지하며, 현재 A4판은6쪽이다.
문항과 마지막 확인 사항의 실제 높이를 재어 가능한 최소 쪽수를 먼저 정하고, 같은 쪽수 안에서
좌우 단의 높이와 남는 공간을 함께 비교한다. 문항 번호별 단 나눔을 하드코딩하지 않는다.
짧은 수·단위와 단일 분수 선지는5열로, 좌표는3열·세 분수 묶음은2열로 읽는다.
짧은5열 선지는 번호 폭12pt·열 간격3pt로 조정한다. 같은 행의 분수·정수·행렬은
공통 ascent/descent를 사용해 원문자와 수식의 기준선을 맞춘다. 긴 행렬은 넓은 선지 열을 사용한다.
자료와 보기의 안쪽 여백·표 셀 여백·ㄱ·ㄴ 들여쓰기는 `typography.typ`의 A4 프로필에서 관리한다.
짧은 문장 끝 어절과 수·단위를 붙여 읽고, 좌표·범위가 있는 자료는 `justify: false`와
의미 단위 줄바꿈으로 과한 낱말 간격을 피한다. 이 보정은 원본 판형과 축소판에 적용하지 않는다.
`total-pages: auto`를 사용하여내용이 늘어나도 머리말·하단의 전체 쪽수가 실제 출력과 일치한다.
실제크기100%, 한 면에1쪽으로 인쇄한다. 양면일 때는 긴쪽 넘김을 사용한다.

```typ
#import "src/lib.typ": exam
#import "fixtures/minecraft.typ": minecraft-paper, minecraft-notice

#exam(paper: "a4", notice: minecraft-notice)[
  #minecraft-paper(flow: "continuous")
]
```

일반 원고도 `paper: "a4"`에서 같은10.5pt를 사용한다. 고정4쪽 등 수동 페이지 구성을 가져오면
읽기 크기에 따라 실제 쪽수가 달라지므로, 문항을 자연스럽게 이어 쓰고 `total-pages: auto`를 사용한다.
긴 행렬·연립식 선지는1·2열로 쓰며 넓은 표시 수식은 `&`와 `\\`로 정렬한다.
원본 비율을 유지한 축소 출력은 `paper: "a4-scaled"`에서 별도로 선택할 수 있다.

## Story와 예시

41개 story·66개 SVG snapshot이다. 기존 시험지·문항·수식·이미지·과목별 조판·해설 32개에 국어 자료 8개와 첫 쪽 픽셀 기준판 1개를 더했다. 수식 story는 키 큰 인라인 수식, 표시 수식과 정렬, 수식 자료와 보기, 키 큰 수식 선지, 단과 쪽 경계 수식, 전체 수식 검증 시험지로 구성된다. `subjects.stories.typ`은 세 과목 profile 비교·국어형 지문·수학형 응답 구분을 실제 시험 판면에 놓는다.

`stories/korean.stories.typ`은 비교 독서·운문과 풀이·극·개요와 초고·매체 화면·양쪽 범위 괄호·창작 10문항을 원본/A4에서 비교한다. 범위 괄호는 좌우를 바꿀 수 있다. `stories/korean-pixel.stories.typ`은 원본과 A4 축소판의 고정 좌표 대조용이다. 국어 검증은 26변형·직접 출력 2개·경계 검사 7개, 총 35개 PDF/52쪽을 확인했다. A4 창작 문제지는 4쪽, 원본은 3쪽이며 동일 설정의 story와 직접 PDF는 픽셀 차이가 없고, 진단 오류와 용지 밖 글리프도 없었다.

`fixtures/minecraft.typ`의 20문항·50점 내용을 `sample.typ`과 시험지 story가 공유한다. **Java Edition 1.21.1 바닐라**를 기준으로 실제 구현과 제작법을 확인했다. 혼합 스택의 신호 역산, 넘침 보호 분류기, 잠금과 펄스 연장, 쿨다운, 작물의 흡수 전이행렬, 연료·제작 정수 최적화, 양조 배치, 경험치, 조건부 확률, 음수 좌표와 생성 거리를 다룬다. 필요한 게임 규칙과 실험 조건은 문항 자료에 명시한다. 검산 및 공식 파일 출처는 [MINECRAFT-SOURCES.md](MINECRAFT-SOURCES.md)에 있다.

숨은 정답·해설을 `fixtures/minecraft-answers.typ`에서 읽어 정답표와 20문항 전체 해설을 담은 A4 PDF를 만든다. `answers.typ`과 `stories/answers.stories.typ`은 같은 `answer-sheet`를 사용하며, 해설의 분수 등식에도 `display`를 적용한다. 현재 기본 2단 답지는 3쪽, 1단은 5쪽이다. 본문10.5pt·leading0.55em을 유지하면서 좌우16mm·위아래18mm·단간8mm를 사용한다. 문단 간격0.55em·표시 수식 상하0.4em이며, 짧은 등식과 수·단위, 표시 수식 직전의 끝 어절을 묶어 읽는다. 답지 story에서는 전체 1단·2단, 정답표 5열·10열, 계산이 긴 개별 해설 6개를 비교할 수 있다. 문제지에는 해설이 렌더되지 않는다. 원본 판형 문제지 각 쪽은 5문항이고, 첫 쪽은 왼쪽 2문항/오른쪽 3문항, 계속 쪽은 왼쪽 3문항/오른쪽 2문항이다. 긴 자료·행렬·이미지까지 포함하면서 원본 판면의 단폭·폰트 크기를 유지한다.

`assets/minecraft/`의 흑백 PNG 두 장은 내장 이미지 생성 도구로 제작했다. 7번의 자동 제련 장치와 14번의 양조기에 사용하며, [PROMPTS.md](assets/minecraft/PROMPTS.md)에 원문 프롬프트를 보존했다. 그림은 외형 삽화이고 전송·연료·양조 조건은 자료의 글과 표로 정한다. `stories/images.stories.typ`에서 두 이미지·폭 45/60/80%·자료/보기·수능/A4를 바꿀 수 있다. `fixtures/block-diagrams.typ`의 벡터 도형은 독립적인 컴포넌트 예시로 유지한다.

`fixtures/math-stress.typ`은 중첩 분수·근호·첨자, 합·곱·적분의 상하한, 행렬·조건식·연립식·여러 줄 정렬식을 본문·자료·보기·표·선지에 넣는다. 원본 판형과 A4 축소본의 1·2·3·5열 선지를 포함한 10변형을 PDF로 검증했다. A4 전용 조판에서도 수식·행렬·연립식과 경계를 별도로 검증한다. 경계 story는 문항을 수동으로 나누지 않고 다음 단과 다음 쪽으로 넘기는지 확인한다. 이 fixture는 수식 조판 검사이므로 고교 출제 범위와 독립적이다.

`fixtures/math-structures.typ`은2×2·3×3·2×3 행렬, 행·열벡터, 증강행렬,2·3행 연립방정식·해, 연립부등식, 한국어 조건이 있는 구간별 함수와 여러 줄 행렬 등식을 검증한다. 본문·자료·보기·표·1·2·5열 선지와 실제 단·쪽 이동을 포함한다. `structures-sample.typ`과 전체 구조 수식 story가 같은 fixture를 사용한다. 원본 판형의 자료 본문11.5pt를 적용한 구조 수식 검증지는5쪽이며, 일반 수식 검증지는4쪽이다. 세 과목 profile에서 두 fixture를 각각 native PDF로 확인했다.

`src/math.typ`은 키 큰 인라인 수식의 **글리프 bounds와 실제 descent**를 측정하여 기준선 위아래의 공간을 확보한다. 폰트의 ascender/descender로 측정하면 중첩 분수의 일부 높이가 빠지고, 수식 높이의 절반으로 기준선을 추정하면 위첨자·아래첨자·비대칭 상하한의 공간 배분이 틀어진다. 같은 bounds·leading0 설정으로 전체 높이와 기준선 아래 높이를 각각 재어 보이지 않는 strut를 추가한다. 일반적인 `$x$`는 그대로 두고 필요한 줄만 늘린다. `preview.typ`에서는 장평과 이 보정을 끄고, 각 렌더 단위에서 한 번만 적용하여 story PDF와 직접 PDF가 같게 한다.

## 원본과 재현 범위

2026학년도 6월 모의평가 사회·문화 PDF로 기본 판면을 측정한 뒤, 국어·수학·물리학Ⅰ·화학Ⅰ의 실제 텍스트 객체·text matrix·선분·래스터로 과목별 차이를 재측정했다. 다운로드 출처·측정표·해시는 [REFERENCE.md](REFERENCE.md)에 있다.

판형은 내려받은 평가원 **PDF의 MediaBox**이며, 실물 인쇄물의 재단 규격과 다르다. 헤더·단폭·구분선·응시자란·쪽수 상자의 위치는 원본 좌표를 사용한다. 글꼴은 원본에 임베드된 비공개 서체와 같은 계열의 보유 SM/HY 파일을 사용하므로 완전한 픽셀 동일성까지 보장하지 않는다. 마인크래프트 문항의 길이·표·그림은 창작 예시다.

Typst의 `text(stretch:)`는 정적 글꼴을 실제로 압축하지 않는다. 본문은 문단을 원래 폭의 1/0.95로 조판한 뒤 가로만 95%로 축소하고, 머리말도 역할별 실제 비율로 축소한다. 글자 높이와 행간은 유지한다. 자료 상자와 표는 자체 폰트 크기와 행간을 사용한다. 원본 사회·문화 자료 상자의 고딕과 달리, 이 템플릿의 내부 본문은 사용자 요청에 따라 serif로 통일했다.

2026-10-08 보정에서는 동일한 머리말을 300dpi로 렌더해 실제 검은 픽셀의 외곽을 비교했다. 주요 머리말·입력란·쪽번호 외곽은 1픽셀 이내, 본문 가로 위치는 0.001pt 미만 오차로 맞췄다. 작은 폰트 외곽 차이는 남는다. 수치와 검증 범위는 [REFERENCE.md](REFERENCE.md)에 기록했다.
