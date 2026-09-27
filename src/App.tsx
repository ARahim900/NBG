import {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react'
import { AlertTriangle, Home, RotateCw } from 'lucide-react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import Cursor from './components/Cursor'
import ErrorBoundary from './components/ErrorBoundary'
import { useThemeMode } from './lib/theme-mode'
import { animateViewIn, gsap, motionOK } from './lib/motion'
import { NAV_BY_ID, type ViewId, type ViewProps } from './lib/dashboards'

/** WebGL constellation loads in its own chunk after first paint. */
const AuroraField = lazy(() => import('./components/three/AuroraField'))

/**
 * Every dashboard is its own chunk, so the landing page does not download the
 * charting library or the other views until they are needed. All chunks are
 * prefetched once the browser is idle (see below), which keeps navigation
 * instant and lets the service worker cache every view for offline use.
 */
const LOADERS: Record<ViewId, () => Promise<{ default: ComponentType<ViewProps> }>> = {
  about: () => import('./views/About'),
  overview: () => import('./views/Overview'),
  pop: () => import('./views/Population'),
  asd: () => import('./views/Asd'),
  ds: () => import('./views/DownSyndrome'),
  md: () => import('./views/MaternalDeaths'),
  mt: () => import('./views/ChildMaltreatment'),
  ca: () => import('./views/CongenitalAnomalies'),
  sn: () => import('./views/StillbirthNeonatal'),
  ns: () => import('./views/NewbornScreening'),
  mc: () => import('./views/MaternalCare'),
  fp: () => import('./views/FamilyPlanning'),
  cn: () => import('./views/ChildNutrition'),
  an: () => import('./views/ChildAnaemia'),
}
const VIEWS = {} as Record<ViewId, LazyExoticComponent<ComponentType<ViewProps>>>
for (const id of Object.keys(LOADERS) as ViewId[]) VIEWS[id] = lazy(LOADERS[id])

const DEFAULT_VIEW: ViewId = 'about'
const BASE_TITLE = document.title

/** `#/asd` → 'asd'. Anything unknown falls back to Home. */
const viewFromHash = (): ViewId => {
  const id = window.location.hash.replace(/^#\/?/, '')
  return Object.prototype.hasOwnProperty.call(NAV_BY_ID, id) ? (id as ViewId) : DEFAULT_VIEW
}

/** Run work once the browser is idle so it never competes with first paint. */
const onIdle = (fn: () => void, fallbackMs: number): (() => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: fallbackMs * 2 })
    return () => window.cancelIdleCallback(id)
  }
  const t = window.setTimeout(fn, fallbackMs)
  return () => window.clearTimeout(t)
}

/** Plays the entrance animation once the (lazily loaded) view has mounted. */
function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => (ref.current ? animateViewIn(ref.current) : undefined), [])
  return (
    <div ref={ref} className="mx-auto max-w-7xl">
      {children}
    </div>
  )
}

function ViewLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-4" aria-busy="true">
      <span className="sr-only">Loading dashboard…</span>
      <div className="card h-24 animate-pulse" />
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-28 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function ViewError({ onHome }: { onHome: () => void }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-6 text-center" role="alert">
        <AlertTriangle className="mx-auto h-8 w-8 text-warn" />
        <h2 className="mt-3 font-display text-lg font-bold text-heading">
          This dashboard could not be displayed
        </h2>
        <p className="mt-1 text-sm text-ink/70">
          The app may have been updated since this page was opened, or the connection
          dropped. Reloading usually fixes it. Other dashboards are unaffected.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600"
          >
            <RotateCw className="h-4 w-4" /> Reload
          </button>
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-xl border border-line/20 px-4 py-2 text-sm font-semibold text-heading hover:bg-tint/10"
          >
            <Home className="h-4 w-4" /> Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { isDark } = useThemeMode()
  const [active, setActive] = useState<ViewId>(viewFromHash)
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
  const activeRef = useRef<ViewId>(active)
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
  useEffect(() => onIdle(() => setWebgl(true), 1200), [])

  // Prefetch every dashboard chunk in the background after first load.
  useEffect(
    () =>
      onIdle(() => {
        Object.values(LOADERS).forEach((load) => {
          load().catch(() => {
            /* offline or mid-deploy — the view loads (or reports) on demand */
          })
        })
      }, 2500),
    [],
  )

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

  // Each view gets its own browser-tab title (also used by bookmarks & history).
  useEffect(() => {
    document.title =
      active === DEFAULT_VIEW ? BASE_TITLE : `${NAV_BY_ID[active].name} · NBG Health`
  }, [active])

  // The URL hash is the single source of truth for the current view, so a
  // refresh, the Back button and shared links all land on the right dashboard.
  useEffect(() => {
    const swap = () => {
      const id = viewFromHash()
      activeRef.current = id
      setActive(id)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    /** Curtain sweep between views; falls back to an instant swap. */
    const show = () => {
      if (viewFromHash() === activeRef.current || transitioning.current) return
      const curtain = curtainRef.current
      if (!motionOK() || !curtain) {
        swap()
        return
      }
      transitioning.current = true
      gsap
        .timeline({
          onComplete: () => {
            transitioning.current = false
            // The user picked another view mid-sweep: catch up with the URL.
            if (viewFromHash() !== activeRef.current) show()
          },
        })
        .set(curtain, { visibility: 'visible', clipPath: 'inset(100% 0% 0% 0%)' })
        .to(curtain, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.42,
          ease: 'power4.inOut',
        })
        .add(swap)
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

    window.addEventListener('hashchange', show)
    return () => window.removeEventListener('hashchange', show)
  }, [])

  const navigate = (id: ViewId) => {
    setMobileOpen(false)
    const hash = `#/${id}`
    if (window.location.hash !== hash) window.location.hash = hash
  }

  const View = VIEWS[active]

  return (
    <div
      className={`grain min-h-screen transition-[padding] duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}
    >
      {webgl && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <AuroraField isDark={isDark} />
          </Suspense>
        </ErrorBoundary>
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
          {/* Keyed per view: a failure is contained to this dashboard and
              clears as soon as the user navigates elsewhere. */}
          <ErrorBoundary key={active} fallback={<ViewError onHome={() => navigate('about')} />}>
            <Suspense fallback={<ViewLoading />}>
              <Reveal>
                <View onNavigate={navigate} />
              </Reveal>
            </Suspense>
          </ErrorBoundary>
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
