import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

/**
 * Which direction of change is good:
 * - 'up'      higher is better (coverage, early booking) — rise shows green
 * - 'down'    lower is better (anaemia, deaths) — fall shows green
 * - 'neutral' neither: a count that reflects reporting as much as incidence
 *             (notifications) — shown in a neutral colour, never green or red
 */
export type DeltaTone = 'up' | 'down' | 'neutral'

interface DeltaProps {
  /** Percentage change (already computed). Null/undefined renders a dash. */
  value: number | null | undefined
  tone?: DeltaTone
  suffix?: string
}

/** Small pill showing a year-over-year change with its direction arrow. */
export default function Delta({ value, tone = 'up', suffix = '%' }: DeltaProps) {
  if (value == null || Number.isNaN(value)) {
    return (
      <span className="chip bg-tint/5 text-ink/50">
        <Minus className="h-3 w-3" /> n/a
      </span>
    )
  }

  const flat = Math.abs(value) < 0.05
  const positive = value > 0
  const colour =
    flat || tone === 'neutral'
      ? 'bg-tint/10 text-heading/75'
      : (tone === 'down' ? !positive : positive)
        ? 'bg-good/10 text-good'
        : 'bg-alert/10 text-alert'
  const Icon = flat ? Minus : positive ? ArrowUpRight : ArrowDownRight
  const label = `${value > 0 ? '+' : ''}${value.toFixed(1)}${suffix}`

  return (
    <span
      className={`chip ${colour}`}
      title={tone === 'neutral' ? 'Change vs previous year (neither direction is better)' : 'Change vs previous year'}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}
