import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Delta, { type DeltaTone } from './Delta'

interface KpiCardProps {
  label: string
  value: ReactNode
  unit?: string
  /** Accepted for API compatibility; not shown in the MOH template layout. */
  icon?: LucideIcon
  hint?: string
  /** Optional year-over-year change pill. */
  delta?: number | null
  /** Which direction is good: 'up' (default), 'down', or 'neutral' when neither is. */
  deltaTone?: DeltaTone
  accent?: 'navy' | 'azure' | 'teal' | 'gold' | 'good'
}

/** Accent-tab colour per tile (MOH template: blue, navy, teal, green…). */
const ACCENTS: Record<string, string> = {
  navy: 'bg-navy dark:bg-[#9bbfe8]',
  azure: 'bg-azure',
  teal: 'bg-teal',
  gold: 'bg-warn',
  good: 'bg-[#26ad9e]',
}

/**
 * Stat card in the MOH template style: a coloured accent tab, the figure in
 * navy, an uppercase letter-spaced label and one caption line. The figure is
 * always shown at its final value — never counted up — so a screenshot or a
 * printout can never capture an interim number.
 */
export default function KpiCard({
  label,
  value,
  unit,
  hint,
  delta,
  deltaTone,
  accent = 'navy',
}: KpiCardProps) {
  return (
    <div className="card card-lift p-4 sm:p-5">
      <div className="relative flex items-start justify-between gap-3">
        <span className={`accent-tab mt-1 ${ACCENTS[accent]}`} aria-hidden="true" />
        {delta !== undefined && <Delta value={delta} tone={deltaTone} />}
      </div>

      <div className="relative mt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-[1.65rem] font-medium leading-8 tracking-[-0.01em] tabular-nums text-heading">
            {value}
          </span>
          {unit && <span className="text-caption text-ink/55">{unit}</span>}
        </div>
        <p className="mt-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#7c8ba0] dark:text-ink/60">
          {label}
        </p>
        {hint && <p className="mt-1 text-caption text-ink/60">{hint}</p>}
      </div>
    </div>
  )
}
