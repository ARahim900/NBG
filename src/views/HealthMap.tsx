import { useMemo, useState, type KeyboardEvent } from 'react'
import {
  Building2,
  Crosshair,
  Map as MapIcon,
  MapPin,
  MapPinOff,
  Table2,
  Users,
  X,
} from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import {
  INSTITUTIONS,
  WILAYATS,
  aggregate,
  byWilayat,
  institutionsIn,
  targetGroups,
} from '../data/population'
import { ancRateGov, services } from '../data/services'
import { MAP, MAP_H, MAP_W, PINNED, SEATS, pinnedNames } from '../data/map'
import { useThemeMode } from '../lib/theme-mode'
import { useNarrow } from '../lib/useMediaQuery'
import { int, pct } from '../lib/format'

// ---- metrics ---------------------------------------------------------------
type MetricId = 'pop' | 'u5' | 'wra' | 'anc'

interface Metric {
  label: string
  long: string
  /** 'count' → sequential heat + sized circles; 'rate' → diverging vs benchmark. */
  kind: 'count' | 'rate'
  wilayat: (w: string) => number | null
  institution?: (en: string) => number
}

const inst = (en: string) => INSTITUTIONS.find((i) => i.en === en)
const wil = (w: string) => byWilayat.find((x) => x.wilayat === w)

const METRICS: Record<MetricId, Metric> = {
  pop: {
    label: 'Residents',
    long: 'All residents, Omani and expatriate (2025 estimate)',
    kind: 'count',
    wilayat: (w) => {
      const x = wil(w)
      return x ? x.omani + x.expat : null
    },
    institution: (en) => {
      const i = inst(en)
      return i ? targetGroups(aggregate([i], 'all')).total : 0
    },
  },
  u5: {
    label: 'Under 5',
    long: 'Omani children aged 0–4 (2025 estimate)',
    kind: 'count',
    wilayat: (w) => wil(w)?.om.under5 ?? null,
    institution: (en) => {
      const i = inst(en)
      return i ? targetGroups(aggregate([i], 'omani')).under5 : 0
    },
  },
  wra: {
    label: 'Women 15–49',
    long: 'Omani women aged 15–49 (2025 estimate)',
    kind: 'count',
    wilayat: (w) => wil(w)?.om.women15to49 ?? null,
    institution: (en) => {
      const i = inst(en)
      return i ? targetGroups(aggregate([i], 'omani')).women15to49 : 0
    },
  },
  anc: {
    label: 'ANC per 1,000',
    long: 'New antenatal registrations 2025 per 1,000 Omani women aged 15–49',
    kind: 'rate',
    wilayat: (w) => services.find((s) => s.wilayat === w)?.ancRate ?? null,
  },
}

const METRIC_OPTIONS = (Object.keys(METRICS) as MetricId[]).map((id) => ({
  value: id,
  label: METRICS[id].label,
}))

// ---- colour ----------------------------------------------------------------
// Sequential (magnitude): one hue, light → dark; the anchor flips in dark mode.
const SEQ_LIGHT = ['#dbeaf6', '#9cc6e8', '#5a9fd6', '#2a78bb', '#1a5a93', '#123f68']
const SEQ_DARK = ['#1a3452', '#23527e', '#2f74ad', '#4f98d4', '#80bdea', '#b9dcf6']
// Diverging (polarity vs benchmark): warm below, neutral grey at par, cool above.
const DIV_LIGHT = { below: '#b86e12', mid: '#98a3ae', above: '#1f6fab' }
const DIV_DARK = { below: '#e3a64a', mid: '#6b7785', above: '#7fb8e8' }

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = hex(a)
  const [br, bg, bb] = hex(b)
  const c = (x: number, y: number) => Math.round(x + (y - x) * t)
  return `rgb(${c(ar, br)},${c(ag, bg)},${c(ab, bb)})`
}
const ramp = (stops: string[], t: number): string => {
  const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1)
  const i = Math.min(Math.floor(x), stops.length - 2)
  return mix(stops[i], stops[i + 1], x - i)
}
/** Position of a rate against its benchmark, clamped to ±40 % → [-1, 1]. */
const divT = (v: number, benchmark: number) =>
  Math.max(-1, Math.min(1, (v / benchmark - 1) / 0.4))

