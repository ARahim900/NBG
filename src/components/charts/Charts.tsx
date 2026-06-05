import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  grid: string
  axisTick: { fontSize: number; fill: string }
  cursorFill: string
  sliceStroke: string
}

/** Theme-aware chart chrome: axes, gridlines, hover cursor and pie-slice gaps. */
function useChartTheme(): ChartTheme {
  const { isDark } = useThemeMode()
  return {
    grid: isDark ? '#1f4264' : '#e2e9f0',
    axisTick: { fontSize: 11, fill: isDark ? '#86a6cc' : '#6b7a88' },
    cursorFill: isDark ? 'rgba(125,165,212,0.10)' : 'rgba(20,64,102,0.05)',
    sliceStroke: isDark ? '#112c46' : '#ffffff',
  }
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
  const { grid, axisTick } = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === 'area' ? (
        <AreaChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
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
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: grid }} />
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
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: grid }} />
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
            />
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
  const { grid, axisTick, cursorFill } = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 6, right: 10, left: vertical ? 8 : -8, bottom: 0 }}
        barGap={stacked ? 0 : 3}
        barCategoryGap={vertical ? '22%' : '28%'}
      >
        <CartesianGrid stroke={grid} vertical={vertical} horizontal={!vertical} />
        {vertical ? (
          <>
            <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: grid }}
              width={92}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: grid }} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} />
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

export function DonutChart({
  data,
  height = 250,
  unit,
  valueFormatter,
  innerRadius = 56,
  outerRadius = 84,
}: DonutProps) {
  const { sliceStroke } = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={1.5}
          stroke={sliceStroke}
          strokeWidth={2}
        >
          {data.map((slice, i) => (
            <Cell key={i} fill={slice.color ?? SERIES[i % SERIES.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip unit={unit} formatter={valueFormatter} />} />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
          layout="horizontal"
          align="center"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
