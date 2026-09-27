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
import { flushSync } from 'react-dom'
import { AlertTriangle, Home, RotateCw } from 'lucide-react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import Cursor from './components/Cursor'
import ErrorBoundary from './components/ErrorBoundary'
import { animateViewIn, gsap, motionOK } from './lib/motion'
import { NAV_BY_ID, type ViewId, type ViewProps } from './lib/dashboards'

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
  map: () => import('./views/HealthMap'),
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

/** Views whose code has finished downloading — these render with no loading flash. */
const READY: Partial<Record<ViewId, ComponentType<ViewProps>>> = {}
const preload = (id: ViewId): Promise<void> =>
  LOADERS[id]()
    .then((m) => {
      READY[id] = m.default
    })
    .catch(() => {
      /* offline or mid-deploy — the view reports it via its error boundary */
    })

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
        <h2 className="mt-3 text-title text-heading">
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
            className="inline-flex items-center gap-2 rounded-control bg-navy px-4 py-2 text-label text-white hover:bg-navy-600"
          >
            <RotateCw className="h-4 w-4" /> Reload
          </button>
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-control border border-line/20 px-4 py-2 text-label text-heading hover:bg-tint/10"
          >
            <Home className="h-4 w-4" /> Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState<ViewId>(viewFromHash)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nbg-sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })
  const mainRef = useRef<HTMLElement>(null)
  const activeRef = useRef<ViewId>(active)
  // The component chosen for each view is fixed on first use, so re-renders
  // (theme, sidebar) never swap lazy ↔ loaded and remount a page mid-use.
  const viewCache = useRef<Partial<Record<ViewId, ComponentType<ViewProps>>>>({})

  useEffect(() => {
    try {
      localStorage.setItem('nbg-sidebar-collapsed', collapsed ? '1' : '0')
    } catch {
      /* storage unavailable — collapse still applies for this session */
    }
  }, [collapsed])

  // Prefetch every dashboard chunk in the background after first load.
  useEffect(
    () =>
      onIdle(() => {
        ;(Object.keys(LOADERS) as ViewId[]).forEach((id) => void preload(id))
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
    let busy = false

    const swap = (id: ViewId) => {
      activeRef.current = id
      flushSync(() => setActive(id))
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    /**
     * Fade-through between views: the content area eases out (~0.2 s) while
     * the next view's code is confirmed loaded, then the new view's cards rise
     * in. Sidebar and header stay put. Instant under reduced motion.
     */
    const show = async () => {
      const id = viewFromHash()
      if (id === activeRef.current || busy) return
      busy = true
      const main = mainRef.current
      const animate = motionOK() && main !== null
      try {
        const ready = preload(id)
        if (animate) {
          await gsap.to(main, { autoAlpha: 0, y: -6, duration: 0.18, ease: 'power2.in' })
        }
        await ready
        swap(id)
        if (animate) {
          gsap.fromTo(
            main,
            { autoAlpha: 0, y: 0 },
            { autoAlpha: 1, duration: 0.22, ease: 'power2.out', clearProps: 'opacity,visibility,transform' },
          )
        }
      } finally {
        busy = false
        // The user picked another view mid-transition: catch up with the URL.
        if (viewFromHash() !== activeRef.current) void show()
      }
    }

    const onHash = () => void show()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (id: ViewId) => {
    setMobileOpen(false)
    const hash = `#/${id}`
    if (window.location.hash !== hash) window.location.hash = hash
  }

  const View = (viewCache.current[active] ??= READY[active] ?? VIEWS[active])

  return (
    <div
      className={`min-h-screen transition-[padding] duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}
    >
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
        <main ref={mainRef} className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
        {/* MOH template footer: ministry · document · directorate + page. */}
        <footer className="mx-4 flex flex-col items-center gap-1 border-t border-sky py-4 text-center text-[0.7rem] text-[#7c8ba0] dark:border-[rgb(var(--card-border))] dark:text-ink/55 sm:mx-6 sm:flex-row sm:justify-between sm:gap-4 sm:text-left lg:mx-8">
          <span>Ministry of Health — Sultanate of Oman</span>
          <span className="hidden md:inline">
            Women &amp; Child Health Department · Health Monitoring Dashboards 2023–2025
          </span>
          <span className="italic">
            DGHS · North Al Batinah · {NAV_BY_ID[active].short ?? NAV_BY_ID[active].name}
          </span>
        </footer>
      </div>

      {/* Mobile-only bottom navigation (replaces the slide-in drawer on phones) */}
      <BottomNav active={active} onSelect={navigate} />

      {/* First-run "Add to Home Screen" prompt for new visitors */}
      <InstallPrompt />
    </div>
  )
}
