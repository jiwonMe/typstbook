#import "../src/lib.typ": exam-image

#let minecraft-image(kind: "smelter", width: 60%, caption: none) = {
  assert(("smelter", "brewing").contains(kind))
  let source = if kind == "smelter" { "../assets/minecraft/automatic-smelter.png" }
    else { "../assets/minecraft/brewing-batch.png" }
  let alt = if kind == "smelter" { "상자에서 호퍼를 통해 일반 화로로 원료를 보내고, 아래 호퍼로 결과물을 상자에 수거하는 제련 장치" }
    else { "세 병을 함께 처리하는 양조기와 별도의 네더 사마귀·블레이즈 가루" }
  exam-image(image(source, width: 100%, alt: alt), width: width, caption: caption)
}
