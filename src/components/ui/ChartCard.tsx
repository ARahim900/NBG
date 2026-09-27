import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  /** Right-aligned slot, e.g. a small legend or badge. */
  action?: ReactNode
  footnote?: string
  children: ReactNode
  className?: string
}

/** Titled MOH template card around a chart or table, with optional source footnote. */
export default function ChartCard({
  title,
  subtitle,
  action,
  footnote,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <section className={`card flex flex-col p-5 ${className}`}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          {/* Titles wrap rather than truncate: on phones they are the key label. */}
          {/* MOH template chart title: bold, MOH dark blue. */}
          <h3 className="text-title text-azure-700 [overflow-wrap:anywhere] dark:text-[#7cc0ee]">
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-caption text-ink/65">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="flex-1">{children}</div>
      {footnote && (
        <p className="mt-3 border-t border-sky pt-3 text-caption italic text-ink/60 dark:border-[rgb(var(--card-border))]">
          {footnote}
        </p>
      )}
    </section>
  )
}
