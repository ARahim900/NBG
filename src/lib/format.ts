/** Number & label formatting helpers shared across views. */

export const int = (v: number): string => v.toLocaleString('en-US')

export const pct = (v: number, digits = 1): string => `${v.toFixed(digits)}%`

export const signed = (v: number): string =>
  `${v > 0 ? '+' : ''}${v.toLocaleString('en-US')}`

/** Year-over-year delta as a percentage of the previous value. */
export const deltaPct = (current: number, previous: number): number | null => {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

export const cell = (v: string | number): string => {
  if (v === '' || v == null) return '—'
  if (typeof v === 'number') return int(v)
  return v
}
