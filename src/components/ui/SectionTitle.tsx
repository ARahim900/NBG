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
    <div className="mb-4 mt-2 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tint/10 text-heading">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-heading">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-ink/55">{subtitle}</p>}
      </div>
    </div>
  )
}
