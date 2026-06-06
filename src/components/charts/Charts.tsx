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
import { SERIES } from '../../lib/theme'
import { useThemeMode } from '../../lib/theme-mode'

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
    <div className="rounded-xl border border-line/10 bg-surface/95 px-3 py-2 shadow-card backdrop-blur">
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
}

/** Theme-aware chart chrome: axis ticks, hover cursor, slice gaps and data labels. */
function useChartTheme(): ChartTheme {
  const { isDark } = useThemeMode()
  return {
    axisTick: { fontSize: 11, fill: isDark ? '#86a6cc' : '#6b7a88' },
    cursorFill: isDark ? 'rgba(125,165,212,0.10)' : 'rgba(20,64,102,0.05)',
    sliceStroke: isDark ? '#112c46' : '#ffffff',
    axisLine: isDark ? '#23456b' : '#dbe5ee',
    dataLabel: isDark ? '#c9d8ea' : '#41617d',
    donutName: isDark ? '#eaf2fc' : '#144066',
  }
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
  const { axisTick, axisLine, dataLabel } = useChartTheme()
  // Single-series trends get a tidy value sat above each point; multi-series
  // stays label-free (rely on the tooltip) to avoid overlapping figures.
  const showValues = series.length === 1
  const labelStyle = { fontSize: 10, fontWeight: 600, fill: dataLabel } as const
  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === 'area' ? (
        <AreaChart data={data} margin={{ top: 18, right: 12, left: -8, bottom: 0 }}>
          <defs>
            {series.map((sdef) => (
              <linearGradient
                key={sdef.key}
                id={`grad-${sdef.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={sdef.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={sdef.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: axisLine }} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={yDomain} width={44} />
          <Tooltip content={<ChartTooltip unit={unit} formatter={valueFormatter} />} />
          {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
          {series.map((sdef) => (
            <Area
              key={sdef.key}
              type="monotone"
              dataKey={sdef.key}
              name={sdef.name}
              stroke={sdef.color}
              strokeWidth={2.5}
              fill={`url(#grad-${sdef.key})`}
              dot={{ r: 2.5, strokeWidth: 0, fill: sdef.color }}
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
          <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={yDomain} width={44} />
          <Tooltip content={<ChartTooltip unit={unit} formatter={valueFormatter} />} />
          {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
          {series.map((sdef) => (
            <Line
              key={sdef.key}
              type="monotone"
              dataKey={sdef.key}
              name={sdef.name}
              stroke={sdef.color}
              strokeWidth={2.5}
              dot={{ r: 2.5, strokeWidth: 0, fill: sdef.color }}
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
}: BarsProps) {
  const vertical = layout === 'vertical'
  const { axisTick, axisLine, cursorFill, dataLabel } = useChartTheme()
  // Grouped bars carry their figure at the bar tip and drop the numeric axis;
  // stacked bars keep the axis (per-segment labels would collide).
  const showValues = !stacked
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
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: axisLine }}
              width={92}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: axisLine }} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} hide={showValues} />
          </>
        )}
        <Tooltip
          cursor={{ fill: cursorFill }}
          content={<ChartTooltip unit={unit} formatter={valueFormatter} />}
        />
        {showLegend && series.length > 1 && <Legend wrapperStyle={legendStyle} />}
        {series.map((sdef) => (
          <Bar
            key={sdef.key}
            dataKey={sdef.key}
            name={sdef.name}
            fill={sdef.color}
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? [0, 0, 0, 0] : vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
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
  const { sliceStroke, donutName } = useChartTheme()
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
            <Cell key={i} fill={slice.color ?? SERIES[i % SERIES.length]} />
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
