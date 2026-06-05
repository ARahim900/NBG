import { X } from 'lucide-react'
import { NAV, NAV_GROUPS, type NavItem, type ViewId } from '../lib/dashboards'

interface SidebarProps {
  active: ViewId
  onSelect: (id: ViewId) => void
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({
  active,
  onSelect,
  mobileOpen,
  onClose,
}: SidebarProps) {
  const renderItem = (item: NavItem) => {
    const isActive = item.id === active
    return (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`nav-link w-full text-left ${isActive ? 'nav-link-active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
        <span className="flex-1">{item.name}</span>
        {item.code && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold ${
              isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
            }`}
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
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.06] bg-gradient-to-b from-navy via-navy to-navy-800 transition-transform duration-300 dark:from-navy-800 dark:via-navy-900 dark:to-[#091523] lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 pb-5 pt-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <img
              src="/moh-emblem-white.png"
              alt="Ministry of Health, Oman"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="leading-tight">
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

        <div className="mx-5 mb-3 border-t border-white/10" />

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {NAV.filter((i) => i.group === 'general').map(renderItem)}

          {NAV_GROUPS.map((g) => (
            <div key={g.id} className="pt-3">
              <p className="flex items-baseline justify-between px-3 pb-1.5 pt-1 text-[0.65rem] font-bold uppercase tracking-widest text-white/40">
                <span>{g.label}</span>
                <span className="font-ar text-[0.78rem] normal-case tracking-normal text-teal/70">
                  {g.labelAr}
                </span>
              </p>
              {NAV.filter((i) => i.group === g.id).map(renderItem)}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[0.7rem] font-semibold text-white/80">
            Ministry of Health · Oman
          </p>
          <p className="mt-0.5 text-[0.65rem] text-white/45">
            Tenth Five-Year Health Plan · 2023–2025
          </p>
        </div>
      </aside>
    </>
  )
}
