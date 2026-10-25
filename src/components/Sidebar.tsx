import { ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import {
  NAV,
  NAV_GROUPS,
  type NavItem,
  type ViewId,
} from '../lib/dashboards'

interface SidebarProps {
  active: ViewId
  onSelect: (id: ViewId) => void
  mobileOpen: boolean
  onClose: () => void
  /** Desktop icon-rail mode. */
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({
  active,
  onSelect,
  mobileOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const renderItem = (item: NavItem) => {
    const isActive = item.id === active
    return (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        title={item.name}
        aria-current={isActive ? 'page' : undefined}
        className={`nav-link w-full text-left ${isActive ? 'nav-link-active' : ''} ${
          collapsed ? 'xl:justify-center xl:px-0' : ''
        }`}
      >
        <item.icon className="nav-ico h-[1.15rem] w-[1.15rem] shrink-0" />
        <span className={`flex-1 ${item.parentId ? 'whitespace-normal text-xs leading-relaxed' : 'truncate'} ${collapsed ? 'xl:hidden' : ''}`}>
          {item.name}
        </span>
        {item.code && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-display text-[0.62rem] font-bold transition-colors ${
              isActive
                ? 'bg-glow/15 text-glow'
                : 'bg-white/5 text-white/45'
            } ${collapsed ? 'xl:hidden' : ''}`}
          >
            {item.code}
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-navy-900/60 backdrop-blur-sm transition-opacity xl:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-l-4 border-azure bg-navy transition-[transform,width,visibility] duration-300 dark:bg-[#0b2235] xl:visible xl:translate-x-0 ${
          collapsed ? 'xl:w-20' : 'xl:w-72'
        } ${mobileOpen ? 'translate-x-0' : 'invisible -translate-x-full'}`}
      >
        {/* Brand */}
        <div
          className={`relative flex items-center gap-3 px-5 pb-5 pt-6 ${
            collapsed ? 'xl:gap-0 xl:px-0' : ''
          }`}
        >
          {/* Official MOH lockup; the emblem alone when the rail is collapsed. */}
          <div className={`min-w-0 ${collapsed ? 'xl:hidden' : ''}`}>
            <img
              src="/moh-logo-white.png"
              alt="Ministry of Health, Oman"
              className="h-11 w-auto object-contain"
            />
            <p className="mt-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-glow">
              DGHS · North Al Batinah
            </p>
          </div>
          <div
            className={`hidden h-11 w-11 shrink-0 items-center justify-center ${
              collapsed ? 'xl:mx-auto xl:flex' : ''
            }`}
          >
            <img
              src="/moh-emblem-white.png"
              alt="Ministry of Health, Oman"
              className="h-full w-full object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-white/70 hover:bg-white/10 xl:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`relative mb-3 border-t border-white/10 ${collapsed ? 'mx-5 xl:mx-3' : 'mx-5'}`}
        />

        {/* Nav — groups stay open so every dashboard is one click away */}
        <nav className="relative flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
          {NAV.filter((i) => i.group === 'general').map(renderItem)}

          {NAV_GROUPS.map((g) => (
            <div key={g.id} className="pt-4">
              <div
                className={`mb-1.5 flex px-3 ${g.id === 'women' ? 'flex-col items-start gap-1' : 'items-baseline justify-between'} ${
                  collapsed ? 'xl:hidden' : ''
                }`}
              >
                <span className="text-eyebrow uppercase text-glow/70">
                  {g.label}
                </span>
                <span className="font-ar text-[0.78rem] font-medium text-white/35">
                  {g.labelAr}
                </span>
              </div>
              {collapsed && (
                <div className="mx-2 my-2 hidden border-t border-white/10 xl:block" />
              )}
              <div className="space-y-1">
                {NAV.filter((i) => i.group === g.id && !i.parentId).map((item) => (
                  <div key={item.id}>
                    {renderItem(item)}
                    {NAV.some((child) => child.parentId === item.id) && (
                      <div role="group" aria-label={`${item.name} subsections`}
                        className={`ml-6 mt-1 space-y-1 border-l border-[#A4C5BB]/50 pl-2 ${collapsed ? 'xl:ml-0 xl:border-0 xl:pl-0' : ''}`}>
                        {NAV.filter((child) => child.parentId === item.id).map(renderItem)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative border-t border-white/10 px-3 py-3">
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white xl:flex ${
              collapsed ? 'xl:justify-center xl:px-0' : ''
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronsLeft className="h-4 w-4 shrink-0" />
            )}
            <span className={collapsed ? 'xl:hidden' : ''}>Collapse</span>
          </button>
          <div className={`px-2 pt-2 ${collapsed ? 'xl:hidden' : ''}`}>
            <p className="text-[0.7rem] font-semibold text-white/80">
              Ministry of Health · Oman
            </p>
            <p className="mt-0.5 text-[0.65rem] text-white/45">
              Indicators 2023–2025 · 10th Five-Year Plan (2021–2025)
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
