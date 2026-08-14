#let _stories = state("typstbook.stories", ())

#let decode-args(raw) = json(bytes(raw))

#let story(
  title: none,
  args: (:),
  arg-types: (:),
  page: none,
  render: none,
) = {
  assert(title != none, message: "typstbook: story title is required")
  _stories.update(arr => {
    arr + ((
      title: title,
      args: args,
      arg-types: arg-types,
      page: page,
      render: render,
    ),)
  })
}

#let emit-stories() = context {
  for s in _stories.final() {
    [#metadata((
      title: s.title,
      args: s.args,
      arg-types: s.arg-types,
      page: s.page,
      has-render: s.render != none,
    )) <typstbook-story>]
  }
}

#let render-story(title, args) = context {
  let found = _stories.final().find(s => s.title == title)
  if found == none {
    panic("typstbook: story not found: " + title)
  }
  if found.render == none {
    panic("typstbook: story has no render: " + title)
  }
  if found.page != none {
    set page(..found.page)
  }
  (found.render)(args)
}
