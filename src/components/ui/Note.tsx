import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

interface NoteProps {
  children: ReactNode
  tone?: 'info' | 'warn'
  title?: string
}

/** Inline caveat / data-gap banner — used for the honest 2025 source notes. */
export default function Note({ children, tone = 'info', title }: NoteProps) {
  const styles =
    tone === 'warn'
      ? 'border-warn/30 bg-warn/[0.08] text-[#7a5a12]'
      : 'border-azure/25 bg-azure/[0.06] text-navy/80'
  return (
    <div className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed ${styles}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
      <p>
        {title && <span className="font-bold">{title} </span>}
        {children}
      </p>
    </div>
  )
}
