// Same public function as Trinity Essence's templates/trinity/src/math/lib.typ.
// Authors choose display style explicitly; it keeps an inline equation inline.
#let display = math.display

// Trinity Essence's matrix spacing. Keep the native mat/cases/vec APIs, including
// custom delimiters, alignment points and augmented-matrix rules.
#let math-layout = (
  matrix-column-gap: 0.8em, matrix-row-gap: 0.3em,
  cases-gap: 0.3em, vector-gap: 0.3em,
)

#let matrix-style(body, column-gap: math-layout.matrix-column-gap, row-gap: math-layout.matrix-row-gap) = {
  set math.mat(column-gap: column-gap, row-gap: row-gap)
  show math.mat: it => display(it)
  body
}

#let structure-style(body) = {
  set math.cases(gap: math-layout.cases-gap)
  set math.vec(gap: math-layout.vector-gap)
  show math.cases: it => display(it)
  show math.vec: it => display(it)
  show: matrix-style
  body
}

// Inline equations do not reliably expand Typst's paragraph line box. Reserve
// their measured height with a transparent strut; the equation keeps its math
// baseline and remains selectable text. Measure descent rather than assuming
// symmetry: attachments, radicals and unequal integral limits are asymmetric.
#let math-height(body) = {
  let at-zero(content) = {
    set par(leading: 0pt)
    set text(top-edge: "bounds", bottom-edge: "bounds")
    content
  }
  show math.equation.where(block: false): it => context {
    // Font ascender/descender metrics hide parts of tall inline equations.
    // Glyph bounds expose the numerator, denominator and radical in full.
    let height = measure(at-zero([#it])).height
    if height > 0.7em.to-absolute() {
      let pad = 0.05em.to-absolute()
      // A zero-width box extending 1000pt above the shared baseline isolates
      // the equation's descent. Use the same bounds and leading in both probes.
      let probe = 1000pt
      let descent = measure(at-zero([
        #it#box(width: 0pt, height: probe, baseline: 0pt)
      ])).height - probe
      it + box(width: 0.01pt, height: height + 2 * pad,
        baseline: calc.max(0pt, descent + pad))
    } else { it }
  }
  body
}
