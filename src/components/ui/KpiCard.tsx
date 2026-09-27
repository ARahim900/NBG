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

const ACCENTS: Record<string, { icon: string; beam: string; glow: string }> = {
  navy: {
    icon: 'from-navy to-navy-600 text-white',
    beam: 'from-navy/0 via-azure/60 to-navy/0',
    glow: 'bg-azure/25',
  },
  azure: {
    icon: 'from-azure to-azure-600 text-white',
    beam: 'from-azure/0 via-azure/70 to-azure/0',
    glow: 'bg-azure/25',
  },
  teal: {
    icon: 'from-teal-600 to-teal-700 text-white',
    beam: 'from-teal/0 via-glow/70 to-teal/0',
    glow: 'bg-glow/20',
  },
  gold: {
    icon: 'from-warn to-[#a8761a] text-white',
    beam: 'from-warn/0 via-warn/70 to-warn/0',
    glow: 'bg-warn/20',
  },
  good: {
    icon: 'from-good to-[#256f59] text-white',
    beam: 'from-good/0 via-good/70 to-good/0',
    glow: 'bg-good/20',
  },
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
  const a = ACCENTS[accent]

  return (
    <div className="card card-lift sheen group p-4 sm:p-5">
      {/* Corner aura that fades in on hover */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 ${a.glow} opacity-0 group-hover:opacity-100`}
        aria-hidden="true"
      />
      {/* Accent beam along the top edge */}
      <div
        className={`pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r ${a.beam}`}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-gradient-to-br shadow-sm ${a.icon}`}
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
