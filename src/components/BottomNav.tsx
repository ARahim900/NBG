import { useEffect, useRef, useState } from 'react'
import { Baby, Heart, Map as MapIcon, X, type LucideIcon } from 'lucide-react'
import {
  NAV,
  NAV_GROUPS,
  type NavGroup,
  type NavItem,
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
  region: 'Region',
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
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!sheet) return
    const dialog = dialogRef.current
    if (!dialog) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setSheet(null)
    }
    const closeOnNavigation = () => setSheet(null)
    desktop.addEventListener('change', closeOnDesktop)
    window.addEventListener('hashchange', closeOnNavigation)
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      desktop.removeEventListener('change', closeOnDesktop)
      window.removeEventListener('hashchange', closeOnNavigation)
      trigger?.focus()
    }
  }, [sheet])

  const general = NAV.filter((i) => i.group === 'general')
  const activeGroup = NAV.find((i) => i.id === active)?.group
  // Position of the highlighted tab, for the sliding indicator.
  const tabCount = general.length + NAV_GROUPS.length
  const generalIdx = general.findIndex((i) => i.id === active)
  const tabIdx =
    generalIdx >= 0 ? generalIdx : general.length + NAV_GROUPS.findIndex((g) => g.id === activeGroup)

  const sheetItems = sheet ? NAV.filter((i) => i.group === sheet) : []

  const go = (id: ViewId) => {
    onSelect(id)
    setSheet(null)
  }

  const renderItem = (item: NavItem) => {
    const isActive = item.id === active
    return (
      <button key={item.id} type="button" onClick={() => go(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex min-h-12 w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${isActive ? 'border-line/30 bg-mist text-heading' : 'border-line/10 text-ink hover:bg-mist'}`}>
        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{item.name}</span>
        {isActive && <span className="text-xs">Current</span>}
      </button>
    )
  }

  const tabClass = (on: boolean) =>
    `flex min-h-14 min-w-11 flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.62rem] font-semibold transition-colors duration-200 ${
      on ? 'text-glow' : 'text-white/70'
    }`

  return (
    <div className="lg:hidden">
      {sheet && (
        <dialog
          ref={dialogRef}
          id="dashboard-menu"
          data-print-hide
          aria-labelledby="dashboard-menu-title"
          onCancel={() => setSheet(null)}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return
            const bounds = event.currentTarget.getBoundingClientRect()
            if (event.clientX < bounds.left || event.clientX > bounds.right ||
                event.clientY < bounds.top || event.clientY > bounds.bottom) setSheet(null)
          }}
          className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-line/20 bg-surface p-4 text-ink shadow-xl backdrop:bg-black/40 sm:mx-auto sm:max-w-md"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="dashboard-menu-title" className="text-lg font-semibold text-heading">
                {NAV_GROUPS.find((g) => g.id === sheet)?.label}
              </h2>
              <p className="mt-1 text-sm text-ink/80">Choose a dashboard</p>
            </div>
            <button type="button" autoFocus onClick={() => setSheet(null)} aria-label="Close dashboard menu"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line/20 hover:bg-mist">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-2">
            {sheetItems.filter((item) => !item.parentId).map((item) => (
              <div key={item.id} className="space-y-2">
                {renderItem(item)}
                {sheetItems.some((child) => child.parentId === item.id) && (
                  <div role="group" aria-label={`${item.name} subsections`} className="ml-5 space-y-2 border-l border-[#A4C5BB] pl-3">
                    {sheetItems.filter((child) => child.parentId === item.id).map(renderItem)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </dialog>
      )}

      {/* Fixed bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t-2 border-azure bg-navy dark:bg-[#0b2235]"
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
              aria-label={g.label}
              onClick={() => setSheet((s) => (s === g.id ? null : g.id))}
              aria-expanded={sheet === g.id}
              aria-haspopup="dialog"
              aria-controls={sheet === g.id ? 'dashboard-menu' : undefined}
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
