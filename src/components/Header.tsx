import { useEffect, useRef } from 'react'
import { Map, Menu, Printer } from 'lucide-react'
import { NAV_BY_ID, NAV_GROUPS, type ViewId } from '../lib/dashboards'
import { meta } from '../data/nbg'
import { C, YEAR_COLORS } from '../lib/theme'
import { useThemeMode } from '../lib/theme-mode'
import { attachScrollProgress, fadeIn } from '../lib/motion'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  active: ViewId
  onOpenMenu?: () => void
}

const wilayatCount = meta.wilayats.length

export default function Header({ active, onOpenMenu }: HeaderProps) {
  const item = NAV_BY_ID[active]
  const titleRef = useRef<HTMLHeadingElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const { isDark } = useThemeMode()

  // Title fades in with the page whenever the view changes.
  useEffect(() => (titleRef.current ? fadeIn(titleRef.current) : undefined), [active])

  useEffect(() => {
    if (!progressRef.current) return
    return attachScrollProgress(progressRef.current)
  }, [])

  const group = NAV_GROUPS.find((g) => g.id === item.group)
  // Phones get a shorter Home title so it never needs a third line.
  const title =
    active === 'about' ? (
      <>
        Women &amp; Child Health<span className="hidden sm:inline"> Department</span>
      </>
    ) : active === 'overview' ? (
      'North Batinah Governorate'
    ) : (
      item.name
    )

  return (
    <>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
      {/* MOH template page header: logo, letter-spaced section label, serif
          title with the accent tab, thin light-blue rule. */}
      <header className="sticky top-0 z-20 border-b border-sky bg-surface transition-colors duration-300 dark:border-[rgb(var(--card-border))]">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line/15 text-heading transition-colors hover:bg-tint/10 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <span className="flex h-9 shrink-0 items-center lg:hidden">
            <img
              src="/moh-logo-colour.webp"
              alt="Ministry of Health, Oman"
              className="block h-full w-auto object-contain dark:hidden"
            />
            <img
              src="/moh-logo-white.png"
              alt=""
              aria-hidden="true"
              className="hidden h-full w-auto object-contain dark:block"
            />
          </span>

          <div className="min-w-0 flex-1 overflow-hidden">
            {/* Section label (the page name itself is the title below). */}
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#7c8ba0] dark:text-ink/60">
              <span className="hidden sm:inline">Ministry of Health · </span>
              {group ? group.label : item.name}
            </p>
            {/* Titles wrap to a second line on narrow screens — never cut off. */}
            <h1
              ref={titleRef}
              className="mt-0.5 line-clamp-2 font-serif text-lg font-normal leading-tight text-heading [text-wrap:balance] sm:text-[1.65rem]"
            >
              {title}
            </h1>
            <span className="accent-tab mt-2 bg-azure" aria-hidden="true" />
          </div>

          {/* Year colour key — a plain legend, not a control. */}
          <div
            className="hidden cursor-default select-none items-center gap-3 md:flex"
            role="note"
            aria-label="Chart colours by year: 2023 teal, 2024 blue, 2025 navy"
          >
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink/50">
              Chart key
            </span>
            {Object.entries(YEAR_COLORS).map(([year, color]) => (
              <span key={year} className="flex items-center gap-1.5 text-xs font-medium text-ink/70">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: isDark && color === C.navy ? '#9bbfe8' : color }}
                />
                {year}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print or save this dashboard as PDF"
            title="Print / save as PDF"
            data-print-hide
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-control border border-sky text-heading transition-colors hover:bg-sky-50 dark:border-[rgb(var(--card-border))] dark:hover:bg-tint/10 sm:flex"
          >
            <Printer className="h-4 w-4" />
          </button>
          <span data-print-hide className="contents">
            <ThemeToggle />
          </span>
        </div>

        {/* Context strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-sky/70 px-4 py-1.5 text-xs text-ink/65 dark:border-[rgb(var(--card-border))] sm:px-6 lg:px-8">
          <span className="flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-azure" />
            North Batinah · {wilayatCount} wilayat
          </span>
          <span className="ml-auto hidden text-ink/55 sm:inline">{meta.source_authority}</span>
        </div>
      </header>
    </>
  )
}
