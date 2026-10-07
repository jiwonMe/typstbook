# 포함된 폰트

`src/fonts.typ`의 기본 KICE profile에 필요한 원본 폰트9개와
답지 profile의 Toss Product Sans·Bookk Myungjo 파일3개를 포함한다.
시험지용9개는 기존 작업공간의 `trinity-press/templates/kice-suneung/fonts/`에서 파일 내용의
변경 없이 복사했으며, 파일명만 ASCII로 통일했다. 원래 파일명·크기·SHA256은
[manifest.json](manifest.json)에 기록했다. launcher가 이 디렉터리를
`TYPST_FONT_PATHS`에 등록하므로 별도의 폰트 설치가 필요하지 않다.

| 파일 | 패밀리 | 역할 |
| --- | --- | --- |
| `sm-jmyungjo-regular.otf` | SM JMyungJo Std | 본문·발문·자료·보기 |
| `sm-jgothic-regular.otf` | SM JGothic Std | 탐구 표·국어 지시문 |
| `sm-smyungjo-regular.otf` | SM SMyungJo Std | 라벨·선지 번호 |
| `sm-kmyungjo-regular.otf` | SM KMyungJo Std | 문항·쪽 번호 |
| `sm-dinaru-regular.otf` | SM Dinaru Std | 시험명·응시자 정보란 |
| `sm-tgothic-regular.otf` | SM TGothic Std | 수학 응답 유형 |
| `sin-graphic.ttf` | 신그래픽체 | 영역·과목명 |
| `hy-graphic-m.ttf` | HYGraPhic M | 하단 안내문 |
| `latinmodern-math.otf` | Latin Modern Math | 수식 |
| `toss-product-sans.ttc` | Toss Product Sans | 답지 제목·문항 번호·라벨·배점; 300–900 굵기 |
| `bookk-myungjo-light.ttf` | Bookk Myungjo | 답지 명조 본문·정답; 300 굵기 |
| `bookk-myungjo-bold.ttf` | Bookk Myungjo | 답지 명조 강조; 700 굵기 |

Libertinus Serif 등 기본 fallback은 Typst 컴파일러에 포함된 서체를 사용한다.
선택 가능한 portable profile의 Pretendard는 별도로 설치한다.

## 출처와 권리

답지용 파일3개는 사용자가 보유한 `Library/Fonts/`의 원본을 변경 없이 복사했다.
Toss Product Sans 버전1.6.1의 내부 권리자는 Viva Republica이며,
디자인 표기는 Sandoll Inc. & Leedotype Co., Ltd.이다.
Bookk Myungjo 버전1.2의 내부 권리자는 Bookk Co, Ltd.이며,
제작 표기는 Sandoll Tium Inc., license URL은 `https://Bookk.io/`이다.
이 파일들의 권리는 원본 권리자에게 있으며, 템플릿의 MIT 라이선스를 적용하지 않는다.

SM 파일은 기존 작업공간에서 보유한 직지소프트 SM클래식 OTF이다.
기존 출처 기록은 [직지소프트 SM클래식 목록](https://www.jikjisoft.com/font?0a4374ed-f0ee-47ae-9dcd-a8f182251073=true)을 가리킨다.
폰트 내부 저작권 표기는 JikjiSoft Incorporated이며, 중명조·견출명조는2019년,
다른 포함 SM 서체는1989년으로 기록되어 있다.

HY그래픽M은 기존 출처 기록의 한글마을 KoreaFont WOFF에서 같은 TrueType
데이터를 TTF로 변환한 파일이다. 내부 권리자는 HanYang I&C Co., Ltd.이다.
신그래픽체의 내부 권리자는 Qnix Computer Co., Ltd.이며1992–1995년으로 표기된다.
초기 작업공간의 일부 서체 출처는 [aesthness/workshop_compare](https://github.com/aesthness/workshop_compare)이다.

SM·HY·신그래픽체의 상용 폰트 권리는 각 원본 권리자에게 있다. 포함된 파일의
사용·재배포 조건은 원본 라이선스에 따르며, 템플릿 코드의 MIT 라이선스를
이 폰트 파일에 적용하지 않는다.

Latin Modern Math의 내부 권리자는 B. Jackowski, P. Strzelczyk,
P. Pianowski(TeX 사용자 그룹 대표)이며2012–2014년으로 기록된다.
이 폰트는 GUST Font License를 따른다. 포함된 원문은
[GUST-FONT-LICENSE.txt](GUST-FONT-LICENSE.txt)이며, 공식 원문 출처는
[GUST Font License](https://www.gust.org.pl/projects/e-foundry/licenses/GUST-FONT-LICENSE.txt)이다.
이 라이선스가 참조하는 LPPL은 [LPPL.txt](LPPL.txt)에 함께 둔다.
