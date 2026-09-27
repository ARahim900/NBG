import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Delta from './Delta'
import AnimatedNumber from './AnimatedNumber'

interface KpiCardProps {
  label: string
  value: ReactNode
  unit?: string
  icon: LucideIcon
  hint?: string
  /** Optional year-over-year change pill. */
  delta?: number | null
  invertDelta?: boolean
  accent?: 'navy' | 'azure' | 'teal' | 'gold' | 'good'
}

/** Flat, single-colour icon tiles in the app's own palette. */
const ACCENTS: Record<string, string> = {
  navy: 'bg-navy text-white',
  azure: 'bg-azure text-white',
  teal: 'bg-teal-700 text-white',
  gold: 'bg-warn text-white',
  good: 'bg-good text-white',
}

/**
 * KPI tile in the Muscat Bay layout — icon tile, uppercase label, value, one
 * caption line — in this app's own colours. The value counts up on first view
 * and glides between values when a filter changes.
 */
export default function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  hint,
  delta,
  invertDelta,
  accent = 'navy',
}: KpiCardProps) {
  return (
    <div className="card card-lift p-4 sm:p-5">
      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${ACCENTS[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {delta !== undefined && <Delta value={delta} invert={invertDelta} />}
      </div>

      <div className="relative mt-3">
        <p className="text-eyebrow uppercase text-ink/60">{label}</p>
        <div className="mt-1.5 flex items-baseline gap-1">
          <AnimatedNumber value={value} className="text-kpi tabular-nums text-heading" />
          {unit && <span className="text-caption text-ink/55">{unit}</span>}
        </div>
        {hint && <p className="mt-1 text-caption text-ink/55">{hint}</p>}
      </div>
    </div>
  )
}
