import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { C, SERIES } from '../../lib/theme'
import { useThemeMode } from '../../lib/theme-mode'
import { useNarrow } from '../../lib/useMediaQuery'

export interface Series {
  key: string
  name: string
  color: string
}

/** Any plain object row; chart libraries read keys dynamically. */
type Datum = object

// ---- shared tooltip ------------------------------------------------------
interface TipItem {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
}
interface TipProps {
  active?: boolean
  label?: string | number
  payload?: TipItem[]
  unit?: string
  formatter?: (v: number) => string
}

function ChartTooltip({ active, label, payload, unit, formatter }: TipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-[4px] border border-[rgb(var(--card-border))] bg-surface px-3 py-2 shadow-card">
      {label !== undefined && <p className="mb-1 text-xs font-bold text-heading">{label}</p>}
      <ul className="space-y-0.5">
        {payload.map((item, i) => {
          const v = typeof item.value === 'number' ? item.value : Number(item.value)
          return (
            <li key={i} className="flex items-center gap-2 text-xs text-ink/75">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium">{item.name}</span>
              <span className="ml-auto font-bold text-ink">
                {formatter ? formatter(v) : v.toLocaleString('en-US')}
                {unit ?? ''}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const legendStyle = { fontSize: 12, paddingTop: 8 }

/**
 * Charts never animate: a bar growing from zero or a line drawing in shows
 * values that are not the data, and a screenshot or printout taken mid-way
 * would be wrong. They render at their final state immediately.
 */
const STATIC = { isAnimationActive: false } as const

/** Tooltip follows the pointer quickly and never lingers. */
const TIP = { animationDuration: 120 } as const

// ---- frame: screen-reader summary + tooltip that always dismisses ---------
/**
 * Recharts can leave a tooltip on screen when the pointer leaves without a
 * mouseleave (fast exits, scrolling, touch). The frame tracks whether the
 * pointer is really over the chart and forces the tooltip off otherwise: it
 * hides on pointer exit, on scroll, and on a tap anywhere else.
 */
function ChartFrame({
  summary,
  children,
}: {
  /** Plain-language description read by screen readers (the chart is an image to them). */
  summary: string
  children: (tooltipActive: false | undefined) => ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [over, setOver] = useState(false)
  useEffect(() => {
    if (!over) return
    const off = () => setOver(false)
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) off()
    }
    window.addEventListener('scroll', off, { passive: true })
    document.addEventListener('pointerdown', outside)
    return () => {
      window.removeEventListener('scroll', off)
      document.removeEventListener('pointerdown', outside)
    }
  }, [over])
  const enter = () => setOver(true)
  return (
    <div
      ref={ref}
      role="img"
      aria-label={summary}
      onPointerEnter={enter}
      onPointerMove={enter}
      onPointerDown={enter}
      // A finger "leaves" as soon as it lifts; keep the tapped tooltip until
      // the next scroll or tap elsewhere.
      onPointerLeave={(e) => e.pointerType !== 'touch' && setOver(false)}
    >
      {children(over ? undefined : false)}
    </div>
  )
}

/** "2019 82.8%, 2020 85.1%, …" — the data itself, capped for very long series. */
function describeSeries(
  data: Datum[],
  xKey: string,
  s: Series,
  fmt: (v: number) => string,
  max = 24,
): string {
  const rows = data as Record<string, unknown>[]
  const parts = rows
    .filter((d) => typeof d[s.key] === 'number')
    .map((d) => `${String(d[xKey])} ${fmt(d[s.key] as number)}`)
  const shown = parts.slice(0, max).join(', ')
  return `${s.name}: ${shown}${parts.length > max ? `, and ${parts.length - max} more` : ''}`
}

const plain = (unit?: string, valueFormatter?: (v: number) => string) => (v: number) =>
  valueFormatter
    ? valueFormatter(v)
    : `${v.toLocaleString('en-US', { maximumFractionDigits: 1 })}${unit ?? ''}`

// ---- even axis ticks --------------------------------------------------------
/** Round a raw step up to 1, 2, 2.5 or 5 × 10ⁿ so ticks fall on even values. */
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1
  const p = 10 ** Math.floor(Math.log10(raw))
  const f = raw / p
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p
}

/**
 * Evenly spaced value axis covering [lo, hi] in about five steps, e.g.
 * 0, 20, 40, 60, 80, 100 — never 70, 78, 86, 100.
 */
function evenAxis(lo: number, hi: number): { domain: [number, number]; ticks: number[] } {
  const step = niceStep((hi - lo) / 5)
  const start = Math.floor(lo / step) * step
  const end = Math.max(Math.ceil(hi / step) * step, start + step)
  const ticks: number[] = []
  for (let t = start; t <= end + step / 1e6; t += step) ticks.push(Number(t.toFixed(6)))
  return { domain: [start, end], ticks }
}

/** Every numeric value the listed series plot. */
function seriesValues(data: Datum[], series: Series[]): number[] {
  const out: number[] = []
  for (const d of data as Record<string, unknown>[]) {
    for (const s of series) {
      const v = d[s.key]
      if (typeof v === 'number' && Number.isFinite(v)) out.push(v)
    }
  }
  return out
}

interface ChartTheme {
  axisTick: { fontSize: number; fill: string }
  cursorFill: string
  sliceStroke: string
  /** Subtle baseline under the category axis (no full gridlines). */
  axisLine: string
  /** Value labels sat on top of bars / points. */
  dataLabel: string
  /** Bold category names / percentages on the donut + its legend. */
  donutName: string
  /** Series colour adjusted for the theme (brand navy is invisible on dark). */
  paint: (color: string) => string
}

/** Lighter stand-in for brand navy on the dark canvas (contrast ≥ 3:1). */
const NAVY_ON_DARK = '#9bbfe8'

/** Theme-aware chart chrome: axis ticks, hover cursor, slice gaps and data labels. */
function useChartTheme(): ChartTheme {
  const { isDark } = useThemeMode()
  return {
    axisTick: { fontSize: 12, fill: isDark ? '#8fb3da' : '#6b7a88' },
    cursorFill: isDark ? 'rgba(124,182,188,0.08)' : 'rgba(20,64,102,0.05)',
    sliceStroke: isDark ? '#0c1c30' : '#ffffff',
    axisLine: isDark ? '#1d3a5c' : '#dbe5ee',
    dataLabel: isDark ? '#c7d7ea' : '#41617d',
    donutName: isDark ? '#ebf3fd' : '#144066',
    paint: (color) => (isDark && color === C.navy ? NAVY_ON_DARK : color),
  }
}

/** Compact numeric axis ticks: 150000 → 150k. */
const compactTick = (v: number): string => {
  const a = Math.abs(v)
  return a >= 1000 ? `${(v / 1000).toFixed(a % 1000 === 0 ? 0 : 1)}k` : `${v}`
}

/** Format a value sat on top of a bar / point. Labels are always whole numbers
 *  (no decimals) to keep charts clean; large counts compact to "k". A caller's
 *  valueFormatter still wins when it needs bespoke formatting. */
function formatDataLabel(
  v: number | string | undefined,
  unit?: string,
  valueFormatter?: (v: number) => string,
): string {
  if (v === undefined || v === null || v === '') return ''
  const n = typeof v === 'number' ? v : Number(v)
  if (Number.isNaN(n)) return String(v)
  if (valueFormatter) return valueFormatter(n)
  const r = Math.round(n)
  if (unit === '%') return `${r}%`
  if (Math.abs(r) >= 10000) return `${(r / 1000).toFixed(r % 1000 === 0 ? 0 : 1)}k`
  return r.toLocaleString('en-US')
}

// ---- Trend (line or area) ------------------------------------------------
interface TrendProps {
  data: Datum[]
  xKey: string
  series: Series[]
  height?: number
  unit?: string
  variant?: 'line' | 'area'
  /**
   * Requested value range. Area charts always start at zero (a shaded area
   * cut off above zero exaggerates change). A line chart may start higher to
   * zoom in; the chart then says so under the plot.
   */
  yDomain?: [number, number]
  valueFormatter?: (v: number) => string
  showLegend?: boolean
}

export function TrendChart({
  data,
  xKey,
  series,
  height = 260,
  unit,
  variant = 'line',
  yDomain,
  valueFormatter,
  showLegend = true,
}: TrendProps) {
  const { axisTick, axisLine, dataLabel, paint } = useChartTheme()
  // Single-series trends get a tidy value sat above each point; multi-series
  // stays label-free (rely on the tooltip) to avoid overlapping figures.
  const showValues = series.length === 1
  const labelStyle = { fontSize: 10, fontWeight: 600, fill: dataLabel } as const

  const vals = seriesValues(data, series)
  const dataMin = vals.length ? Math.min(...vals) : 0
  const dataMax = vals.length ? Math.max(...vals) : 1
  const floor = variant === 'area' ? 0 : Math.max(0, Math.min(yDomain?.[0] ?? 0, dataMin))
  const axis = evenAxis(floor, Math.max(yDomain?.[1] ?? 0, dataMax))
  const zoomed = axis.domain[0] > 0
  const yAxisProps = {
    tick: axisTick,
    tickLine: false,
    axisLine: false,
    domain: axis.domain,
    ticks: axis.ticks,
    interval: 0 as const,
    width: 44,
    tickFormatter: compactTick,
  }
  const fmt = plain(unit, valueFormatter)
  const summary = `${variant === 'area' ? 'Area' : 'Line'} chart. ${series
    .map((s) => describeSeries(data, xKey, s, fmt))
    .join('. ')}.${zoomed ? ` Value axis starts at ${fmt(axis.domain[0])}.` : ''}`

  return (
    <>
      <ChartFrame summary={summary}>
        {(tooltipActive) => (
          <ResponsiveContainer width="100%" height={height}>
            {variant === 'area' ? (
              <AreaChart data={data} margin={{ top: 18, right: 12, left: -8, bottom: 0 }}>
                <XAxis
                  dataKey={xKey}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={{ stroke: axisLine }}
                />
                <YAxis {...yAxisProps} />
                <Tooltip
                  {...TIP}
                  active={tooltipActive}
                  content={<ChartTooltip unit={unit} formatter={valueFormatter} />}
                />
                {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
                {series.map((sdef) => (
                  <Area
                    {...STATIC}
                    key={sdef.key}
                    type="monotone"
                    dataKey={sdef.key}
                    name={sdef.name}
                    stroke={paint(sdef.color)}
                    strokeWidth={2.5}
                    fill={paint(sdef.color)}
                    fillOpacity={0.12}
                    dot={{ r: 2.5, strokeWidth: 0, fill: paint(sdef.color) }}
                    activeDot={{ r: 4.5 }}
                  >
                    {showValues && (
                      <LabelList
                        dataKey={sdef.key}
                        position="top"
                        offset={10}
                        style={labelStyle}
                        formatter={(v: number) => formatDataLabel(v, unit, valueFormatter)}
                      />
                    )}
                  </Area>
                ))}
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 18, right: 12, left: -8, bottom: 0 }}>
                <XAxis
                  dataKey={xKey}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={{ stroke: axisLine }}
                />
                <YAxis {...yAxisProps} />
                <Tooltip
                  {...TIP}
                  active={tooltipActive}
                  content={<ChartTooltip unit={unit} formatter={valueFormatter} />}
                />
                {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
                {series.map((sdef) => (
                  <Line
                    {...STATIC}
                    key={sdef.key}
                    type="monotone"
                    dataKey={sdef.key}
                    name={sdef.name}
                    stroke={paint(sdef.color)}
                    strokeWidth={2.5}
                    dot={{ r: 2.5, strokeWidth: 0, fill: paint(sdef.color) }}
                    activeDot={{ r: 5 }}
                  >
                    {showValues && (
                      <LabelList
                        dataKey={sdef.key}
                        position="top"
                        offset={10}
                        style={labelStyle}
                        formatter={(v: number) => formatDataLabel(v, unit, valueFormatter)}
                      />
                    )}
                  </Line>
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </ChartFrame>
      {zoomed && (
        <p className="mt-1 text-caption text-ink/60">
          Zoomed scale: the value axis starts at {fmt(axis.domain[0])}, not zero.
        </p>
      )}
    </>
  )
}

// ---- Comparison bars -----------------------------------------------------
interface BarsProps {
  data: Datum[]
  xKey: string
  series: Series[]
  height?: number
  unit?: string
  stacked?: boolean
  layout?: 'horizontal' | 'vertical'
  valueFormatter?: (v: number) => string
  showLegend?: boolean
  /** Width reserved for category labels in vertical layout (long names need more). */
  categoryWidth?: number
}

export function ComparisonBars({
  data,
  xKey,
  series,
  height = 280,
  unit,
  stacked = false,
  layout = 'horizontal',
  valueFormatter,
  showLegend = true,
  categoryWidth = 92,
}: BarsProps) {
  const vertical = layout === 'vertical'
  const { axisTick, axisLine, cursorFill, dataLabel, paint } = useChartTheme()
  const narrow = useNarrow()
  // Grouped bars carry their figure at the bar tip and drop the numeric axis;
  // stacked bars keep the axis (per-segment labels would collide). On phones,
  // side-by-side columns are too narrow for their labels, so those charts show
  // a light axis instead and the tooltip gives exact values.
  const crowded = narrow && !vertical && series.length > 1 && data.length > 3
  const showValues = !stacked && !crowded
  // Phones: angle the category labels so every one shows (none are skipped).
  const tiltTicks = narrow && !vertical && data.length > 4
  const labelStyle = { fontSize: 10, fontWeight: 600, fill: dataLabel } as const
  const fmt = plain(unit, valueFormatter)
  const summary = `${stacked ? 'Stacked bar' : 'Bar'} chart. ${series
    .map((s) => describeSeries(data, xKey, s, fmt))
    .join('. ')}.`
  return (
    <ChartFrame summary={summary}>
      {(tooltipActive) => (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout={layout}
            margin={{ top: 16, right: vertical ? 36 : 12, left: vertical ? 8 : -8, bottom: 0 }}
            barGap={stacked ? 0 : 3}
            barCategoryGap={vertical ? '22%' : '28%'}
          >
            {vertical ? (
              <>
                <XAxis
                  type="number"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  hide={showValues}
                  tickFormatter={compactTick}
                />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={{ stroke: axisLine }}
                  width={categoryWidth}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xKey}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={{ stroke: axisLine }}
                  {...(tiltTicks ? { interval: 0, angle: -35, textAnchor: 'end', height: 58 } : {})}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  hide={showValues}
                  tickFormatter={compactTick}
                />
              </>
            )}
            <Tooltip
              {...TIP}
              active={tooltipActive}
              cursor={{ fill: cursorFill }}
              content={<ChartTooltip unit={unit} formatter={valueFormatter} />}
            />
            {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
            {series.map((sdef) => (
              <Bar
                {...STATIC}
                key={sdef.key}
                dataKey={sdef.key}
                name={sdef.name}
                fill={paint(sdef.color)}
                stackId={stacked ? 'a' : undefined}
                radius={stacked ? [0, 0, 0, 0] : vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                maxBarSize={vertical ? 22 : 46}
              >
                {showValues && (
                  <LabelList
                    dataKey={sdef.key}
                    position={vertical ? 'right' : 'top'}
                    offset={6}
                    style={labelStyle}
                    formatter={(v: number) => formatDataLabel(v, unit, valueFormatter)}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  )
}

// ---- Population pyramid --------------------------------------------------
interface PyramidProps {
  /** One row per age band, youngest first. Male series are plotted leftwards. */
  data: Datum[]
  bandKey: string
  male: Series[]
  female: Series[]
  height?: number
}

/**
 * Horizontal back-to-back bars: males to the left of the axis, females to the
 * right, each side optionally stacked by nationality. Values are passed as
 * positive numbers; the component negates the male side itself.
 */
export function PyramidChart({ data, bandKey, male, female, height = 440 }: PyramidProps) {
  const { axisTick, axisLine, cursorFill, paint } = useChartTheme()
  const maleKeys = new Set(male.map((s) => s.key))
  // Oldest band on top, as in a conventional pyramid.
  const rows = [...data].reverse().map((d) => {
    const r: Record<string, number | string> = { ...(d as Record<string, number | string>) }
    maleKeys.forEach((k) => {
      r[k] = -Number(r[k] ?? 0)
    })
    return r
  })
  const total = (s: Series) =>
    (data as Record<string, unknown>[]).reduce((a, d) => a + (Number(d[s.key]) || 0), 0)
  const summary = `Population pyramid by age band, males left and females right. ${[
    ...male,
    ...female,
  ]
    .map((s) => `${s.name}: ${Math.round(total(s)).toLocaleString('en-US')}`)
    .join(', ')}.`
  return (
    <ChartFrame summary={summary}>
      {(tooltipActive) => (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={rows}
            layout="vertical"
            stackOffset="sign"
            barCategoryGap="12%"
            margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: axisLine }}
              tickFormatter={(v: number) => compactTick(Math.abs(v))}
            />
            <YAxis
              type="category"
              dataKey={bandKey}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              {...TIP}
              active={tooltipActive}
              cursor={{ fill: cursorFill }}
              content={
                <ChartTooltip formatter={(v) => Math.round(Math.abs(v)).toLocaleString('en-US')} />
              }
            />
            <Legend wrapperStyle={legendStyle} />
            {[...male, ...female].map((sdef) => (
              <Bar
                {...STATIC}
                key={sdef.key}
                dataKey={sdef.key}
                name={sdef.name}
                fill={paint(sdef.color)}
                stackId="pyramid"
                maxBarSize={18}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  )
}

// ---- Donut ---------------------------------------------------------------
export interface Slice {
  name: string
  value: number
  color?: string
}
interface DonutProps {
  data: Slice[]
  height?: number
  unit?: string
  valueFormatter?: (v: number) => string
  innerRadius?: number
  outerRadius?: number
}

const RADIAN = Math.PI / 180

export function DonutChart({
  data,
  height = 250,
  unit,
  valueFormatter,
  innerRadius,
  outerRadius,
}: DonutProps) {
  const { sliceStroke, donutName, paint } = useChartTheme()
  // Scale the ring with the card height so the donut fills taller cards
  // (paired with bar charts) instead of floating with empty space.
  const outer = outerRadius ?? Math.min(Math.max(Math.round(height * 0.33), 72), 104)
  const inner = innerRadius ?? Math.round(outer * 0.64)

  // Only the % share sits around the ring — it is always short, so it never
  // clips regardless of card width. Category names live in the legend below,
  // which handles any label length cleanly.
  const renderLabel = (props: PieLabelRenderProps) => {
    const cx = Number(props.cx)
    const cy = Number(props.cy)
    const mid = Number(props.midAngle ?? 0)
    const or = Number(props.outerRadius ?? 0)
    const pct = Number(props.percent ?? 0)
    if (pct < 0.02) return null // skip a vanishingly small sliver to avoid overlap
    const r = or + 13
    const x = cx + r * Math.cos(-mid * RADIAN)
    const y = cy + r * Math.sin(-mid * RADIAN)
    const anchor = x >= cx ? 'start' : 'end'
    return (
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={donutName}
      >
        {`${Math.round(pct * 100)}%`}
      </text>
    )
  }

  const sum = data.reduce((a, d) => a + d.value, 0) || 1
  const fmt = plain(unit, valueFormatter)
  const summary = `Donut chart. ${data
    .map((d) => `${d.name}: ${fmt(d.value)} (${Math.round((d.value / sum) * 100)}%)`)
    .join(', ')}.`
  return (
    <ChartFrame summary={summary}>
      {(tooltipActive) => (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
            <Pie
              {...STATIC}
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={inner}
              outerRadius={outer}
              paddingAngle={1.5}
              stroke={sliceStroke}
              strokeWidth={2}
              minAngle={4}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((slice, i) => (
                <Cell key={i} fill={paint(slice.color ?? SERIES[i % SERIES.length])} />
              ))}
            </Pie>
            <Tooltip
              {...TIP}
              active={tooltipActive}
              content={<ChartTooltip unit={unit} formatter={valueFormatter} />}
            />
            <Legend
              iconType="circle"
              iconSize={9}
              wrapperStyle={legendStyle}
              formatter={(value) => <span style={{ color: donutName, fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  )
}
