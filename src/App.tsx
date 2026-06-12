import {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import Cursor from './components/Cursor'
import { useThemeMode } from './lib/theme-mode'
import { animateViewIn, gsap, motionOK } from './lib/motion'
import type { ViewId } from './lib/dashboards'
import About from './views/About'
import Overview from './views/Overview'
import Asd from './views/Asd'
import DownSyndrome from './views/DownSyndrome'
import MaternalDeaths from './views/MaternalDeaths'
import ChildMaltreatment from './views/ChildMaltreatment'
import CongenitalAnomalies from './views/CongenitalAnomalies'
import StillbirthNeonatal from './views/StillbirthNeonatal'
import NewbornScreening from './views/NewbornScreening'
import MaternalCare from './views/MaternalCare'
import FamilyPlanning from './views/FamilyPlanning'
import ChildNutrition from './views/ChildNutrition'
import ChildAnaemia from './views/ChildAnaemia'

/** WebGL constellation loads in its own chunk after first paint. */
const AuroraField = lazy(() => import('./components/three/AuroraField'))

const VIEWS: Record<ViewId, (props: { onNavigate: (id: ViewId) => void }) => JSX.Element> = {
  about: About,
  overview: Overview,
  asd: Asd,
  ds: DownSyndrome,
  md: MaternalDeaths,
  mt: ChildMaltreatment,
  ca: CongenitalAnomalies,
  sn: StillbirthNeonatal,
  ns: NewbornScreening,
  mc: MaternalCare,
  fp: FamilyPlanning,
  cn: ChildNutrition,
  an: ChildAnaemia,
}

export default function App() {
  const { isDark } = useThemeMode()
  const [active, setActive] = useState<ViewId>('about')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [webgl, setWebgl] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nbg-sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })
  const curtainRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const transitioning = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem('nbg-sidebar-collapsed', collapsed ? '1' : '0')
    } catch {
      /* storage unavailable — collapse still applies for this session */
    }
  }, [collapsed])

  // Defer the WebGL layer until the browser is idle so it never competes
  // with first paint or data rendering.
  useEffect(() => {
    const start = () => setWebgl(true)
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }
    const t = window.setTimeout(start, 1200)
    return () => window.clearTimeout(t)
  }, [])

  // Register the PWA service worker (offline support). Production-only so the
  // Vite dev server / HMR is never intercepted.
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* SW registration is best-effort; the app works normally without it */
      })
    }
    if (document.readyState === 'complete') {
      register()
      return
    }
    window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [])

  // Cinematic entrance for every view: cards rise out of the curtain sweep.
  useLayoutEffect(() => {
    if (!viewRef.current) return
    return animateViewIn(viewRef.current)
  }, [active])

  /** Curtain sweep between views; falls back to an instant swap. */
  const navigate = (id: ViewId) => {
    setMobileOpen(false)
    if (id === active || transitioning.current) return
    const curtain = curtainRef.current
    if (!motionOK() || !curtain) {
      setActive(id)
      window.scrollTo({ top: 0 })
      return
    }
    transitioning.current = true
    gsap
      .timeline({
        onComplete: () => {
          transitioning.current = false
        },
      })
      .set(curtain, { visibility: 'visible', clipPath: 'inset(100% 0% 0% 0%)' })
      .to(curtain, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.42,
        ease: 'power4.inOut',
      })
      .add(() => {
        setActive(id)
        window.scrollTo({ top: 0, behavior: 'auto' })
      })
      .to(
        curtain,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.5,
          ease: 'power4.inOut',
        },
        '+=0.16',
      )
      .set(curtain, { visibility: 'hidden' })
  }

  const View = VIEWS[active]

  return (
    <div
      className={`grain min-h-screen transition-[padding] duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}
    >
      {webgl && (
        <Suspense fallback={null}>
          <AuroraField isDark={isDark} />
        </Suspense>
      )}
      <Cursor />

      <Sidebar
        active={active}
        onSelect={navigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex min-h-screen flex-col pb-[4.75rem] lg:pb-0">
        <Header active={active} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={active} ref={viewRef} className="mx-auto max-w-7xl">
            <View onNavigate={navigate} />
          </div>
        </main>
        <footer className="relative border-t border-line/10 bg-surface/40 px-4 py-5 text-center text-xs text-ink/45 backdrop-blur transition-colors duration-300 sm:px-6 lg:px-8">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/25 to-transparent"
            aria-hidden="true"
          />
          Health Monitoring Dashboards · North Batinah Governorate · Women &amp; Child
          Health Department · Ministry of Health, Oman · Data 2023–2025
        </footer>
      </div>

      {/* Page-transition curtain */}
      <div ref={curtainRef} className="page-curtain" aria-hidden="true">
        <div className="flex h-full items-center justify-center">
          <img
            src="/moh-emblem-white.png"
            alt=""
            className="h-16 w-16 object-contain opacity-80 drop-shadow-[0_0_24px_rgba(94,234,212,0.5)]"
          />
        </div>
      </div>

      {/* Mobile-only bottom navigation (replaces the slide-in drawer on phones) */}
      <BottomNav active={active} onSelect={navigate} />

      {/* First-run "Add to Home Screen" prompt for new visitors */}
      <InstallPrompt />
    </div>
  )
}
