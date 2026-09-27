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
      {label !== undefined && (
        <p className="mb-1 text-xs font-bold text-heading">{label}</p>
      )}
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

/** One calm animation for every chart: draws in, and morphs when data changes. */
const MOTION = { animationDuration: 700, animationEasing: 'ease-out' } as const

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
  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === 'area' ? (
        <AreaChart data={data} margin={{ top: 18, right: 12, left: -8, bottom: 0 }}>
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: axisLine }} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={yDomain} width={44} tickFormatter={compactTick} />
          <Tooltip content={<ChartTooltip unit={unit} formatter={valueFormatter} />} />
          {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
          {series.map((sdef) => (
            <Area
              {...MOTION}
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
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: axisLine }} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={yDomain} width={44} tickFormatter={compactTick} />
          <Tooltip content={<ChartTooltip unit={unit} formatter={valueFormatter} />} />
          {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
          {series.map((sdef) => (
            <Line
              {...MOTION}
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
  return (
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
              {...(tiltTicks
                ? { interval: 0, angle: -35, textAnchor: 'end', height: 58 }
                : {})}
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
          cursor={{ fill: cursorFill }}
          content={<ChartTooltip unit={unit} formatter={valueFormatter} />}
        />
        {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
        {series.map((sdef) => (
          <Bar
              {...MOTION}
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
  return (
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
          cursor={{ fill: cursorFill }}
          content={
            <ChartTooltip formatter={(v) => Math.round(Math.abs(v)).toLocaleString('en-US')} />
          }
        />
        <Legend wrapperStyle={legendStyle} />
        {[...male, ...female].map((sdef) => (
          <Bar
              {...MOTION}
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
        <Pie
              {...MOTION}
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
        <Tooltip content={<ChartTooltip unit={unit} formatter={valueFormatter} />} />
        <Legend
          iconType="circle"
          iconSize={9}
          wrapperStyle={legendStyle}
          formatter={(value) => (
            <span style={{ color: donutName, fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