/** Muscat Bay motion curve — smooth, no overshoot. */
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const STOP_EASE = { transition: `stop-color 500ms ${EASE}` }

const compact = (v: number): string =>
  v >= 1000 ? `${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k` : `${Math.round(v)}`
const r0 = Math.round

// ---- geometry --------------------------------------------------------------
const seatOf = (w: string) => SEATS.find((s) => s.wilayat === w)
const centresIn = (w: string) => institutionsIn(w).length

/** Map units per kilometre (1° latitude ≈ 111.32 km). */
const UNITS_PER_KM = MAP.projection.k / 111.32

/** Phones get a tighter crop of the same map so labels stay legible. */
const VIEW_FULL = [0, 0, MAP_W, MAP_H] as const
const VIEW_COMPACT = [120, 60, 880, 880] as const

/** Label to the right of a circle, or centred below it when it would run off the map. */
function labelSpot(x: number, y: number, rr: number, name: string, line2: string, right: number) {
  const width = Math.max(name.length * 17.5, line2.length * 13.5)
  if (x + rr + 14 + width <= right - 8) {
    return { x: x + rr + 14, y1: y - 4, y2: y + 28, anchor: 'start' as const }
  }
  return { x, y1: y + rr + 34, y2: y + rr + 64, anchor: 'middle' as const }
}

