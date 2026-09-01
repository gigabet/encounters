// lib/formula.ts
//
// Evaluates the tiny expression language used inside `$formula:...$` tokens
// — things like "12 + floor(level / 2)" for trap DCs that scale smoothly
// with party level instead of jumping between 4 tier values. Deliberately
// not `eval`/`Function`: this only ever parses `+ - * / ( )`, numbers, the
// `level` variable, and a `floor()` call, so a typo in the YAML fails loud
// instead of running arbitrary JS.

export function evalFormula(expr: string, level: number): number {
  const s = expr.replace(/\s+/g, '')
  let i = 0

  const peek = () => s[i]
  const fail = (msg: string): never => {
    throw new Error(`Bad formula "${expr}": ${msg} at position ${i}`)
  }

  function parseNumber(): number {
    const start = i
    while (i < s.length && /[0-9.]/.test(s[i])) i++
    if (i === start) fail('expected a number')
    return parseFloat(s.slice(start, i))
  }

  function parseIdentifier(): string {
    const start = i
    while (i < s.length && /[a-zA-Z]/.test(s[i])) i++
    return s.slice(start, i)
  }

  function parsePrimary(): number {
    if (peek() === '(') {
      i++
      const v = parseExpr()
      if (peek() !== ')') fail('expected ")"')
      i++
      return v
    }
    if (peek() === '-') {
      i++
      return -parsePrimary()
    }
    if (peek() && /[0-9.]/.test(peek())) return parseNumber()
    if (peek() && /[a-zA-Z]/.test(peek())) {
      const id = parseIdentifier()
      if (id === 'level') return level
      if (id === 'floor') {
        if (peek() !== '(') fail('expected "(" after floor')
        i++
        const v = parseExpr()
        if (peek() !== ')') fail('expected ")"')
        i++
        return Math.floor(v)
      }
      fail(`unknown identifier "${id}"`)
    }
    return fail('expected a number, "level", "floor(...)", or "("')
  }

  function parseTerm(): number {
    let v = parsePrimary()
    while (peek() === '*' || peek() === '/') {
      const op = s[i++]
      const rhs = parsePrimary()
      v = op === '*' ? v * rhs : v / rhs
    }
    return v
  }

  function parseExpr(): number {
    let v = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const op = s[i++]
      const rhs = parseTerm()
      v = op === '+' ? v + rhs : v - rhs
    }
    return v
  }

  const result = parseExpr()
  if (i < s.length) fail(`unexpected trailing "${s.slice(i)}"`)
  return result
}
