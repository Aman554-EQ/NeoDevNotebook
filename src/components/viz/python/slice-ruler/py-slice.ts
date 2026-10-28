/**
 * Python's slice semantics (CPython's PySlice_AdjustIndices), so the interactive ruler
 * selects exactly what `s[start:stop:step]` would. null = omitted.
 */
export function sliceIndices(
  length: number,
  start: number | null,
  stop: number | null,
  step: number | null,
): number[] {
  const st = step ?? 1
  if (st === 0) throw new RangeError("slice step cannot be zero")
  const lower = st < 0 ? -1 : 0
  const upper = st < 0 ? length - 1 : length
  const clamp = (v: number | null, dflt: number) => {
    if (v === null) return dflt
    if (v < 0) return Math.max(v + length, lower)
    return Math.min(v, upper)
  }
  const a = clamp(start, st < 0 ? upper : lower)
  const b = clamp(stop, st < 0 ? lower : upper)
  const out: number[] = []
  for (let i = a; st > 0 ? i < b : i > b; i += st) out.push(i)
  return out
}

export function pySlice(s: string, start: number | null, stop: number | null, step: number | null) {
  return sliceIndices(s.length, start, stop, step)
    .map((i) => s[i])
    .join("")
}
