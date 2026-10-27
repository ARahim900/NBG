import { useEffect, useRef } from 'react'
import { Map, Menu, Printer } from 'lucide-react'
import { NAV_BY_ID, NAV_GROUPS, type ViewId } from '../lib/dashboards'
import { meta } from '../data/nbg'
import { YEAR_COLORS, YEAR_COLORS_DARK } from '../lib/theme'
import { useThemeMode } from '../lib/theme-mode'
import { attachScrollProgress, fadeIn } from '../lib/motion'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  active: ViewId
  onOpenMenu?: () => void
}

const wilayatCount = meta.wilayats.length

/**
 * Pages whose charts do not use the 2023 / 2024 / 2025 year colours: 2025
 * population estimates (with the map), the team chart, the gallery, the Extra
 * Child Health Register (2025 only; its series are the 3- and 4-year visits)
 * and the 2026 extended-screening report. Breastfeeding and Stillbirth &
 * Neonatal now compare years in YEAR_COLORS, so they show the key. Listed by
 * id, so a sub-page's key does not depend on its parent page.
 */
const NO_YEAR_KEY = new Set<ViewId>([
  'pop',
  'map',
  'wch-team',
  'gallery',
  'ecr',
  'children/newborn-screening/extended-newborn-screening-2026',
])

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
  const parent = item.parentId ? NAV_BY_ID[item.parentId] : null
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
      {/* MOH template page header: logo, letter-spaced section label, DM Sans
          title with the accent tab, thin light-blue rule. */}
      <header className="sticky top-0 z-20 border-b border-sky bg-surface transition-colors duration-300 dark:border-[rgb(var(--card-border))]">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 lg:px-8">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line/15 text-heading transition-colors hover:bg-tint/10 xl:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <span className="flex h-7 shrink-0 items-center sm:h-9 xl:hidden">
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

          <div className="min-w-0 flex-1 [container-type:inline-size]">
            {/* Section label (the page name itself is the title below). */}
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#7c8ba0] dark:text-ink/60">
              <span className="hidden sm:inline">Ministry of Health · </span>
              {group ? group.label : item.name}
              {parent && ` · ${parent.name}`}
            </p>
            {/* Scale to the title column; long titles remain fully readable. */}
            <h1
              ref={titleRef}
              className="mt-0.5 font-sans text-[clamp(1rem,calc(0.75rem+1.5cqi),1.65rem)] font-normal leading-snug text-heading [overflow-wrap:break-word]"
            >
              {title}
            </h1>
            <span className="accent-tab mt-2 bg-azure" aria-hidden="true" />
          </div>

          {/* Year colour key, hidden where charts do not use year colours (NO_YEAR_KEY). */}
          {!NO_YEAR_KEY.has(active) && (
            <div
              className="order-last hidden w-full cursor-default select-none items-center justify-end gap-3 md:flex 2xl:order-none 2xl:w-auto"
              role="note"
              aria-label="Chart colours by year: 2023 light blue, 2024 blue, 2025 navy"
            >
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink/50">
                Chart key
              </span>
              {Object.entries(YEAR_COLORS).map(([year, color]) => (
                <span key={year} className="flex items-center gap-1.5 text-xs font-medium text-ink/70">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isDark ? YEAR_COLORS_DARK[year] : color }}
                  />
                  {year}
                </span>
              ))}
            </div>
          )}

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
