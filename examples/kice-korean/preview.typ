// Shared setup for every story. Export `preview` and apply set/show inside it —
// bare top-level `#set` in this file does not affect story content.

#import "src/lib.typ": serif

#let preview(body) = {
  set text(
    lang: "ko",
    size: 10.5pt,
    font: serif,
    top-edge: "ascender",
    bottom-edge: "descender",
  )
  set par(justify: true)
  body
}
