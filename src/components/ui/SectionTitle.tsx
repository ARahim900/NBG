import type { LucideIcon } from 'lucide-react'

interface SectionTitleProps {
  /** Kept for API compatibility; the MOH template titles carry no icon. */
  icon?: LucideIcon
  title: string
  subtitle?: string
}

/**
 * Section heading in the MOH template style: a serif navy title with the
 * short MOH-blue accent tab beneath it, and an optional caption.
 */
export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-4 mt-2" data-reveal>
      <h2 className="font-serif text-xl font-normal leading-tight text-heading sm:text-[1.4rem]">
        {title}
      </h2>
      <span className="accent-tab mt-2 bg-azure" aria-hidden="true" />
      {subtitle && <p className="mt-2 text-caption text-ink/65">{subtitle}</p>}
    </div>
  )
}
