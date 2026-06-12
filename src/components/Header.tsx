import { useEffect, useRef } from 'react'
import { CalendarDays, Map, Menu } from 'lucide-react'
import { NAV_BY_ID, type ViewId } from '../lib/dashboards'
import { meta } from '../data/nbg'
import { YEAR_COLORS } from '../lib/theme'
import { attachScrollProgress, gsap, motionOK } from '../lib/motion'
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

  // Title glides in whenever the view changes.
  useEffect(() => {
    if (!titleRef.current || !motionOK()) return
    const tween = gsap.fromTo(
      titleRef.current,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' },
    )
    return () => {
      tween.kill()
    }
  }, [active])

  useEffect(() => {
    if (!progressRef.current) return
    return attachScrollProgress(progressRef.current)
  }, [])

  return (
    <>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-line/10 bg-surface/60 backdrop-blur-xl transition-colors duration-300">
        {/* hairline beam under the header */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-glow/30 to-transparent"
          aria-hidden="true"
        />
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/15 text-heading transition-colors hover:bg-tint/10 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
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

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 text-[0.7rem] font-medium text-ink/45">
              <span className="hidden sm:inline">Health Monitoring Dashboards</span>
              <span className="hidden text-ink/25 sm:inline">/</span>
              <span className="truncate font-semibold text-azure">{item.name}</span>
            </div>
            <h1
              ref={titleRef}
              className="truncate font-display text-lg font-bold tracking-tight text-heading sm:text-xl"
            >
              {active === 'about'
                ? 'Women & Child Health Department'
                : active === 'overview'
                  ? 'North Batinah Governorate'
                  : item.name}
            </h1>
          </div>

          {/* Year legend */}
          <div className="hidden items-center gap-3 rounded-xl border border-line/15 bg-mist/50 px-3 py-2 backdrop-blur md:flex">
            <CalendarDays className="h-4 w-4 text-heading/50" />
            {Object.entries(YEAR_COLORS).map(([year, color]) => (
              <span
                key={year}
                className="flex items-center gap-1.5 font-display text-xs font-semibold text-ink/70"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: color, color }}
                />
                {year}
              </span>
            ))}
          </div>

          <ThemeToggle />
        </div>

        {/* Context strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line/5 bg-mist/30 px-4 py-2 text-xs text-ink/60 sm:px-6 lg:px-8">
          <span className="flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-teal-600" />
            North Batinah · {wilayatCount} wilayat
          </span>
          <span className="ml-auto hidden font-medium text-ink/45 sm:inline">
            {meta.source_authority}
          </span>
        </div>
      </header>
    </>
  )
}
