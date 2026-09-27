import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Delta from './Delta'
import AnimatedNumber from './AnimatedNumber'

interface KpiCardProps {
  label: string
  value: ReactNode
  unit?: string
  /** Accepted for API compatibility; not shown in the MOH template layout. */
  icon?: LucideIcon
  hint?: string
  /** Optional year-over-year change pill. */
  delta?: number | null
  invertDelta?: boolean
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
 * navy, an uppercase letter-spaced label and one caption line. The figure
 * counts up on first view and glides between values when a filter changes.
 * (`icon` is accepted for API compatibility; the template's stat cards carry
 * no icon.)
 */
export default function KpiCard({
  label,
  value,
  unit,
  hint,
  delta,
  invertDelta,
  accent = 'navy',
}: KpiCardProps) {
  return (
    <div className="card card-lift p-4 sm:p-5">
      <div className="relative flex items-start justify-between gap-3">
        <span className={`accent-tab mt-1 ${ACCENTS[accent]}`} aria-hidden="true" />
        {delta !== undefined && <Delta value={delta} invert={invertDelta} />}
      </div>

      <div className="relative mt-3">
        <div className="flex items-baseline gap-1">
          <AnimatedNumber value={value} className="text-[1.65rem] font-medium leading-8 tracking-[-0.01em] tabular-nums text-heading" />
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
