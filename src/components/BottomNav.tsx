import { useState } from 'react'
import { Baby, Heart, Map as MapIcon, type LucideIcon } from 'lucide-react'
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
  region: MapIcon,
  women: Heart,
  children: Baby,
}
const GROUP_SHORT: Record<Exclude<NavGroup, 'general'>, string> = {
  region: 'Governorate',
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
  // Position of the highlighted tab, for the sliding indicator.
  const tabCount = general.length + NAV_GROUPS.length
  const generalIdx = general.findIndex((i) => i.id === active)
  const tabIdx =
    generalIdx >= 0 ? generalIdx : general.length + NAV_GROUPS.findIndex((g) => g.id === activeGroup)

  const go = (id: ViewId) => {
    onSelect(id)
    setSheet(null)
  }

  const tabClass = (on: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.62rem] font-semibold transition-colors duration-200 ${
      on ? 'text-glow' : 'text-white/70'
    }`

  return (
    <div className="lg:hidden">
      {/* Section bottom-sheet */}
      {sheet && (
        <>
          <div
            className="fixed inset-0 z-40 animate-fade-in bg-navy-900/50 backdrop-blur-sm"
            onClick={() => setSheet(null)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 animate-sheet-up rounded-t-3xl border-t border-glow/20 bg-[#06121f]/95 px-3 pt-3 shadow-2xl backdrop-blur-xl"
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
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-[#06121f]/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        {/* Indicator glides to the active tab */}
        {tabIdx >= 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 flex justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: `${100 / tabCount}%`, transform: `translateX(${tabIdx * 100}%)` }}
          >
            <span className="h-[3px] w-8 rounded-b-full bg-glow" />
          </span>
        )}
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
              <span>{item.short ?? item.name}</span>
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
