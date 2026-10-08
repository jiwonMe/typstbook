// Plan whole question blocks in reading order. Heights and costs use points;
// the first two columns may have less room than the continuing pages.
#let _question-flow-plan(heights, gap, first-height, height) = {
  let count = heights.len()
  if count == 0 { return (ends: (), pages: 0, cost: 0) }
  if (gap < 0 or first-height <= 0 or height <= 0
    or heights.any(value => value <= 0 or value > calc.max(first-height, height))) {
    return none
  }

  let sums = (0,)
  for value in heights { sums.push(sums.last() + value) }
  let used(start, end) = (sums.at(end) - sums.at(start)
    + calc.max(0, end - start - 1) * gap)
  let page-cost(left, right, capacity) = {
    // Balance the two columns while leaving similar reading space below them.
    (calc.pow(left - right, 2)
      + 0.35 * (calc.pow(capacity - left, 2) + calc.pow(capacity - right, 2))
      + if right == 0 { 2 * calc.pow(capacity, 2) } else { 0 })
  }

  let previous = (none,) * (count + 1)
  previous.at(0) = (cost: 0, ends: ())
  for page in range(count) {
    let capacity = if page == 0 { first-height } else { height }
    let next = (none,) * (count + 1)
    for start in range(count) {
      let prefix = previous.at(start)
      if prefix == none { continue }
      for middle in range(start + 1, count + 1) {
        let left = used(start, middle)
        if left > capacity { break }
        // Only the final right column may be empty. Its penalty favors a
        // populated pair whenever another plan uses the same page count.
        let first-end = if middle == count { middle } else { middle + 1 }
        for end in range(first-end, count + 1) {
          let right = used(middle, end)
          if right > capacity { break }
          let cost = prefix.cost + page-cost(left, right, capacity)
          let incumbent = next.at(end)
          if incumbent == none or cost < incumbent.cost {
            next.at(end) = (cost: cost, ends: prefix.ends + (middle, end))
          }
        }
      }
    }
    // The first reachable complete plan gives the minimum number of pages.
    // All plans at that page count have already competed on their balance.
    if next.at(count) != none {
      return (..next.at(count), pages: page + 1)
    }
    previous = next
  }
  none
}

#let _ordered-question-flow(items, gap) = {
  for (index, item) in items.enumerate() {
    if index > 0 { v(gap) }
    item
  }
}

// Call inside the exam's two-column container, with its physical column width
// and usable heights. Bundle any final notice with the last question in items.
// Invalid dimensions or blocks too tall to plan retain ordinary ordered flow.
#let balanced-question-flow(
  items, gap: 1.2em, first-height: auto, height: auto, width: auto,
) = context {
  let values = if type(items) == array { items } else { (items,) }
  let valid = (type(gap) == length and type(first-height) == length
    and type(height) == length and type(width) == length
    and gap >= 0pt and first-height > 0pt and height > 0pt and width > 0pt
    and values.all(item => type(item) == content))
  if not valid {
    _ordered-question-flow(values, if type(gap) == length and gap >= 0pt { gap } else { 1.2em })
  } else if values.len() > 0 {
    let whole(item) = block(width: width, breakable: false,
      above: 0pt, below: 0pt, item)
    let heights = values.map(item => measure(whole(item)).height / 1pt)
    let plan = _question-flow-plan(heights, gap.to-absolute() / 1pt,
      first-height.to-absolute() / 1pt, height.to-absolute() / 1pt)
    if plan == none {
      _ordered-question-flow(values, gap)
    } else {
      let start = 0
      for (column, end) in plan.ends.enumerate() {
        if end > start {
          if column > 0 { colbreak() }
          for index in range(start, end) {
            if index > start { v(gap) }
            whole(values.at(index))
          }
        }
        start = end
      }
    }
  }
}
