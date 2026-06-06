import { CalendarDays, Map, User } from 'lucide-react'
import { NAV_BY_ID, type ViewId } from '../lib/dashboards'
import { meta } from '../data/nbg'
import { YEAR_COLORS } from '../lib/theme'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  active: ViewId
}

const wilayatCount = meta.wilayats.length

export default function Header({ active }: HeaderProps) {
  const item = NAV_BY_ID[active]
  return (
    <header className="sticky top-0 z-20 border-b border-line/10 bg-surface/85 backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center lg:hidden">
          <img
            src="/moh-emblem-navy.png"
            alt="Ministry of Health, Oman"
            className="block h-full w-full object-contain dark:hidden"
          />
          <img
            src="/moh-emblem-white.png"
            alt=""
            aria-hidden="true"
            className="hidden h-full w-full object-contain dark:block"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[0.7rem] font-medium text-ink/45">
            <span>Health Monitoring Dashboards</span>
            <span className="text-ink/25">/</span>
            <span className="truncate text-azure">{item.name}</span>
          </div>
          <h1 className="truncate text-lg font-extrabold tracking-tight text-heading sm:text-xl">
            {active === 'about'
              ? 'Women & Child Health Department'
              : active === 'overview'
                ? 'North Batinah Governorate'
                : item.name}
          </h1>
        </div>

        {/* Year legend */}
        <div className="hidden items-center gap-3 rounded-xl border border-line/10 bg-mist/60 px-3 py-2 md:flex">
          <CalendarDays className="h-4 w-4 text-heading/50" />
          {Object.entries(YEAR_COLORS).map(([year, color]) => (
            <span key={year} className="flex items-center gap-1.5 text-xs font-semibold text-ink/70">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {year}
            </span>
          ))}
        </div>

        <ThemeToggle />
      </div>

      {/* Context strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line/5 bg-mist/40 px-4 py-2 text-xs text-ink/60 sm:px-6 lg:px-8">
        <span className="flex items-center gap-1.5">
          <Map className="h-3.5 w-3.5 text-teal-600" />
          North Batinah · {wilayatCount} wilayat
        </span>
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-teal-600" />
          Created by {meta.created_by}
        </span>
        <span className="ml-auto hidden font-medium text-ink/45 sm:inline">
          {meta.source_authority}
        </span>
      </div>
    </header>
  )
}
