// Shared setup for every story. Export `preview` and apply set/show inside it —
// bare top-level `#set` in this file does not affect story content.

#let sans = ("Toss Product Sans", "sans-serif")
#let serif = ("Bookk Myungjo", "Times New Roman")

#let preview(body) = {
  set text(lang: "ko", size: 11pt, font: serif)
  set par(justify: true)
  body
}
