# kice-general

평가원 시험지 PDF의 판면을 기준으로 만든 과목 공용 Typst 템플릿이다. `kice-korean`의 Typst-native story 구조를 따르며, 탐구형 첫 쪽과 공통 영역형 첫 쪽을 지원한다. 예시는 실제 수능에 없는 **마인크래프트** 영역이다.

## 실행

typstbook 저장소 루트에서 실행한다. 설치된 Typst 0.15.1과 저장소의 Node 의존성을 사용한다.

```sh
node examples/kice-general/workbench.mjs dev
node examples/kice-general/workbench.mjs pdf
node examples/kice-general/workbench.mjs pdf:math
node examples/kice-general/workbench.mjs pdf:structures
node examples/kice-general/workbench.mjs pdf:answers
node examples/kice-general/workbench.mjs test
# 의도한 디자인 변경 후 baseline 갱신
node examples/kice-general/workbench.mjs test --update
```

`pnpm dev:kice-general`, `pnpm pdf:kice-general`, `pnpm test:kice-general`도 같은 명령이다. 기본 PDF는 `dist/minecraft.pdf`, 정답·해설은 `dist/minecraft-answers.pdf`, 수식 검증 PDF는 `dist/math-stress.pdf`, 행렬·연립식 검증 PDF는 `dist/math-structures.pdf`에 나온다. `build --out <경로>`는 기존 typstbook의 정적 story 빌드를 사용한다.

## 폰트는 한 곳에서 관리

모든 글꼴 패밀리와 역할별 기준 크기는 **`src/fonts.typ`**에만 있다. `font-profiles.kice`의 역할별 가족과 `sizes`를 수정하면 시험지와 모든 컴포넌트·story에 함께 반영된다. 본문·발문·자료·표·영역명·시험명·문항 번호·선지 번호·수식·안내문을 각각 지정할 수 있다. 자료 설명과 `<보기>` 내부 본문은 serif이다. 표의 글꼴·크기는 원본처럼 별도 역할을 사용한다. 사용하는 원본 폰트9개는 패키지의 `fonts/`에 포함했다. 파일별 출처는 [fonts/NOTICE.md](fonts/NOTICE.md), SHA256은 [fonts/manifest.json](fonts/manifest.json)에 기록했다.

과목별 조판 차이는 `src/typography.typ`의 `science`·`math`·`korean`에 있다. `exam(typography: "science")`가 기본이다. 과학탐구는 11.5pt 명조 설명과 10pt 고딕 표, 수학은 11.48pt 명조·넓은 조건/보기 행간·모든 배점 표시, 국어는 11.5pt 명조·약18.38pt 행간·긴 선지의 후속 줄 들여쓰기를 사용한다. 수학·국어의 문항번호는95%, 과학탐구는100% 장평이다. `layout`은 머리말 구성, `typography`는 본문 조판으로 각각 지정한다. 과목별 원본 측정값은 [REFERENCE.md](REFERENCE.md)에 있다.

launcher는 아래 순서로 폰트 디렉터리를 찾고 `TYPST_FONT_PATHS`를 설정한다. 추출, SVG 미리보기, PDF 다운로드에 같은 경로가 적용된다.

1. 환경 변수 `KICE_GENERAL_FONT_DIR`
2. 패키지에 포함된 `fonts/` 디렉터리
3. 현재 작업공간의 형제 저장소 `trinity-press/templates/kice-suneung/fonts`

