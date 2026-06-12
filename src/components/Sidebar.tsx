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
          collapsed ? 'lg:justify-center lg:px-0' : ''
        }`}
      >
        <item.icon className="nav-ico h-[1.15rem] w-[1.15rem] shrink-0" />
        <span className={`flex-1 truncate ${collapsed ? 'lg:hidden' : ''}`}>
          {item.name}
        </span>
        {item.code && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-display text-[0.62rem] font-bold transition-colors ${
              isActive
                ? 'bg-glow/15 text-glow shadow-glow-teal'
                : 'bg-white/5 text-white/45'
            } ${collapsed ? 'lg:hidden' : ''}`}
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
        className={`fixed inset-0 z-30 bg-navy-900/60 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.07] bg-[#06121f]/90 backdrop-blur-2xl transition-[transform,width] duration-300 lg:translate-x-0 ${
          collapsed ? 'lg:w-20' : 'lg:w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Aurora edge glow inside the panel */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -left-24 top-[-10%] h-72 w-72 rounded-full bg-azure/15 blur-3xl" />
          <div className="absolute -right-28 bottom-[-6%] h-80 w-80 rounded-full bg-glow/[0.07] blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-glow/25 to-transparent" />
        </div>

        {/* Brand */}
        <div
          className={`relative flex items-center gap-3 px-5 pb-5 pt-6 ${
            collapsed ? 'lg:gap-0 lg:px-0' : ''
          }`}
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center ${
              collapsed ? 'lg:mx-auto' : ''
            }`}
          >
            <img
              src="/moh-emblem-white.png"
              alt="Ministry of Health, Oman"
              className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(94,234,212,0.25)]"
            />
          </div>
          <div className={`leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="font-display text-sm font-bold text-white">NBG Health</p>
            <p className="text-[0.7rem] font-medium text-glow/90">
              Women &amp; Child Health
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`relative mb-3 border-t border-white/10 ${collapsed ? 'mx-5 lg:mx-3' : 'mx-5'}`}
        />

        {/* Nav — groups stay open so every dashboard is one click away */}
        <nav className="relative flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
          {NAV.filter((i) => i.group === 'general').map(renderItem)}

          {NAV_GROUPS.map((g) => (
            <div key={g.id} className="pt-4">
              <div
                className={`mb-1.5 flex items-baseline justify-between px-3 ${
                  collapsed ? 'lg:hidden' : ''
                }`}
              >
                <span className="font-display text-[0.66rem] font-bold uppercase tracking-[0.18em] text-glow/70">
                  {g.label}
                </span>
                <span className="font-ar text-[0.78rem] font-medium text-white/35">
                  {g.labelAr}
                </span>
              </div>
              {collapsed && (
                <div className="mx-2 my-2 hidden border-t border-white/10 lg:block" />
              )}
              <div className="space-y-1">
                {NAV.filter((i) => i.group === g.id).map(renderItem)}
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
            className={`hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:flex ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronsLeft className="h-4 w-4 shrink-0" />
            )}
            <span className={collapsed ? 'lg:hidden' : ''}>Collapse</span>
          </button>
          <div className={`px-2 pt-2 ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="text-[0.7rem] font-semibold text-white/80">
              Ministry of Health · Oman
            </p>
            <p className="mt-0.5 text-[0.65rem] text-white/45">
              Tenth Five-Year Health Plan · 2023–2025
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
