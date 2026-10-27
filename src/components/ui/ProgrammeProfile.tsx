import type { ReactNode } from 'react'
import { AlertTriangle, Award, Target, type LucideIcon } from 'lucide-react'

export interface ProgrammeFact {
  label: string
  value: ReactNode
  /** One short qualifier under the figure, e.g. "6 doctors · 6 nurses". */
  detail?: string
}

interface ProgrammeProfileProps {
  /** Prefix for the heading ids. */
  id: string
  title?: string
  /** Source or period line under the title. */
  caption?: ReactNode
  facts: ProgrammeFact[]
  /** Optional year table shown inside the card, below the figures. */
  byYear?: ReactNode
  challenges?: ReactNode[]
  achievements?: ReactNode[]
  plan?: ReactNode[]
}

// Literal class names so Tailwind keeps them.
const FACT_COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}
const LIST_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
}

/**
 * One card for a programme's activity: a strip of capacity figures with
 * hairline dividers, an optional year table, then challenges, achievements
 * and plans side by side. Keeps programme activity apart from the outcome
 * KPIs at the top of the page.
 */
export default function ProgrammeProfile({
  id,
  title = 'Programme Profile',
  caption,
  facts,
  byYear,
  challenges = [],
  achievements = [],
  plan = [],
}: ProgrammeProfileProps) {
  const lists: { key: string; label: string; icon: LucideIcon; items: ReactNode[] }[] = [
    { key: 'challenges', label: 'Challenges', icon: AlertTriangle, items: challenges },
    { key: 'achievements', label: 'Achievements', icon: Award, items: achievements },
    { key: 'plan', label: 'Future Plan', icon: Target, items: plan },
  ].filter((l) => l.items.length > 0)

  return (
    <section aria-labelledby={`${id}-title`} className="card p-5 sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`${id}-title`} className="text-title text-heading">
          {title}
        </h2>
        {caption && <p className="text-caption text-ink/60">{caption}</p>}
      </header>

      <dl
        className={`mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-control border border-[rgb(var(--card-border))] bg-[rgb(var(--card-border))] ${FACT_COLS[facts.length] ?? 'lg:grid-cols-4'}`}
      >
        {facts.map((f) => (
          <div key={f.label} className="min-w-0 bg-surface px-4 py-3 max-lg:last:odd:col-span-2">
            <dt className="text-caption text-ink/70">{f.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-heading">{f.value}</dd>
            {f.detail && <dd className="text-caption text-ink/60">{f.detail}</dd>}
          </div>
        ))}
      </dl>

      {byYear && <div className="mt-4">{byYear}</div>}

      {lists.length > 0 && (
        <div
          className={`mt-5 grid grid-cols-1 gap-6 border-t border-sky pt-5 dark:border-[rgb(var(--card-border))] ${LIST_COLS[lists.length]}`}
        >
          {lists.map(({ key, label, icon: Icon, items }) => (
            <div key={key} className="min-w-0">
              <h3 id={`${id}-${key}`} className="flex items-center gap-2 text-label font-semibold text-heading">
                <Icon className="h-4 w-4 text-azure dark:text-glow" aria-hidden="true" />
                {label}
              </h3>
              <ul
                aria-labelledby={`${id}-${key}`}
                className="mt-3 list-disc space-y-2 pl-5 text-body text-ink/80 marker:text-teal"
              >
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
