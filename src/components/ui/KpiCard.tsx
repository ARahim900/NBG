import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Delta from './Delta'

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

const ACCENTS: Record<string, string> = {
  navy: 'from-navy to-navy-600 text-white',
  azure: 'from-azure to-azure-600 text-white',
  teal: 'from-teal-600 to-teal-700 text-white',
  gold: 'from-warn to-[#a8761a] text-white',
  good: 'from-good to-[#256f59] text-white',
}

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
    <div className="card group p-4 transition-shadow duration-200 hover:shadow-card-hover sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[accent]} shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {delta !== undefined && <Delta value={delta} invert={invertDelta} />}
      </div>
      <div className="mt-3.5">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-heading sm:text-[1.7rem]">
            {value}
          </span>
          {unit && <span className="text-sm font-semibold text-ink/45">{unit}</span>}
        </div>
        <p className="mt-1 text-sm font-medium text-ink/70">{label}</p>
        {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
      </div>
    </div>
  )
}
