import type { LucideIcon } from 'lucide-react'

interface SectionTitleProps {
  /** Kept for API compatibility; the MOH template titles carry no icon. */
  icon?: LucideIcon
  title: string
  subtitle?: string
}

/**
 * Section heading in the MOH template style: a DM Sans title with the
 * short MOH-blue accent tab beneath it, and an optional caption.
 */
export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-4 mt-2 [container-type:inline-size]" data-reveal>
      <h2 className="font-sans text-[clamp(1.125rem,calc(0.9rem+1cqi),1.4rem)] font-normal leading-snug text-heading">
        {title}
      </h2>
      <span className="accent-tab mt-2 bg-azure" aria-hidden="true" />
      {subtitle && <p className="mt-2 text-caption text-ink/65">{subtitle}</p>}
    </div>
  )
}
