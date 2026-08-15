// Shared setup for every story. Export `preview` and apply set/show inside it —
// bare top-level `#set` in this file does not affect story content.

#let preview(body) = {
  set text(lang: "ko", size: 11pt, font: ("Bookk Myungjo",))
  set par(justify: true)
  body
}
