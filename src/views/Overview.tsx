import {
  ArrowRight,
  Brain,
  CalendarCheck,
  Database,
  Droplets,
  HeartHandshake,
  HeartPulse,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { NAV, type ViewId } from '../lib/dashboards'
import { asd, fp, mc, meta, mt, type YearPoint } from '../data/nbg'
import mpdsr from '../data/mpdsr2025.json'
import { INSTITUTIONS } from '../data/population'
import { HOSPITALS } from '../data/hospitals'
import {
  HEADLINE,
  NOTES,
  PERCENT_BY_YEAR,
  SOURCES,
  YEARS,
  type HeadlineRow,
} from '../data/years/governorate'
import { C, YEAR_COLORS } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

interface ViewProps {
  onNavigate: (id: ViewId) => void
}

const last = (a: YearPoint[]): number => a[a.length - 1]?.value ?? 0
const prev = (a: YearPoint[]): number => a[a.length - 2]?.value ?? 0
const yoy = (a: YearPoint[]): number | null => deltaPct(last(a), prev(a))

/** "2023 12,549 · 2024 12,754" — the listed years of a series, gaps named. */
const yearList = (a: YearPoint[], years: readonly string[], f: (v: number) => string): string =>
  years
    .map((y) => {
      const v = a.find((p) => p.year === y)?.value
      return `${y} ${v === undefined ? 'not reported' : f(v)}`
    })
    .join(' · ')
/** The two years before 2025, shown under each 2025 KPI. */
const earlier = (a: YearPoint[], f: (v: number) => string): string =>
  yearList(a, ['2023', '2024'], f)
/** All three years, for chart footnotes. */
const threeYears = (a: YearPoint[], f: (v: number) => string): string => yearList(a, YEARS, f)

/** Indicator dashboards (women's and children's health sections), sub-pages included. */
const DASHBOARD_COUNT = NAV.filter((d) => d.group === 'women' || d.group === 'children').length
/** Health-centre catchments plus wilayat-wide hospitals (Al Suwaiq Hospital). */
const INSTITUTION_COUNT = INSTITUTIONS.length + HOSPITALS.length

const fmtRow = (r: HeadlineRow, v: number): string => (r.unit === '%' ? pct(v) : int(v))

/** 2024 → 2025 change: percentage points for rates, per cent for counts. */
const change = (r: HeadlineRow): string => {
  const a = r.values['2024']
  const b = r.values['2025']
  if (a === null || b === null) return '—'
  if (r.unit === '%') {
    const d = b - a
    return `${d > 0 ? '+' : ''}${d.toFixed(1)} pp`
  }
  const d = deltaPct(b, a)
  return d === null ? '—' : `${d > 0 ? '+' : ''}${d.toFixed(1)}%`
}

const NOT_REPORTED = <span className="text-ink/50">Not reported</span>

export default function Overview({ onNavigate }: ViewProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[4px] border-l-4 border-azure bg-navy p-6 text-white dark:bg-[#0b2235] sm:p-8"
        data-reveal
      >
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-glow sm:text-[0.72rem]">
              Tenth Five-Year Health Development Plan (2021–2025)
            </p>
            <h1 className="mt-3 font-sans text-2xl font-normal leading-tight sm:text-[2rem]">
              Women &amp; Child Health — North Batinah Governorate
            </h1>
            <span className="accent-tab mt-4 w-14 bg-glow" aria-hidden="true" />
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              A consolidated view of {DASHBOARD_COUNT} monitoring dashboards and sub-pages
              across {meta.wilayats.length} wilayat, covering screening, maternal care,
              perinatal outcomes and family-planning indicators, mainly for{' '}
              <span className="font-semibold text-white">2023, 2024 &amp; 2025</span>{' '}
              where the source provides them (Extended Newborn Screening reports 2026).
            </p>
          </div>
          {/* Four figures: an even 2 × 2 on phones, one row of 4 on wider screens. */}
          <div className="grid shrink-0 grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-3 lg:min-w-[26rem]">
            {[
              { v: String(DASHBOARD_COUNT), l: 'Dashboards' },
              { v: String(INSTITUTION_COUNT), l: 'Health institutions' },
              { v: String(meta.wilayats.length), l: 'Wilayat' },
              { v: '3', l: 'Years' },
            ].map((s) => (
              <div
                key={s.l}
                className="min-w-0 rounded-[4px] border border-white/15 px-2 py-3 transition-colors hover:border-glow/60 sm:px-4"
              >
                <p className="font-display text-2xl font-bold tabular-nums text-glow">{s.v}</p>
                <p className="text-[0.62rem] font-medium uppercase text-white/60 sm:text-[0.7rem] sm:tracking-wide">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Headline KPIs */}
      <section>
        <SectionTitle
          icon={TrendingUp}
          title="2025 Headline Indicators"
          subtitle="2025 governorate figures with change vs 2024; 2023 and 2024 values under each figure"
        />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiCard
            label="ANC Bookings (registered)"
            value={int(last(mc.ancTrend))}
            icon={Stethoscope}
            delta={yoy(mc.ancTrend)}
            accent="navy"
            hint={`Antenatal-care registrations · ${earlier(mc.ancTrend, int)}`}
          />
          <KpiCard
            label="1st-Trimester Booking"
            value={pct(last(mc.bookingTrend))}
            icon={CalendarCheck}
            delta={yoy(mc.bookingTrend)}
            accent="azure"
            hint={`Booked within first trimester · ${earlier(mc.bookingTrend, (v) => pct(v))}`}
          />
          <KpiCard
            label="Anaemia in Pregnancy"
            value={pct(last(mc.anaemiaTrend))}
            icon={Droplets}
            delta={yoy(mc.anaemiaTrend)}
            deltaTone="down"
            accent="good"
            hint={`Lower is better · ${earlier(mc.anaemiaTrend, (v) => pct(v))}`}
          />
          <KpiCard
            label="ASD 18-Month Coverage"
            value={pct(last(asd.cov18Trend))}
            icon={Brain}
            delta={yoy(asd.cov18Trend)}
            accent="teal"
            hint={`M-CHAT/R screening · ${earlier(asd.cov18Trend, (v) => pct(v))}`}
          />
          <KpiCard
            label="Birth-Spacing Cases"
            value={int(last(fp.birthSpacingTrend))}
            icon={Users}
            delta={yoy(fp.birthSpacingTrend)}
            accent="gold"
            hint={`Registered birth-spacing users · ${earlier(fp.birthSpacingTrend, int)}`}
          />
          <KpiCard
            label="Child-Maltreatment Notifications"
            value={int(last(mt.totalTrend))}
            icon={ShieldAlert}
            delta={yoy(mt.totalTrend)}
            deltaTone="neutral"
            accent="navy"
            hint={`A rise can mean better reporting · ${earlier(mt.totalTrend, int)}`}
          />
          <KpiCard
            label="Stillbirth & Neonatal Records (2025)"
            value={int(mpdsr.summary.records)}
            icon={HeartPulse}
            accent="navy"
            hint="Provisional MPDSR workbook · 2023 and 2024 not reported as calendar-year totals"
          />
          <KpiCard
            label="Premarital Screening"
            value={int(last(fp.premaritalTrend))}
            icon={HeartHandshake}
            delta={yoy(fp.premaritalTrend)}
            accent="azure"
            hint={`Couples screened · ${earlier(fp.premaritalTrend, int)}`}
          />
        </div>
      </section>

      {/* Three-year comparison */}
      <section>
        <SectionTitle
          icon={TrendingUp}
          title="2023, 2024 and 2025 Compared"
          subtitle="The same headline indicators, one column per year"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <ChartCard
            className="xl:col-span-2"
            title="Rate Indicators by Year"
            subtitle="% · 2023, 2024 and 2025 side by side"
            footnote="ASD 24-month coverage has no 2023 bar: 24-month screening began in 2024 (not reported for 2023)."
          >
            <ComparisonBars
              data={PERCENT_BY_YEAR}
              xKey="indicator"
              layout="vertical"
              categoryWidth={150}
              height={460}
              unit="%"
              valueFormatter={(v) => v.toFixed(1)}
              series={YEARS.map((y) => ({ key: `y${y}`, name: y, color: YEAR_COLORS[y] }))}
            />
          </ChartCard>
          <ChartCard
            className="xl:col-span-3"
            title="Headline Indicators, 2023–2025"
            subtitle="Governorate totals · select an indicator to open its dashboard"
          >
            <DataTable
              dense
              columns={[
                { label: 'Indicator' },
                ...YEARS.map((y) => ({ label: y, align: 'right' as const })),
                { label: 'Change 2024→25', align: 'right' },
              ]}
              rows={HEADLINE.map((r) => [
                <button
                  type="button"
                  onClick={() => onNavigate(r.view)}
                  className="text-left font-medium text-heading underline-offset-4 hover:underline"
                >
                  {r.label}
                </button>,
                ...YEARS.map((y) => {
                  const v = r.values[y]
                  return v === null ? NOT_REPORTED : fmtRow(r, v)
                }),
                change(r),
              ])}
            />
            <div className="mt-3 space-y-2">
              {HEADLINE.filter((r) => r.gap).map((r) => (
                <Note key={r.label} title={`${r.label}:`}>
                  {r.gap}. Years marked “Not reported” are not in the source files and are
                  left blank rather than estimated.
                </Note>
              ))}
              <Note title="Change:">
                Rates change in percentage points (pp); counts change as a percentage of the
                2024 figure.
              </Note>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* Headline trends */}
      <section>
        <SectionTitle
          icon={TrendingUp}
          title="Multi-Year Trends"
          subtitle="2019–2025 governorate series · 2023, 2024 and 2025 are the last three points"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="ASD 18-Month Screening Coverage"
            subtitle="% of children screened (2019–2025)"
            footnote={`${threeYears(asd.cov18Trend, (v) => pct(v))}. 24-month screening began in 2024.`}
          >
            <TrendChart
              data={asd.cov18Trend}
              xKey="year"
              variant="area"
              unit="%"
              series={[{ key: 'value', name: 'Coverage', color: C.azure }]}
            />
          </ChartCard>
          <ChartCard
            title="Anaemia in Pregnancy"
            subtitle="% of antenatal women (2019–2025)"
            footnote={`${threeYears(mc.anaemiaTrend, (v) => pct(v))}. Lower is better.`}
          >
            <TrendChart
              data={mc.anaemiaTrend}
              xKey="year"
              variant="area"
              yDomain={[0, 40]}
              unit="%"
              series={[{ key: 'value', name: 'Anaemia', color: C.alert }]}
            />
          </ChartCard>
          <ChartCard
            title="Birth-Spacing Registered Cases"
            subtitle="New birth-spacing users per year (2019–2025)"
            footnote={`A proxy for family-planning uptake · ${threeYears(fp.birthSpacingTrend, int)}.`}
          >
            <TrendChart
              data={fp.birthSpacingTrend}
              xKey="year"
              variant="area"
              unit=""
              series={[{ key: 'value', name: 'Cases', color: C.teal }]}
            />
          </ChartCard>
          <ChartCard
            title="Child-Maltreatment Notifications"
            subtitle="Reported cases per year (2019–2025)"
            footnote={`${threeYears(mt.totalTrend, int)}. Rising counts reflect both incidence and improved detection and reporting.`}
          >
            <ComparisonBars
              data={mt.totalTrend}
              xKey="year"
              unit=""
              series={[{ key: 'value', name: 'Notifications', color: C.navy }]}
              showLegend={false}
            />
          </ChartCard>
        </div>
      </section>

      {/* Explore dashboards */}
      <section>
        <SectionTitle
          icon={Database}
          title="Explore the Dashboards"
          subtitle="Open any indicator for full detail"
        />
        {/* Sub-pages (for example the Extra Child Health Register under ASD
            Early Screening) are listed inside their parent's card. */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {NAV.filter((d) => d.id !== 'overview' && !d.parentId).map((d) => {
            const children = NAV.filter((c) => c.parentId === d.id)
            return (
              <div key={d.id} className="card card-lift flex flex-col p-4">
                <button
                  type="button"
                  onClick={() => onNavigate(d.id)}
                  className="group flex items-start gap-3.5 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint/5 text-heading ring-1 ring-line/10 transition-all duration-300 group-hover:bg-navy group-hover:text-glow">
                    <d.icon className="h-[1.35rem] w-[1.35rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-heading">{d.name}</span>
                      {d.code && (
                        <span className="rounded-md bg-tint/5 px-1.5 py-0.5 text-[0.6rem] font-bold text-heading/55">
                          {d.code}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink/55">
                      {d.blurb}
                    </span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-glow" />
                </button>
                {children.length > 0 && (
                  <ul
                    aria-label={`${d.name} sub-pages`}
                    className="mt-3 flex flex-wrap gap-2 border-t border-line/10 pt-3 sm:pl-[3.6rem]"
                  >
                    {children.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => onNavigate(c.id)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-line/15 px-2.5 py-1.5 text-left text-xs font-medium text-heading transition-colors hover:bg-tint/10"
                        >
                          <c.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {c.name}
                          <ArrowRight className="h-3 w-3 shrink-0 text-ink/40" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Sources & notes */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Data Sources" subtitle="Where each year's figures come from">
          <ul className="space-y-2.5">
            {SOURCES.map(([coverage, src], i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                <span>
                  <span className="font-medium text-ink">{coverage}</span>
                  <span className="mt-0.5 block text-xs text-ink/50">{src}</span>
                </span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard
          title="Notes on Accuracy &amp; 2025 Coverage"
          subtitle="Honest data caveats"
        >
          <ul className="space-y-2.5">
            {NOTES.map((note, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed text-ink/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-azure" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </section>
    </div>
  )
}