기존 `TYPST_FONT_PATHS`도 보존한다. launcher를 사용하면 다른 저장소의 폰트 경로 없이 포함된 서체로 실행할 수 있다. 폰트를 교체하려면 `fonts.typ`의 `#let fonts = font-profiles.portable`로 바꾸고 Bookk Myungjo·Pretendard를 설치한다. 두 profile은 글리프 모양과 폭이 달라 snapshot을 별도로 갱신해야 한다. 원본 서체를 포함했으므로 공용 CI의 `test:snapshots`에도 이 예제를 추가했다.

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
| `paper: "a4"` | 같은 구성의 A4 축소 판면; 긴 내용은 별도 페이지 조정 가능 |
| `selected: false` | 탐구형의 선택란만 생략 |
| `form: [홀수형]` | 형 표시; 기본 `none` |
| `first-page: false`, `page-offset: 1` | 2쪽처럼 첫 쪽 정보란 없이 시작 |
| `total-pages: auto` | 실제 문서의 최종 쪽수; 명시 정수도 가능 |
| `booklet-offset: 16, booklet-pages: 36` | 위쪽 과목 쪽수 1, 아래쪽 합본 쪽수 17/36 |
| `tab-label: none` | 첫 쪽 바깥 회색 세로 과목 탭 숨김; 문자열로 별도 지정 가능 |
| `notice: [...]` | 아래 안내문 교체; 기본은 비공식 창작 예시 표시 |
| `question(number, prompt, points:, body:)` | 문항을 단/쪽 중간에서 나누지 않음; 탐구의 기본 2점은 생략 |
| `show-points: true/false` | 문항 배점의 강제 표시/생략 |
| `choices(columns: 1/2/3/5, ..items)` | 정확히 다섯 선지; 행 순서로 배열하고 긴 선지는 내어쓰기 |
| `material(body, title: none)` | serif 자료 상자 |
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

## Story와 예시

29개 story: 시험지·문항·선지·자료 13개, 키 큰 수식 6개, 행렬·연립식 5개, 비트맵 이미지 1개, 과목별 조판 3개, 정답과 해설 1개이다. 수식 story는 키 큰 인라인 수식, 표시 수식과 정렬, 수식 자료와 보기, 키 큰 수식 선지, 단과 쪽 경계 수식, 전체 수식 검증 시험지로 구성된다. `subjects.stories.typ`은 세 과목 profile 비교·국어형 지문·수학형 응답 구분을 실제 시험 판면에 놓는다.

`fixtures/minecraft.typ`의 20문항·50점 내용을 `sample.typ`과 시험지 story가 공유한다. **Java Edition 1.21.1 바닐라**를 기준으로 실제 구현과 제작법을 확인했다. 혼합 스택의 신호 역산, 넘침 보호 분류기, 잠금과 펄스 연장, 쿨다운, 작물의 흡수 전이행렬, 연료·제작 정수 최적화, 양조 배치, 경험치, 조건부 확률, 음수 좌표와 생성 거리를 다룬다. 필요한 게임 규칙과 실험 조건은 문항 자료에 명시한다. 검산 및 공식 파일 출처는 [MINECRAFT-SOURCES.md](MINECRAFT-SOURCES.md)에 있다.

숨은 정답·해설을 `fixtures/minecraft-answers.typ`에서 읽어 정답표와 20문항 전체 해설을 담은 A4 2쪽 PDF를 만든다. `answers.typ`과 `stories/answers.stories.typ`은 같은 함수를 사용하며, 해설의 분수 등식에도 `display`를 적용한다. 문제지에는 해설이 렌더되지 않는다. 문제지 각 쪽은 5문항이고, 첫 쪽은 왼쪽 2문항/오른쪽 3문항, 계속 쪽은 왼쪽 3문항/오른쪽 2문항이다. 긴 자료·행렬·이미지까지 포함하면서 원본 판면의 단폭·폰트 크기를 유지한다.

`assets/minecraft/`의 흑백 PNG 두 장은 내장 이미지 생성 도구로 제작했다. 7번의 자동 제련 장치와 14번의 양조기에 사용하며, [PROMPTS.md](assets/minecraft/PROMPTS.md)에 원문 프롬프트를 보존했다. 그림은 외형 삽화이고 전송·연료·양조 조건은 자료의 글과 표로 정한다. `stories/images.stories.typ`에서 두 이미지·폭 45/60/80%·자료/보기·수능/A4를 바꿀 수 있다. `fixtures/block-diagrams.typ`의 벡터 도형은 독립적인 컴포넌트 예시로 유지한다.

