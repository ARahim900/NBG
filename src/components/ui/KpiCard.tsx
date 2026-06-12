import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Delta from './Delta'
import AnimatedNumber from './AnimatedNumber'
import { useTilt } from '../../lib/interactions'

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
 * Executive KPI tile: glass surface, gradient icon gem, value that counts up
 * on first view, pointer-tracked 3D tilt and a sheen sweep on hover.
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
  const tiltRef = useTilt<HTMLDivElement>(5)
  const a = ACCENTS[accent]

  return (
    <div ref={tiltRef} className="card card-lift sheen group p-4 sm:p-5">
      {/* Corner aura that breathes on hover */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 ${a.glow} opacity-0 group-hover:opacity-100`}
        aria-hidden="true"
      />
      {/* Accent beam along the top edge */}
      <div
        className={`pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r ${a.beam}`}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${a.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {delta !== undefined && <Delta value={delta} invert={invertDelta} />}
      </div>

      <div className="relative mt-3.5">
        <div className="flex items-baseline gap-1">
          <AnimatedNumber
            value={value}
            className="font-display text-2xl font-bold tracking-tight text-heading sm:text-[1.75rem]"
          />
          {unit && <span className="text-sm font-semibold text-ink/45">{unit}</span>}
        </div>
        <p className="mt-1 text-sm font-medium text-ink/70">{label}</p>
        {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
      </div>
    </div>
  )
}
