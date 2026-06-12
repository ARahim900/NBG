import type { LucideIcon } from 'lucide-react'

interface SectionTitleProps {
  icon: LucideIcon
  title: string
  subtitle?: string
}

/** Divider heading used between groups of cards within a dashboard view. */
export default function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div className="mb-4 mt-2 flex items-center gap-3" data-reveal>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-700 text-glow ring-1 ring-glow/25">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-heading">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-ink/55">{subtitle}</p>}
      </div>
      <div
        className="ml-2 hidden h-px flex-1 bg-gradient-to-r from-line/25 to-transparent sm:block"
        aria-hidden="true"
      />
    </div>
  )
}
