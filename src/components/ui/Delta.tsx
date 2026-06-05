import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

interface DeltaProps {
  /** Percentage change (already computed). Null/undefined renders a dash. */
  value: number | null | undefined
  /** When true, a decrease is the "good" direction (e.g. anaemia, deaths). */
  invert?: boolean
  suffix?: string
}

/** Small coloured pill showing a year-over-year change with direction arrow. */
export default function Delta({ value, invert = false, suffix = '%' }: DeltaProps) {
  if (value == null || Number.isNaN(value)) {
    return (
      <span className="chip bg-tint/5 text-ink/50">
        <Minus className="h-3 w-3" /> n/a
      </span>
    )
  }

  const flat = Math.abs(value) < 0.05
  const positive = value > 0
  const isGood = flat ? null : invert ? !positive : positive
  const tone = flat
    ? 'bg-tint/5 text-ink/55'
    : isGood
      ? 'bg-good/10 text-good'
      : 'bg-alert/10 text-alert'
  const Icon = flat ? Minus : positive ? ArrowUpRight : ArrowDownRight

  return (
    <span className={`chip ${tone}`}>
      <Icon className="h-3 w-3" />
      {value > 0 ? '+' : ''}
      {value.toFixed(1)}
      {suffix}
    </span>
  )
}
