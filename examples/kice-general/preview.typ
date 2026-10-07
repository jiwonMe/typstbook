#import "src/fonts.typ": body-style
// Base typography only. Each render unit applies compression once: exam() for
// a full sheet, body-style() for a standalone component story. Applying a show
// par transform here would also compress the exam header and body a second time.
#let preview(body) = body-style(body, condense: false, math-adjust: false)
