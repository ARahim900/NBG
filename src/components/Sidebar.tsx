import { useState } from 'react'
import { ChevronDown, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import {
  NAV,
  NAV_GROUPS,
  type NavGroup,
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
  // Section dropdowns start collapsed; they open only when the user clicks the
  // section header. (general has no header — its items always render.)
  const [openGroups, setOpenGroups] = useState<Record<NavGroup, boolean>>({
    general: true,
    women: false,
    children: false,
  })
  const toggleGroup = (g: NavGroup) =>
    setOpenGroups((s) => ({ ...s, [g]: !s[g] }))

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
        <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
        <span className={`flex-1 truncate ${collapsed ? 'lg:hidden' : ''}`}>
          {item.name}
        </span>
        {item.code && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold ${
              isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
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
        className={`fixed inset-0 z-30 bg-navy-900/50 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.06] bg-gradient-to-b from-navy via-navy to-navy-800 transition-[transform,width] duration-300 dark:from-navy-800 dark:via-navy-900 dark:to-[#091523] lg:translate-x-0 ${
          collapsed ? 'lg:w-20' : 'lg:w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div
          className={`flex items-center gap-3 px-5 pb-5 pt-6 ${
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
              className="h-full w-full object-contain"
            />
          </div>
          <div className={`leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="text-sm font-extrabold text-white">NBG Health</p>
            <p className="text-[0.7rem] font-medium text-teal/90">
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
          className={`mb-3 border-t border-white/10 ${collapsed ? 'mx-5 lg:mx-3' : 'mx-5'}`}
        />

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
          {NAV.filter((i) => i.group === 'general').map(renderItem)}

          {NAV_GROUPS.map((g) => {
            const open = openGroups[g.id]
            return (
              <div key={g.id} className="pt-3">
                {/* Section header (accordion trigger) — hidden in the icon rail */}
                <button
                  onClick={() => toggleGroup(g.id)}
                  aria-expanded={open}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold tracking-wide text-white/65 transition-colors hover:bg-white/5 hover:text-white ${
                    collapsed ? 'lg:hidden' : ''
                  }`}
                >
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      open ? '' : '-rotate-90'
                    }`}
                  />
                  <span className="flex-1 text-left">{g.label}</span>
                  <span className="font-ar text-[0.82rem] font-medium tracking-normal text-teal/80">
                    {g.labelAr}
                  </span>
                </button>

                {/* In the icon rail, a thin divider stands in for the header */}
                {collapsed && (
                  <div className="mx-2 my-2 hidden border-t border-white/10 lg:block" />
                )}

                {/* Collapsible items — forced open in the icon rail via lg: override */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  } ${collapsed ? 'lg:grid-rows-[1fr]' : ''}`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1 pt-1">
                      {NAV.filter((i) => i.group === g.id).map(renderItem)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-3 py-3">
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
