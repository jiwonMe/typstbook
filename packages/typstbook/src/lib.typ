#let _stories = state("typstbook.stories", ())

#let decode-args(raw) = json(bytes(raw))

/// Turn markup-control string args into content via `eval(..., mode: "markup")`.
#let coerce-args(args, arg-types) = {
  let out = (:)
  for key in args.keys() {
    let value = args.at(key)
    let meta = if key in arg-types { arg-types.at(key) } else { (:) }
    let control = if type(meta) == dictionary { meta.at("control", default: none) } else { none }
    if control == "markup" and type(value) == str {
      out.insert(key, eval(value, mode: "markup"))
    } else {
      out.insert(key, value)
    }
  }
  out
}

#let story(
  title: none,
  description: none,
  args: (:),
  arg-types: (:),
  page: none,
  checks: none,
  render: none,
) = {
  assert(title != none, message: "typstbook: story title is required")
  assert(
    description == none or type(description) == str,
    message: "typstbook: story description must be a string",
  )
  assert(
    checks == none or type(checks) == dictionary,
    message: "typstbook: story checks must be a dictionary",
  )
  _stories.update(arr => {
    arr + ((
      title: title,
      description: description,
      args: args,
      arg-types: arg-types,
      page: page,
      checks: checks,
      render: render,
    ),)
  })
}

#let emit-stories() = context {
  for s in _stories.final() {
    [#metadata((
      title: s.title,
      description: s.description,
      args: s.args,
      arg-types: s.arg-types,
      page: s.page,
      checks: s.checks,
      has-render: s.render != none,
    )) <typstbook-story>]
  }
}

/// Turn `"210mm"` from JSON into a length. Named fields such as `paper` stay strings.
#let length-of(value) = {
  if type(value) != str {
    return value
  }
  let matched = value.match(regex("^([0-9]+(?:\.[0-9]+)?)(pt|mm|cm|in|em)$"))
  if matched == none {
    return value
  }
  let amount = float(matched.captures.at(0))
  let unit = matched.captures.at(1)
  if unit == "mm" { amount * 1mm }
  else if unit == "cm" { amount * 1cm }
  else if unit == "in" { amount * 1in }
  else if unit == "em" { amount * 1em }
  else { amount * 1pt }
}

#let coerce-viewport(viewport) = {
  if viewport == none {
    return none
  }
  let out = (:)
  for key in viewport.keys() {
    let value = viewport.at(key)
    if key == "width" or key == "height" or key == "margin" {
      out.insert(key, length-of(value))
    } else {
      out.insert(key, value)
    }
  }
  out
}

/// Story `page` merged with a preview viewport. An explicit paper drops width/height, and a custom size drops `paper`.
#let apply-viewport(spec, viewport) = {
  let next = coerce-viewport(viewport)
  if next == none {
    spec
  } else if spec == none {
    next
  } else {
    let drop = if "paper" in next {
      ("width", "height")
    } else if "width" in next or "height" in next {
      ("paper",)
    } else {
      ()
    }
    let base = (:)
    for key in spec.keys() {
      if key not in next and key not in drop {
        base.insert(key, spec.at(key))
      }
    }
    base + next
  }
}

#let render-story(title, args, viewport: none) = context {
  let found = _stories.final().find(s => s.title == title)
  if found == none {
    panic("typstbook: story not found: " + title)
  }
  if found.render == none {
    panic("typstbook: story has no render: " + title)
  }
  // Live overrides win; story defaults fill keys the caller omitted.
  let merged = found.args + args
  let coerced = coerce-args(merged, found.arg-types)
  let body = (found.render)(coerced)
  let spec = apply-viewport(found.page, viewport)
  if spec != none {
    page(..spec, body)
  } else {
    body
  }
}
