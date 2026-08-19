// Shared setup for every story. Export `preview` and apply set/show inside it —
// bare top-level `#set` in this file does not affect story content.

#import "src/lib.typ": serif

#let preview(body) = {
  // exam과 같은 장평/자간. 스토리가 exam을 안 써도 미리보기 글자가 맞도록.
  set text(
    lang: "ko",
    size: 10.5pt,
    font: serif,
    top-edge: "ascender",
    bottom-edge: "descender",
    tracking: -0.05em,
    stretch: 95%,
  )
  set par(justify: true)
  body
}
