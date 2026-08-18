#import "inline.typ": mark, term-box, u

#let parse-inline(src) = {
  if type(src) != str {
    return src
  }
  let pattern = regex("\{\{([^|{}]+)\|([^}]+)\}\}|<u>(.*?)</u>")
  let pieces = ()
  let rest = src
  let found = rest.match(pattern)
  while found != none {
    if found.start > 0 {
      pieces.push(rest.slice(0, found.start))
    }
    let label = found.captures.at(0)
    let marked = found.captures.at(1)
    let underlined = found.captures.at(2)
    if label != none and label != "" {
      if label == "box" {
        pieces.push(term-box(marked))
      } else {
        pieces.push(mark(label, marked))
      }
    } else {
      pieces.push(u(underlined))
    }
    rest = rest.slice(found.end)
    found = rest.match(pattern)
  }
  if rest != "" {
    pieces.push(rest)
  }
  pieces.join()
}

#let as-content(value) = {
  if type(value) == str {
    parse-inline(value)
  } else {
    value
  }
}

#let as-blocks(value) = {
  let kind = type(value)
  if kind == str {
    value
      .split(regex("\n[ \t]*\n"))
      .map(para => para.trim())
      .filter(para => para != "")
      .map(para => parse-inline(para.replace(regex("\n"), "")))
      .join(parbreak())
  } else if kind == array {
    value.map(item => as-blocks(item)).join(parbreak())
  } else {
    value
  }
}
