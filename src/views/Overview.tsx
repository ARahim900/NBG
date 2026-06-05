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
import { C } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

interface ViewProps {
  onNavigate: (id: ViewId) => void
}

const last = (a: YearPoint[]): number => a[a.length - 1]?.value ?? 0
const prev = (a: YearPoint[]): number => a[a.length - 2]?.value ?? 0
const yoy = (a: YearPoint[]): number | null => deltaPct(last(a), prev(a))

const perinatal2025 =
  sn.summary2025.find((r) => r.metric.startsWith('Total perinatal'))?.value ?? 0

export default function Overview({ onNavigate }: ViewProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy-700 to-navy-800 p-6 text-white shadow-card sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="chip bg-white/10 text-teal">
              Tenth Five-Year Health Development Plan
            </span>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
              Women &amp; Child Health — North Batinah Governorate
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              A consolidated view of eight monitoring dashboards across{' '}
              {meta.wilayats.length} wilayat, covering screening, maternal care,
              perinatal outcomes and family-planning indicators for{' '}
              <span className="font-semibold text-white">2023, 2024 &amp; 2025</span>.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { v: '8', l: 'Dashboards' },
              { v: String(meta.wilayats.length), l: 'Wilayat' },
              { v: '3', l: 'Years' },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/10"
              >
                <p className="text-2xl font-extrabold text-teal">{s.v}</p>
                <p className="text-[0.7rem] font-medium uppercase tracking-wide text-white/60">
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
            invertDelta
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
            accent="navy"
            hint="Reported cases"
          />
          <KpiCard
            label="Perinatal Deaths"
            value={int(perinatal2025)}
            icon={HeartPulse}
            delta={deltaPct(perinatal2025, 117)}
            invertDelta
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
              yDomain={[70, 100]}
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
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {NAV.filter((d) => d.id !== 'overview').map((d) => (
            <button
              key={d.id}
              onClick={() => onNavigate(d.id)}
              className="card group flex items-start gap-3.5 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint/5 text-heading transition-colors group-hover:bg-navy group-hover:text-white">
                <d.icon className="h-[1.35rem] w-[1.35rem]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-heading">{d.name}</span>
                  <span className="rounded-md bg-tint/5 px-1.5 py-0.5 text-[0.6rem] font-bold text-heading/55">
                    {d.code}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink/55">
                  {d.blurb}
                </span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/25 transition-all group-hover:translate-x-0.5 group-hover:text-azure" />
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
