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
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { NAV, type ViewId } from '../lib/dashboards'
import { asd, fp, mc, meta, mt, sn, type YearPoint } from '../data/nbg'
import { INSTITUTIONS } from '../data/population'
import { C } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

interface ViewProps {
  onNavigate: (id: ViewId) => void
}

const last = (a: YearPoint[]): number => a[a.length - 1]?.value ?? 0
const prev = (a: YearPoint[]): number => a[a.length - 2]?.value ?? 0
const yoy = (a: YearPoint[]): number | null => deltaPct(last(a), prev(a))

/** Indicator dashboards (women's and children's health sections). */
const DASHBOARD_COUNT = NAV.filter((d) => d.group === 'women' || d.group === 'children').length

const perinatal2025 =
  sn.summary2025.find((r) => r.metric.startsWith('Total perinatal'))?.value ?? 0

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
            <h1 className="mt-3 font-serif text-2xl font-normal leading-tight sm:text-[2rem]">
              Women &amp; Child Health — North Batinah Governorate
            </h1>
            <span className="accent-tab mt-4 w-14 bg-glow" aria-hidden="true" />
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              A consolidated view of {DASHBOARD_COUNT} monitoring dashboards across{' '}
              {meta.wilayats.length} wilayat, covering screening, maternal care,
              perinatal outcomes and family-planning indicators for{' '}
              <span className="font-semibold text-white">2023, 2024 &amp; 2025</span>.
            </p>
          </div>
          {/* Four figures: an even 2 × 2 on phones, one row of 4 on wider screens. */}
          <div className="grid shrink-0 grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-3 lg:min-w-[26rem]">
            {[
              { v: String(DASHBOARD_COUNT), l: 'Dashboards' },
              { v: String(INSTITUTIONS.length), l: 'Health centres' },
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
          subtitle="Latest governorate figures with change vs 2024"
        />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiCard
            label="ANC Bookings (registered)"
            value={int(last(mc.ancTrend))}
            icon={Stethoscope}
            delta={yoy(mc.ancTrend)}
            accent="navy"
            hint="Antenatal-care registrations"
          />
          <KpiCard
            label="1st-Trimester Booking"
            value={pct(last(mc.bookingTrend))}
            icon={CalendarCheck}
            delta={yoy(mc.bookingTrend)}
            accent="azure"
            hint="Booked within first trimester"
          />
          <KpiCard
            label="Anaemia in Pregnancy"
            value={pct(last(mc.anaemiaTrend))}
            icon={Droplets}
            delta={yoy(mc.anaemiaTrend)}
            deltaTone="down"
            accent="good"
            hint="Lower is better"
          />
          <KpiCard
            label="ASD 18-Month Coverage"
            value={pct(last(asd.cov18Trend))}
            icon={Brain}
            delta={yoy(asd.cov18Trend)}
            accent="teal"
            hint="M-CHAT/R developmental screening"
          />
          <KpiCard
            label="Birth-Spacing Cases"
            value={int(last(fp.birthSpacingTrend))}
            icon={Users}
            delta={yoy(fp.birthSpacingTrend)}
            accent="gold"
            hint="Registered birth-spacing users"
          />
          <KpiCard
            label="Child-Maltreatment Notifications"
            value={int(last(mt.totalTrend))}
            icon={ShieldAlert}
            delta={yoy(mt.totalTrend)}
            deltaTone="neutral"
            accent="navy"
            hint="Reported cases · a rise can mean better reporting"
          />
          <KpiCard
            label="Perinatal Deaths"
            value={int(perinatal2025)}
            icon={HeartPulse}
            delta={deltaPct(perinatal2025, 117)}
            deltaTone="down"
            accent="good"
            hint="Stillbirth + neonatal (vs 117 prior)"
          />
          <KpiCard
            label="Premarital Screening"
            value={int(last(fp.premaritalTrend))}
            icon={HeartHandshake}
            delta={yoy(fp.premaritalTrend)}
            accent="azure"
            hint="Couples screened"
          />
        </div>
      </section>

      {/* Headline trends */}
      <section>
        <SectionTitle
          icon={TrendingUp}
          title="Multi-Year Trends"
          subtitle="2019–2025 governorate trajectories"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="ASD 18-Month Screening Coverage"
            subtitle="% of children screened (2019–2025)"
            footnote="24-month screening began in 2024 (95.7% → 98.0%)."
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
            footnote="2025 fell to 28.5% from a 2024 peak of 34.4%."
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
            subtitle="New birth-spacing users per year"
            footnote="A proxy for family-planning uptake across the governorate."
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
            footnote="Rising counts reflect both incidence and improved detection/reporting."
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
        {/* 14 pages → an even 7 × 2 grid. */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {NAV.filter((d) => d.id !== 'overview').map((d) => (
            <button
              key={d.id}
              onClick={() => onNavigate(d.id)}
              className="card card-lift group flex items-start gap-3.5 p-4 text-left"
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
          ))}
        </div>
      </section>

      {/* Sources & notes */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Data Sources" subtitle="Where each year's figures come from">
          <ul className="space-y-2.5">
            {meta.sources.map(([coverage, src], i) => (
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
            {meta.notes.map((note, i) => (
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
