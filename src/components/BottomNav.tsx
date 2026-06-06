import { useState } from 'react'
import { Baby, Heart, type LucideIcon } from 'lucide-react'
import {
  NAV,
  NAV_GROUPS,
  type NavGroup,
  type ViewId,
} from '../lib/dashboards'

interface BottomNavProps {
  active: ViewId
  onSelect: (id: ViewId) => void
}

const GROUP_ICON: Record<Exclude<NavGroup, 'general'>, LucideIcon> = {
  women: Heart,
  children: Baby,
}
const GROUP_SHORT: Record<Exclude<NavGroup, 'general'>, string> = {
  women: 'Women',
  children: 'Children',
}

/**
 * Mobile-only bottom navigation bar (hidden on lg+, where the sidebar shows).
 * General items (Home, Overview) navigate directly; each health section opens
 * an upward bottom sheet listing its dashboards — so all views stay reachable.
 */
export default function BottomNav({ active, onSelect }: BottomNavProps) {
  const [sheet, setSheet] = useState<Exclude<NavGroup, 'general'> | null>(null)
  const general = NAV.filter((i) => i.group === 'general')
  const activeGroup = NAV.find((i) => i.id === active)?.group

  const go = (id: ViewId) => {
    onSelect(id)
    setSheet(null)
  }

  const tabClass = (on: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.62rem] font-semibold transition-colors ${
      on ? 'text-teal' : 'text-white/60'
    }`

  return (
    <div className="lg:hidden">
      {/* Section bottom-sheet */}
      {sheet && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm"
            onClick={() => setSheet(null)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 animate-fade-up rounded-t-2xl border-t border-white/10 bg-gradient-to-b from-navy to-navy-800 px-3 pt-3 shadow-2xl dark:from-navy-800 dark:to-navy-900"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4.75rem)' }}
            role="dialog"
            aria-label={`${GROUP_SHORT[sheet]} dashboards`}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <p className="px-2 pb-2 text-sm font-semibold text-white">
              {NAV_GROUPS.find((g) => g.id === sheet)?.label}
            </p>
            <div className="grid max-h-[50vh] grid-cols-2 gap-1.5 overflow-y-auto pb-1">
              {NAV.filter((i) => i.group === sheet).map((item) => {
                const isActive = item.id === active
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-[1.1rem] w-[1.1rem] shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Fixed bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-navy/95 backdrop-blur-md dark:bg-navy-900/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        {general.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={tabClass(isActive)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.id === 'about' ? 'Home' : item.name}</span>
            </button>
          )
        })}
        {NAV_GROUPS.map((g) => {
          const Icon = GROUP_ICON[g.id]
          const on = activeGroup === g.id || sheet === g.id
          return (
            <button
              key={g.id}
              onClick={() => setSheet((s) => (s === g.id ? null : g.id))}
              aria-expanded={sheet === g.id}
              className={tabClass(on)}
            >
              <Icon className="h-5 w-5" />
              <span>{GROUP_SHORT[g.id]}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
