import { useEffect, useRef, useState } from 'react'
import { Baby, Heart, MoreHorizontal, X, type LucideIcon } from 'lucide-react'
import {
  NAV,
  type NavItem,
  type ViewId,
} from '../lib/dashboards'

interface BottomNavProps {
  active: ViewId
  onSelect: (id: ViewId) => void
}

type MenuId = 'women' | 'children' | 'more'

const MENU_TABS: { id: MenuId; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'women', label: "Women's & Reproductive Health", short: 'Women', icon: Heart },
  { id: 'children', label: "Children's Health", short: 'Children', icon: Baby },
  { id: 'more', label: 'More', short: 'More', icon: MoreHorizontal },
]

export default function BottomNav({ active, onSelect }: BottomNavProps) {
  const [sheet, setSheet] = useState<MenuId | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!sheet) return
    const dialog = dialogRef.current
    if (!dialog) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    const desktop = window.matchMedia('(min-width: 1280px)')
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

  const directItems = NAV.filter((item) => item.id === 'about' || item.id === 'overview')
  const activeGroup = NAV.find((item) => item.id === active)?.group
  const activeMenu = activeGroup === 'women' || activeGroup === 'children'
    ? activeGroup
    : directItems.some((item) => item.id === active) ? null : 'more'
  const sheetItems = sheet === 'more'
    ? NAV.filter((item) => item.group === 'region' ||
        (item.group === 'general' && !directItems.some((direct) => direct.id === item.id)))
    : NAV.filter((item) => item.group === sheet)

  const go = (id: ViewId) => {
    onSelect(id)
    setSheet(null)
  }

  const renderItem = (item: NavItem) => {
    const isActive = item.id === active
    return (
      <button key={item.id} type="button" onClick={() => go(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex min-h-12 w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-azure ${isActive ? 'border-line/30 bg-mist text-heading' : 'border-line/10 text-ink hover:bg-mist'}`}>
        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{item.name}</span>
        {isActive && <span className="text-xs">Current</span>}
      </button>
    )
  }

  const tabClass = (on: boolean) =>
    `relative flex h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold leading-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-azure motion-reduce:transition-none ${
      on ? 'text-glow after:absolute after:top-0 after:h-0.5 after:w-7 after:rounded-b-full after:bg-glow' : 'text-white/75 hover:text-white'
    }`

  return (
    <div className="xl:hidden">
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
              <h2 id="dashboard-menu-title" className="text-lg font-semibold text-heading dark:text-glow">
                {MENU_TABS.find((item) => item.id === sheet)?.label}
              </h2>
              <p className="mt-1 text-sm text-ink/80">Choose a dashboard</p>
            </div>
            <button type="button" autoFocus onClick={() => setSheet(null)} aria-label="Close dashboard menu"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line/20 hover:bg-mist focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-azure">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-2">
            {sheetItems.filter((item) => !item.parentId).map((item) => (
              <div key={item.id} className="space-y-2">
                {renderItem(item)}
                {sheetItems.some((child) => child.parentId === item.id) && (
                  <div role="group" aria-label={`${item.name} subsections`} className="ml-5 space-y-2 border-l border-teal pl-3">
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
        {directItems.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={tabClass(isActive && !sheet)}
            >
              <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{item.short ?? item.name}</span>
            </button>
          )
        })}
        {MENU_TABS.map((g) => {
          const Icon = g.icon
          const on = sheet ? sheet === g.id : activeMenu === g.id
          return (
            <button
              key={g.id}
              type="button"
              aria-label={g.label}
              onClick={() => setSheet((s) => (s === g.id ? null : g.id))}
              aria-current={activeMenu === g.id ? 'true' : undefined}
              aria-expanded={sheet === g.id}
              aria-haspopup="dialog"
              aria-controls={sheet === g.id ? 'dashboard-menu' : undefined}
              className={tabClass(on)}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{g.short}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