export default function HealthMap() {
  const { isDark } = useThemeMode()
  const narrow = useNarrow()
  const [vx, vy, vw, vh] = narrow ? VIEW_COMPACT : VIEW_FULL
  const [metricId, setMetricId] = useState<MetricId>('pop')
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const metric = METRICS[metricId]
  const focus = hovered ?? selected

  const values = useMemo(
    () =>
      WILAYATS.map((w) => ({ wilayat: w.en, ar: w.ar, value: metric.wilayat(w.en) })).filter(
        (x): x is { wilayat: string; ar: string; value: number } => x.value !== null,
      ),
    [metric],
  )
  const max = Math.max(...values.map((v) => v.value))

  const seq = isDark ? SEQ_DARK : SEQ_LIGHT
  const div = isDark ? DIV_DARK : DIV_LIGHT
  const fillFor = (v: number): string => {
    if (metric.kind === 'count') return ramp(seq, 0.25 + 0.75 * (v / max))
    const t = divT(v, ancRateGov)
    return t < 0 ? mix(div.mid, div.below, -t) : mix(div.mid, div.above, t)
  }

  // Heat points: verified facility pins carry their own catchment; anything
  // not yet pinned is pooled at the wilayat seat so totals are never lost.
  // Rate metrics have no density, so the glow keeps the residents layout and
  // fades out — the same elements persist, which lets every change animate.
  const heatMetric = metric.kind === 'count' ? metric : METRICS.pop
  const heat = useMemo(() => {
    const m = heatMetric
    if (!m.institution) return []
    const pts: { x: number; y: number; v: number }[] = []
    for (const w of WILAYATS) {
      const seat = seatOf(w.en)
      if (!seat) continue
      let rest = m.wilayat(w.en) ?? 0
      for (const p of PINNED.filter((f) => f.wilayat === w.en)) {
        const v = m.institution(p.en)
        pts.push({ x: p.x, y: p.y, v })
        rest -= v
      }
      if (rest > 0.5) pts.push({ x: seat.x, y: seat.y, v: rest })
    }
    return pts
  }, [heatMetric])
  const heatMax = Math.max(1, ...heat.map((h) => h.v))

  const radius = (v: number) =>
    metric.kind === 'count' ? 16 + 44 * Math.sqrt(v / max) : 30

  const fmt = (v: number) =>
    metric.kind === 'rate' ? `${v.toFixed(1)} /1,000` : compact(v)

  const toggle = (w: string) => setSelected((s) => (s === w ? null : w))
  const onKey = (w: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(w)
    }
  }

  // ---- side panel data ----
  const focusW = focus ? wil(focus) : null
  const focusCentres = focus
    ? institutionsIn(focus)
        .map((i) => ({
          en: i.en,
          ar: i.ar,
          total: targetGroups(aggregate([i], 'all')).total,
          pinned: pinnedNames.has(i.en),
        }))
        .sort((a, b) => b.total - a.total)
    : []
  const centreMax = Math.max(1, ...focusCentres.map((c) => c.total))
  const ranked = [...values].sort((a, b) => b.value - a.value)
  const govTotal = byWilayat.reduce((a, w) => a + w.omani + w.expat, 0)
  const govOmani = byWilayat.reduce((a, w) => a + w.omani, 0)

  const theme = isDark
    ? { sea: '#071a2e', sea2: '#0a2340', land: '#10243b', uae: '#0c1c2f', coast: '#3d6d9c', text: '#ebf3fd', sub: '#9fb8d3', ring: '#0c1c30' }
    : { sea: '#e4f0fa', sea2: '#cfe3f3', land: '#ffffff', uae: '#eef1f4', coast: '#7fa6c9', text: '#103454', sub: '#51667a', ring: '#ffffff' }

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={MapIcon}
        title="North Batinah Health Map"
        subtitle={`${INSTITUTIONS.length} health institutions across ${WILAYATS.length} wilayat — catchment populations from the 2025 estimates`}
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard label="Health institutions" value={int(INSTITUTIONS.length)} icon={Building2} accent="navy" hint="Catchments in the 2025 estimates" />
        <KpiCard label="Residents served" value={int(r0(govTotal))} icon={Users} accent="azure" hint={`${pct((govOmani / govTotal) * 100)} Omani`} />
        <KpiCard
          label="Average catchment"
          value={int(r0(govTotal / INSTITUTIONS.length))}
          icon={Crosshair}
          accent="teal"
          hint="Residents per institution"
        />
        <KpiCard
          label="Centres with verified location"
          value={`${PINNED.length} / ${INSTITUTIONS.length}`}
          icon={MapPin}
          accent="gold"
          hint={PINNED.length ? 'Pinned on the map' : 'Awaiting coordinates'}
        />
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
        <Segmented label="Show on map" options={METRIC_OPTIONS} value={metricId} onChange={setMetricId} />
        <p className="max-w-md text-xs text-ink/65">{metric.long}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* ===== Map ===== */}
        <section className="card overflow-hidden p-0 xl:col-span-3" aria-label="Map of North Batinah">
          <div className="relative">
            <svg
              viewBox={`${vx} ${vy} ${vw} ${vh}`}
              className="block h-auto w-full select-none"
              role="group"
              aria-label={`Map: ${metric.long}, by wilayat`}
            >
              <defs>
                <linearGradient id="nbg-sea" x1="1" y1="0" x2="0.3" y2="1">
                  <stop offset="0%" stopColor={theme.sea2} />
                  <stop offset="100%" stopColor={theme.sea} />
                </linearGradient>
                <clipPath id="nbg-land">
                  <path d={MAP.oman.fill} />
                </clipPath>
                {heat.map((h, i) => {
                  const c = ramp(seq, 0.35 + 0.65 * (h.v / heatMax))
                  return (
                    <radialGradient key={i} id={`nbg-heat-${i}`}>
                      <stop offset="0%" stopOpacity={isDark ? 0.75 : 0.62} style={{ stopColor: c, ...STOP_EASE }} />
                      <stop offset="45%" stopOpacity={isDark ? 0.34 : 0.26} style={{ stopColor: c, ...STOP_EASE }} />
                      <stop offset="100%" stopOpacity={0} style={{ stopColor: c }} />
                    </radialGradient>
                  )
                })}
              </defs>

              <rect width={MAP_W} height={MAP_H} fill="url(#nbg-sea)" />
              <path d={MAP.uae.fill} fill={theme.uae} />
              <path d={MAP.oman.fill} fill={theme.land} />

              {/* Heat layer — clipped to land, where people actually live */}
              <g
                clipPath="url(#nbg-land)"
                style={{
                  mixBlendMode: isDark ? 'screen' : 'multiply',
                  opacity: metric.kind === 'count' ? 1 : 0,
                  transition: `opacity 400ms ${EASE}`,
                }}
              >
                {heat.map((h, i) => (
                  <circle
                    key={i}
                    cx={h.x}
                    cy={h.y}
                    style={{ r: 70 + 190 * Math.sqrt(h.v / heatMax), transition: `r 600ms ${EASE}` }}
                    fill={`url(#nbg-heat-${i})`}
                  />
                ))}
              </g>

              <path d={MAP.uae.edge} fill="none" stroke={theme.coast} strokeWidth={1.5} strokeDasharray="6 5" />
              <path d={MAP.oman.edge} fill="none" stroke={theme.coast} strokeWidth={2} />

              <text x={narrow ? 132 : 150} y={narrow ? 112 : 70} fontSize={26} fontWeight={600} fill={theme.sub} letterSpacing={3}>
                UAE
              </text>
              <text
                x={narrow ? 720 : 735}
                y={narrow ? 250 : 420}
                fontSize={28}
                fontStyle="italic"
                fill={theme.sub}
                letterSpacing={4}
                opacity={0.85}
              >
                Gulf of Oman
              </text>

              {/* Scale bar (20 km) and north arrow, bottom-left over land */}
              <g transform={`translate(${vx + 36} ${vy + vh - 44})`} fill={theme.sub} stroke={theme.sub}>
                <path d={`M0,0 H${20 * UNITS_PER_KM}`} strokeWidth={3} />
                <path d={`M0,-8 V0 M${10 * UNITS_PER_KM},-5 V0 M${20 * UNITS_PER_KM},-8 V0`} strokeWidth={2} />
                <text x={0} y={-16} fontSize={22} stroke="none">0</text>
                <text x={20 * UNITS_PER_KM} y={-16} fontSize={22} stroke="none" textAnchor="middle">20 km</text>
                <g transform="translate(0 -80)">
                  <path d="M0,-26 L10,6 L0,0 L-10,6 Z" stroke="none" />
                  <text x={0} y={30} fontSize={22} fontWeight={700} stroke="none" textAnchor="middle">N</text>
                </g>
              </g>

              {/* Verified health-centre positions */}
              {PINNED.map((p) => (
                <g key={p.en}>
                  <circle cx={p.x} cy={p.y} r={7} fill={theme.text} stroke={theme.ring} strokeWidth={2.5} />
                  <title>{`${p.en} (${p.wilayat})`}</title>
                </g>
              ))}

              {/* Wilayat circles: size & colour = metric; label = name, value, centres */}
              {values.map(({ wilayat, value }) => {
                const seat = seatOf(wilayat)
                if (!seat) return null
                const rr = radius(value)
                const on = focus === wilayat
                const dim = focus !== null && !on
                const n = centresIn(wilayat)
                return (
                  <g
                    key={wilayat}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected === wilayat}
                    aria-label={`${wilayat}: ${fmt(value)}, ${n} health institutions`}
                    className="cursor-pointer outline-none"
                    opacity={dim ? 0.45 : 1}
                    onClick={() => toggle(wilayat)}
                    onKeyDown={onKey(wilayat)}
                    onMouseEnter={() => setHovered(wilayat)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(wilayat)}
                    onBlur={() => setHovered(null)}
                    style={{ transition: 'opacity 200ms' }}
                  >
                    {/* generous invisible hit target */}
                    <circle cx={seat.x} cy={seat.y} r={Math.max(rr, 34) + 10} fill="transparent" />
                    {/* Size and colour are set as CSS properties (not SVG
                        attributes) so the browser animates metric changes. */}
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      fillOpacity={0.9}
                      stroke={on ? theme.text : theme.ring}
                      style={{
                        r: rr,
                        fill: fillFor(value),
                        strokeWidth: on ? 4 : 2.5,
                        transition: `r 500ms ${EASE}, fill 400ms ${EASE}, stroke-width 200ms ${EASE}`,
                      }}
                    />
                    <circle cx={seat.x} cy={seat.y} r={4} fill={theme.ring} />
                    {(() => {
                      const line2 = `${fmt(value)} · ${n} centres`
                      const at = labelSpot(seat.x, seat.y, rr, wilayat, line2, vx + vw)
                      // Positioned by a CSS transform so the label glides with its circle.
                      return (
                        <g
                          style={{
                            transform: `translate(${at.x}px, ${at.y1}px)`,
                            transition: `transform 500ms ${EASE}`,
                          }}
                        >
                          <text textAnchor={at.anchor} fontSize={30} fontWeight={700} fill={theme.text}>
                            {wilayat}
                          </text>
                          <text y={at.y2 - at.y1} textAnchor={at.anchor} fontSize={25} fill={theme.sub}>
                            {line2}
                          </text>
                        </g>
                      )
                    })()}
                  </g>
                )
              })}
            </svg>

            {/* Legend — floats over the sea on wider screens */}
            <div className="border-t border-line/10 p-3 text-xs sm:absolute sm:right-3 sm:top-3 sm:w-56 sm:rounded-xl sm:border sm:bg-surface/85 sm:shadow-card sm:backdrop-blur">
              <p className="font-semibold text-heading">{metric.label}</p>
              {metric.kind === 'count' ? (
                <>
                  <div
                    className="mt-1.5 h-2.5 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${ramp(seq, 0.25)}, ${ramp(seq, 1)})` }}
                  />
                  <div className="mt-1 flex justify-between text-[0.7rem] text-ink/65">
                    <span>{compact(Math.min(...values.map((v) => v.value)))}</span>
                    <span>{compact(max)}</span>
                  </div>
                  <p className="mt-1.5 text-[0.7rem] text-ink/65">
                    Circle size and colour show the wilayat total; the glow shows where
                    that population sits.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="mt-1.5 h-2.5 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${div.below}, ${div.mid}, ${div.above})` }}
                  />
                  <div className="mt-1 flex justify-between text-[0.7rem] text-ink/65">
                    <span>Below</span>
                    <span>Gov. {ancRateGov.toFixed(1)}</span>
                    <span>Above</span>
                  </div>
                </>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] text-ink/65">
                {PINNED.length ? (
                  <>
                    <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-surface bg-heading" />
                    Health centre (verified position)
                  </>
                ) : (
                  <>
                    <MapPinOff className="h-3.5 w-3.5" />
                    Centre pins appear once coordinates are verified
                  </>
                )}
              </p>
            </div>
          </div>
          <p className="border-t border-line/10 px-4 py-2 text-[0.68rem] text-ink/60">
            Circles sit at each wilayat's seat town, not at a boundary centre. Coastline:
            Natural Earth (public domain) · Town positions: GeoNames (CC BY 4.0).
          </p>
        </section>

        {/* ===== Details panel ===== */}
        <section className="card flex flex-col p-5 xl:col-span-2" aria-live="polite">
          <div key={focus ?? 'all'} className="flex animate-fade-in flex-col">
          {focus && focusW ? (
            <>
              <header className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-title text-heading">{focus}</h3>
                  <p lang="ar" dir="rtl" className="font-ar text-sm text-ink/60">
                    {focusW.wilayatAr}
                  </p>
                </div>
                {selected && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-1 rounded-control border border-line/15 px-2 py-1 text-label text-heading hover:bg-tint/10"
                  >
                    <X className="h-3.5 w-3.5" /> All wilayat
                  </button>
                )}
              </header>
              <dl className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  ['Residents', int(r0(focusW.omani + focusW.expat))],
                  ['Omani', pct((focusW.omani / (focusW.omani + focusW.expat)) * 100)],
                  ['Health institutions', String(focusCentres.length)],
                  [metric.label, fmt(metric.wilayat(focus) ?? 0)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-control bg-mist/60 px-3 py-2">
                    <dt className="text-eyebrow uppercase text-ink/60">{k}</dt>
                    <dd className="mt-0.5 text-title tabular-nums text-heading">{v}</dd>
                  </div>
                ))}
              </dl>
              <h4 className="mt-5 text-eyebrow uppercase text-heading/75">
                Health institutions · catchment residents
              </h4>
              <ul className="mt-2 space-y-2">
                {focusCentres.map((c) => (
                  <li key={c.en}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-1.5">
                        {c.pinned ? (
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-azure" aria-label="Location verified" />
                        ) : (
                          <MapPinOff className="h-3.5 w-3.5 shrink-0 text-ink/35" aria-label="Location pending" />
                        )}
                        <span className="truncate font-medium text-ink">{c.en}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-heading">{int(r0(c.total))}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-mist">
                      <div
                        className="h-full rounded-full bg-azure/70 transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ width: `${(c.total / centreMax) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h3 className="text-title text-heading">All wilayat</h3>
              <p className="text-xs text-ink/60">
                Ranked by {metric.label.toLowerCase()} · select a wilayat for its health centres
              </p>
              <ul className="mt-4 space-y-1.5">
                {ranked.map((v) => (
                  <li key={v.wilayat}>
                    <button
                      type="button"
                      onClick={() => setSelected(v.wilayat)}
                      onMouseEnter={() => setHovered(v.wilayat)}
                      onMouseLeave={() => setHovered(null)}
                      className="w-full rounded-control px-2.5 py-2 text-left transition-colors hover:bg-tint/[0.07]"
                    >
                      <span className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-semibold text-ink">
                          {v.wilayat}
                          <span className="ml-2 text-xs font-normal text-ink/55">
                            {centresIn(v.wilayat)} centres
                          </span>
                        </span>
                        <span className="font-semibold tabular-nums text-heading">
                          {metric.kind === 'rate' ? v.value.toFixed(1) : int(r0(v.value))}
                        </span>
                      </span>
                      <span className="mt-1 block h-1.5 rounded-full bg-mist">
                        <span
                          className="block h-full rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                          style={{ width: `${(v.value / max) * 100}%`, backgroundColor: fillFor(v.value) }}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          </div>
        </section>
      </div>

      {/* ===== Table view (accessible alternative to the map) ===== */}
      <div>
        <SectionTitle icon={Table2} title="Wilayat Summary" subtitle="The figures behind the map" />
        <ChartCard title="Health Institutions & Population by Wilayat (2025)" subtitle="Sorted north to south along the coast">
          <DataTable
            dense
            columns={[
              { label: 'Wilayat' },
              { label: 'Institutions', align: 'right' },
              { label: 'Residents', align: 'right' },
              { label: 'Omani', align: 'right' },
              { label: 'Omani under 5', align: 'right' },
              { label: 'Omani women 15–49', align: 'right' },
              { label: 'ANC /1,000', align: 'right' },
              { label: 'Located', align: 'right' },
            ]}
            rows={SEATS.map((s) => {
              const w = wil(s.wilayat)
              const sv = services.find((x) => x.wilayat === s.wilayat)
              const n = centresIn(s.wilayat)
              const located = institutionsIn(s.wilayat).filter((i) => pinnedNames.has(i.en)).length
              return [
                s.wilayat,
                int(n),
                w ? int(r0(w.omani + w.expat)) : '—',
                w ? int(r0(w.omani)) : '—',
                w ? int(r0(w.om.under5)) : '—',
                w ? int(r0(w.om.women15to49)) : '—',
                sv?.ancRate != null ? sv.ancRate.toFixed(1) : '—',
                `${located} / ${n}`,
              ]
            })}
            total={[
              'GOVERNORATE',
              int(INSTITUTIONS.length),
              int(r0(govTotal)),
              int(r0(govOmani)),
              int(r0(byWilayat.reduce((a, w) => a + w.om.under5, 0))),
              int(r0(byWilayat.reduce((a, w) => a + w.om.women15to49, 0))),
              ancRateGov.toFixed(1),
              `${PINNED.length} / ${INSTITUTIONS.length}`,
            ]}
          />
          <div className="mt-3">
            <Note tone={PINNED.length < INSTITUTIONS.length ? 'warn' : 'info'} title="Health-centre locations:">
              {PINNED.length === 0
                ? 'no verified coordinates have been supplied yet, so health centres are listed by wilayat rather than pinned. '
                : `${PINNED.length} of ${INSTITUTIONS.length} centres are pinned from verified coordinates. `}
              Positions are never estimated: a centre is pinned only when its latitude and
              longitude come from a confirmed source (for example the MOH facility register).
            </Note>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
