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

/** Titled glass panel around a chart or table, with optional source footnote. */
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
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-[0.95rem] font-bold text-heading">
            <span
              className="h-3.5 w-1 shrink-0 rounded-full bg-gradient-to-b from-glow to-azure shadow-glow-teal"
              aria-hidden="true"
            />
            <span className="truncate">{title}</span>
          </h3>
          {subtitle && <p className="mt-0.5 pl-3 text-xs text-ink/55">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="flex-1">{children}</div>
      {footnote && (
        <p className="mt-3 border-t border-line/10 pt-3 text-[0.7rem] leading-relaxed text-ink/45">
          {footnote}
        </p>
      )}
    </section>
  )
}