`fixtures/math-stress.typ`은 중첩 분수·근호·첨자, 합·곱·적분의 상하한, 행렬·조건식·연립식·여러 줄 정렬식을 본문·자료·보기·표·선지에 넣는다. 1·2·3·5열 선지와 수능/A4를 포함한 10변형을 PDF로 검증했다. 경계 story는 문항을 수동으로 나누지 않고 다음 단과 다음 쪽으로 넘기는지 확인한다. 이 fixture는 수식 조판 검사이므로 고교 출제 범위와 독립적이다.

`fixtures/math-structures.typ`은2×2·3×3·2×3 행렬, 행·열벡터, 증강행렬,2·3행 연립방정식·해, 연립부등식, 한국어 조건이 있는 구간별 함수와 여러 줄 행렬 등식을 검증한다. 본문·자료·보기·표·1·2·5열 선지와 실제 단·쪽 이동을 포함한다. `structures-sample.typ`과 전체 구조 수식 story가 같은 fixture를 사용한다. 현행 자료 본문 11.5pt를 적용한 구조 수식 검증지는 5쪽이며, 일반 수식 검증지는 4쪽이다. 세 과목 profile에서 두 fixture를 각각 native PDF로 확인했다.

`src/math.typ`은 키 큰 인라인 수식의 **글리프 bounds와 실제 descent**를 측정하여 기준선 위아래의 공간을 확보한다. 폰트의 ascender/descender로 측정하면 중첩 분수의 일부 높이가 빠지고, 수식 높이의 절반으로 기준선을 추정하면 위첨자·아래첨자·비대칭 상하한의 공간 배분이 틀어진다. 같은 bounds·leading0 설정으로 전체 높이와 기준선 아래 높이를 각각 재어 보이지 않는 strut를 추가한다. 일반적인 `$x$`는 그대로 두고 필요한 줄만 늘린다. `preview.typ`에서는 장평과 이 보정을 끄고, 각 렌더 단위에서 한 번만 적용하여 story PDF와 직접 PDF가 같게 한다.

## 원본과 재현 범위

2026학년도 6월 모의평가 사회·문화 PDF로 기본 판면을 측정한 뒤, 국어·수학·물리학Ⅰ·화학Ⅰ의 실제 텍스트 객체·text matrix·선분·래스터로 과목별 차이를 재측정했다. 다운로드 출처·측정표·해시는 [REFERENCE.md](REFERENCE.md)에 있다.

판형은 내려받은 평가원 **PDF의 MediaBox**이며, 실물 인쇄물의 재단 규격과 다르다. 헤더·단폭·구분선·응시자란·쪽수 상자의 위치는 원본 좌표를 사용한다. 글꼴은 원본에 임베드된 비공개 서체와 같은 계열의 보유 SM/HY 파일을 사용하므로 완전한 픽셀 동일성까지 보장하지 않는다. 마인크래프트 문항의 길이·표·그림은 창작 예시다.

Typst의 `text(stretch:)`는 정적 글꼴을 실제로 압축하지 않는다. 본문은 문단을 원래 폭의 1/0.95로 조판한 뒤 가로만 95%로 축소하고, 머리말도 역할별 실제 비율로 축소한다. 글자 높이와 행간은 유지한다. 자료 상자와 표는 자체 폰트 크기와 행간을 사용한다. 원본 사회·문화 자료 상자의 고딕과 달리, 이 템플릿의 내부 본문은 사용자 요청에 따라 serif로 통일했다.

2026-10-08 보정에서는 동일한 머리말을 300dpi로 렌더해 실제 검은 픽셀의 외곽을 비교했다. 주요 머리말·입력란·쪽번호 외곽은 1픽셀 이내, 본문 가로 위치는 0.001pt 미만 오차로 맞췄다. 작은 폰트 외곽 차이는 남는다. 수치와 검증 범위는 [REFERENCE.md](REFERENCE.md)에 기록했다.
