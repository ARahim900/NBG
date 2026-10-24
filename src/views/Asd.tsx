import { Brain, CalendarRange, MapPin, ShieldCheck, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { asd, sumBy } from '../data/nbg'
import { C } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const sum = asd.summary2025
const sval = (starts: string, key: 'm18' | 'm24'): number =>
  sum.find((r) => r.metric.startsWith(starts))?.[key] ?? 0

const cov18_2025 = sval('Coverage', 'm18')
const cov24_2025 = sval('Coverage', 'm24')
const screened18_2025 = sval('Screened', 'm18')
const referred = sval('Referred', 'm18') + sval('Referred', 'm24')

// Monthly 2025 totals
const v18 = sumBy(asd.monthly2025, (r) => r.visits18)
const s18 = sumBy(asd.monthly2025, (r) => r.screened18)
const v24 = sumBy(asd.monthly2025, (r) => r.visits24)
const s24 = sumBy(asd.monthly2025, (r) => r.screened24)

export default function Asd() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Brain}
        title="ASD Early Screening"
        subtitle="18 & 24-month developmental (M-CHAT/R) screening — 2024 detail, 2025 monthly & governorate summary"
      />

      <section aria-label="ASD programme capacity">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Workshops conducted', value: 3 },
            { label: 'Master trainers in North Al Batinah Governorate', value: 3 },
            { label: 'Nurse focal points in institutions', value: 28 },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col rounded-2xl border border-[#A4C5BB]/60 bg-[#A4C5BB]/10 p-5 shadow-sm">
              <dt className="text-sm font-medium text-[#4E4456] dark:text-[#A4C5BB]">{label}</dt>
              <dd className="mt-auto pt-3 text-4xl font-semibold tabular-nums text-[#4E4456] dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="18-Month Coverage (2025)"
          value={pct(cov18_2025)}
          icon={Brain}
          accent="azure"
          delta={deltaPct(cov18_2025, 97.8)}
          hint="vs 97.8% in 2024"
        />
        <KpiCard
          label="24-Month Coverage (2025)"
          value={pct(cov24_2025)}
          icon={Brain}
          accent="teal"
          delta={deltaPct(cov24_2025, 95.69)}
          hint="vs 95.7% in 2024"
        />
        <KpiCard
          label="Children Screened — 18m (2025)"
          value={int(screened18_2025)}
          icon={ShieldCheck}
          accent="navy"
          hint="M-CHAT/R completed"
        />
        <KpiCard
          label="Referred to Rehabilitation"
          value={int(referred)}
          icon={ShieldCheck}
          accent="gold"
          hint="18m + 24m, medium/high risk"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="2025 Monthly Coverage — 18m vs 24m"
          subtitle="% screened each month"
          footnote="May 24-month coverage dipped to 90.0% — confirmed in the source data, worth review."
        >
          <TrendChart
            data={asd.monthly2025}
            xKey="month"
            yDomain={[85, 100]}
            unit="%"
            series={[
              { key: 'cov18', name: '18-Month', color: C.azure },
              { key: 'cov24', name: '24-Month', color: C.teal },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="2025 Monthly Screened Children"
          subtitle="Count completing M-CHAT/R"
        >
          <ComparisonBars
            data={asd.monthly2025}
            xKey="month"
            series={[
              { key: 'screened18', name: '18-Month', color: C.azure },
              { key: 'screened24', name: '24-Month', color: C.teal },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="18-Month Coverage Trend"
          subtitle="2019–2025"
          footnote="Sustained improvement from 82.8% (2019) to 99.0% (2025)."
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
          title="18-Month Risk Detection by Year"
          subtitle="Medium (3–7) & high (8–20) risk cases"
        >
          <ComparisonBars
            data={asd.risk18Trend}
            xKey="year"
            series={[
              { key: 'medium', name: 'Medium risk', color: C.gold },
              { key: 'high', name: 'High risk', color: C.alert },
            ]}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={MapPin}
          title="By Wilayat & Health Centre (2024)"
          subtitle="Screening reach across North Batinah"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Screened by Wilayat (2024)" subtitle="18m vs 24m counts">
            <ComparisonBars
              data={asd.byWilayat2024}
              xKey="wilayat"
              layout="vertical"
              height={300}
              series={[
                { key: 'screened18', name: '18-Month', color: C.azure },
                { key: 'screened24', name: '24-Month', color: C.teal },
              ]}
            />
          </ChartCard>
          <ChartCard
            title="Screening by Health Centre (2024)"
            subtitle="With medium / high-risk detections"
          >
            <DataTable
              columns={[
                { label: 'Health Centre' },
                { label: 'Wilayat' },
                { label: '18m', align: 'right' },
                { label: '24m', align: 'right' },
                { label: 'Med', align: 'right' },
                { label: 'High', align: 'right' },
              ]}
              rows={asd.byCenter2024.map((r) => [
                r.center,
                r.wilayat,
                int(r.screened18),
                int(r.screened24),
                r.medium,
                r.high,
              ])}
              dense
            />
          </ChartCard>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="2025 Detailed Tables"
          subtitle="Monthly screening & governorate summary"
        />
        <div className="grid grid-cols-1 gap-4">
          <ChartCard
            title="Monthly Screening 2025 — 18m & 24m"
            subtitle="Visits, screened & coverage"
            action={
              <span className="chip bg-azure/10 text-azure">
                <CalendarRange className="h-3 w-3" /> Jan–Dec 2025
              </span>
            }
          >
            <DataTable
              columns={[
                { label: 'Month' },
                { label: '18m Visits', align: 'right' },
                { label: '18m Screened', align: 'right' },
                { label: '18m Cov %', align: 'right' },
                { label: '24m Visits', align: 'right' },
                { label: '24m Screened', align: 'right' },
                { label: '24m Cov %', align: 'right' },
              ]}
              rows={asd.monthly2025.map((r) => [
                r.month,
                int(r.visits18),
                int(r.screened18),
                pct(r.cov18),
                int(r.visits24),
                int(r.screened24),
                pct(r.cov24),
              ])}
              total={[
                'TOTAL',
                int(v18),
                int(s18),
                pct((s18 / v18) * 100),
                int(v24),
                int(s24),
                pct((s24 / v24) * 100),
              ]}
              dense
            />
          </ChartCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              title="2025 Governorate Summary"
              subtitle="18 vs 24-month outcomes"
            >
              <DataTable
                columns={[
                  { label: 'Metric' },
                  { label: '18 Month', align: 'right' },
                  { label: '24 Month', align: 'right' },
                ]}
                rows={asd.summary2025.map((r) => {
                  const isPct = r.metric.startsWith('Coverage')
                  return [
                    r.metric,
                    isPct ? pct(r.m18) : int(r.m18),
                    isPct ? pct(r.m24) : int(r.m24),
                  ]
                })}
                dense
              />
            </ChartCard>
            <ChartCard
              title="Risk Distribution (2024)"
              subtitle="All children screened"
            >
              <DataTable
                columns={[
                  { label: 'Risk Band' },
                  { label: 'Children', align: 'right' },
                ]}
                rows={asd.riskDist2024.map((r) => [r.band, int(r.children)])}
                total={[
                  'TOTAL',
                  int(sumBy(asd.riskDist2024, (r) => r.children)),
                ]}
              />
              <div className="mt-3">
                <Note title="2025:">{asd.note2025}</Note>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section aria-labelledby="asd-programme-challenges" className="rounded-2xl border border-[#4E4456]/20 bg-surface p-6 shadow-sm dark:border-[#A4C5BB]/40">
          <h2 id="asd-programme-challenges" className="text-xl font-semibold text-[#4E4456] dark:text-white">Programme Challenges</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-[#A4C5BB]">
            <li>Limited feedback on autism spectrum disorder (ASD) diagnosed cases from tertiary hospitals</li>
            <li>Logistical requirements for launching the ASD Clinic</li>
            <li>Tracking the number of ASD cases diagnosed in North Al Batinah for follow-up</li>
            <li>Some institutions are not integrated with the Sultan Qaboos University system.</li>
          </ul>
        </section>
        <section aria-labelledby="asd-future-plan" className="rounded-2xl border border-[#A4C5BB]/60 bg-[#A4C5BB]/10 p-6 shadow-sm">
          <h2 id="asd-future-plan" className="text-xl font-semibold text-[#4E4456] dark:text-white">Future Plan</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-[#A4C5BB]">
            <li>Conduct an ASD workshop for paediatricians on <time dateTime="2026-12-10" className="font-semibold">10 December 2026</time></li>
            <li>Launch the ASD Clinic in the <span className="font-semibold">first quarter of 2027</span></li>
            <li>Increase awareness about the ASD Clinic and early rehabilitation services</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
