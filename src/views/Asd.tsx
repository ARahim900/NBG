import { useState } from 'react'
import { ArrowRight, Brain, CalendarRange, ClipboardList, MapPin, ShieldCheck, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { asd, sumBy } from '../data/nbg'
import {
  ASD_AGE_OPTIONS,
  NOT_REPORTED,
  asdCapacityByYear,
  YEARS,
  YEAR_OPTIONS,
  asdByCenter2024,
  asdByWilayat2024,
  asdCoverageTrend,
  asdIndicatorsByYear,
  asdMonthlyCoverage,
  asdMonthlyRecords,
  asdMonthlyScreened,
  asdRiskBandsByYear,
  asdRiskByYear,
  type AsdAge,
  type AsdIndicatorRow,
  type Year,
} from '../data/years/childrenA'
import type { ViewProps } from '../lib/dashboards'
import { C, YEAR_COLORS } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

/** Look up a headline indicator by its label in the year-by-year table. */
const ind = (metric: string): AsdIndicatorRow =>
  asdIndicatorsByYear.find((r) => r.metric.startsWith(metric)) ?? {
    metric,
    kind: 'int',
    y2023: null,
    y2024: null,
    y2025: null,
  }

const sum = asd.summary2025
const sval = (starts: string, key: 'm18' | 'm24'): number | null =>
  sum.find((r) => r.metric.startsWith(starts))?.[key] ?? null

const cov18_2025 = sval('Coverage', 'm18')
const cov24_2025 = sval('Coverage', 'm24')
const cov18 = ind('18-month coverage')
const cov24 = ind('24-month coverage')
const screened18 = ind('Children screened at 18')
const referred = ind('Referred to rehabilitation')

const fmtPct = (v: number | null) => (v === null ? NOT_REPORTED.toLowerCase() : pct(v))
const fmtInt = (v: number | null) => (v === null ? NOT_REPORTED.toLowerCase() : int(v))
const dash = (v: number | null, fmt: (v: number) => string = int) => (v === null ? '—' : fmt(v))
const notReported = <span className="text-ink/55">{NOT_REPORTED}</span>

/** One series per year in the shared year colours; a year with no data says so in the legend. */
const yearSeries = (missing: Year[]) =>
  YEARS.map((y) => ({
    key: `y${y}`,
    name: missing.includes(y) ? `${y} (not reported)` : y,
    color: YEAR_COLORS[y],
  }))
const MONTHLY_SERIES = yearSeries(['2023'])

const sumOrNull = (vals: (number | null)[]): number | null =>
  vals.some((v) => v === null) ? null : vals.reduce<number>((a, v) => a + (v ?? 0), 0)

/** Lowest monthly coverage per year, for the chart footnote. */
const lowestMonth = (age: AsdAge) =>
  (['2024', '2025'] as const)
    .map((y) => {
      const rows = asdMonthlyCoverage(age)
      const low = rows.reduce((a, b) => ((b[`y${y}`] ?? 101) < (a[`y${y}`] ?? 101) ? b : a))
      return `${y} ${low.month} ${pct(low[`y${y}`] ?? 0)}`
    })
    .join('; ')

const first = asdCoverageTrend[0]
const latest = asdCoverageTrend[asdCoverageTrend.length - 1]
const covAt = (y: Year) => asdCoverageTrend.find((r) => r.year === y)

const m24Risk2024 = {
  medium: sumBy(asd.monthly2024, (r) => r.med24),
  high: sumBy(asd.monthly2024, (r) => r.high24),
}
const annualRisk24 = asdRiskByYear.m24.find((r) => r.year === '2024')

export default function Asd({ onNavigate }: ViewProps) {
  const [monthAge, setMonthAge] = useState<AsdAge>('m18')
  const [riskAge, setRiskAge] = useState<AsdAge>('m18')
  const [tableYear, setTableYear] = useState<Year>('2025')
  const ageLabel = monthAge === 'm18' ? '18-month' : '24-month'
  const records = tableYear === '2023' ? [] : asdMonthlyRecords[tableYear]

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Brain}
        title="ASD Early Screening"
        subtitle="18 & 24-month developmental (M-CHAT/R) screening — 2023 to 2025 trends, monthly detail for 2024 and 2025"
      />

      <section aria-label="ASD programme capacity">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Workshops conducted', value: 3 },
            { label: 'Master trainers in North Al Batinah Governorate', value: 3 },
            { label: 'Nurse focal points in institutions', value: 28 },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col rounded-2xl border border-teal/60 bg-teal/10 p-5 shadow-sm">
              <dt className="text-sm font-medium text-heading dark:text-glow">{label}</dt>
              <dd className="mt-auto pt-3 text-4xl font-semibold tabular-nums text-heading dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4">
          <DataTable
            dense
            columns={[{ label: 'Capacity by year' }, ...YEARS.map((y) => ({ label: y, align: 'right' as const }))]}
            rows={asdCapacityByYear.map((r) => [
              r.label,
              ...YEARS.map((y) => {
                const v = r[`y${y}`]
                return v === null ? notReported : int(v)
              }),
            ])}
          />
        </div>
        <div className="mt-3">
          <Note title="Sources:">
            2023 and 2024 are the 5-year-plan child-health indicators; the plan has no 2025 figure, so 2025 is shown
            as “{NOT_REPORTED}”. The workshop, master-trainer and focal-point cards are the department&apos;s update and
            do not state a year.
          </Note>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('ecr')}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-control border border-line/20 px-4 py-2 text-label text-heading transition-colors hover:bg-tint/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure/60"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          3 &amp; 4-year developmental visits: open the Extra Child Health Register
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="18-Month Coverage (2025)"
          value={cov18_2025 === null ? '—' : pct(cov18_2025)}
          icon={Brain}
          accent="azure"
          delta={cov18_2025 === null || cov18.y2024 === null ? null : deltaPct(cov18_2025, cov18.y2024)}
          hint={`2024: ${fmtPct(cov18.y2024)} · 2023: ${fmtPct(cov18.y2023)}`}
        />
        <KpiCard
          label="24-Month Coverage (2025)"
          value={cov24_2025 === null ? '—' : pct(cov24_2025)}
          icon={Brain}
          accent="teal"
          delta={cov24_2025 === null || cov24.y2024 === null ? null : deltaPct(cov24_2025, cov24.y2024)}
          hint={`2024: ${fmtPct(cov24.y2024)} · 2023: ${fmtPct(cov24.y2023)}`}
        />
        <KpiCard
          label="Children Screened — 18m (2025)"
          value={dash(screened18.y2025)}
          icon={ShieldCheck}
          accent="navy"
          delta={screened18.y2025 === null || screened18.y2024 === null ? null : deltaPct(screened18.y2025, screened18.y2024)}
          deltaTone="neutral"
          hint={`2024: ${fmtInt(screened18.y2024)} · 2023: ${fmtInt(screened18.y2023)}`}
        />
        <KpiCard
          label="Referred to Rehabilitation (2025)"
          value={dash(referred.y2025)}
          icon={ShieldCheck}
          accent="gold"
          hint="18m + 24m, medium/high risk · 2023–2024 not reported"
        />
      </div>

      <ChartCard
        title="Screening Indicators, 2023–2025"
        subtitle="Governorate figures side by side, as reported"
        action={
          <span className="chip bg-azure/10 text-azure">
            <CalendarRange className="h-3 w-3" /> 2023 · 2024 · 2025
          </span>
        }
      >
        <DataTable
          dense
          columns={[{ label: 'Indicator' }, ...YEARS.map((y) => ({ label: y, align: 'right' as const }))]}
          rows={asdIndicatorsByYear.map((r) => [
            r.metric,
            ...YEARS.map((y) => {
              const v = r[`y${y}`]
              return v === null ? notReported : r.kind === 'pct' ? pct(v) : int(v)
            }),
          ])}
        />
        <div className="mt-3 space-y-3">
          <Note title="Sources:">
            Coverage and risk rows are the source&apos;s annual series. Children screened are the sum of the monthly
            figures for 2024 and the 2025 governorate summary. 2023 has an 18-month coverage and risk series only;
            24-month figures start in 2024. The positive-screen series ends in 2024; the 2025 governorate summary
            reports M-CHAT positive (≥2) separately ({fmtInt(ind('M-CHAT positive (≥2) at 18').y2025)} at 18 months,{' '}
            {fmtInt(ind('M-CHAT positive (≥2) at 24').y2025)} at 24 months), shown in its own rows and not merged into
            the annual series. Referrals are reported for 2025 only.
          </Note>
          {cov18_2025 !== null && cov18.y2025 !== null && cov18_2025 !== cov18.y2025 && (
            <Note tone="warn" title="Two 2025 figures:">
              The annual series gives 18-month coverage of {pct(cov18.y2025)} for 2025; the 2025 governorate summary
              (used in the card above) gives {pct(cov18_2025)}. Both are shown as reported.
            </Note>
          )}
        </div>
      </ChartCard>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <SectionTitle
            icon={CalendarRange}
            title="Monthly Screening by Year, 2023–2025"
            subtitle="Choose the screening age; 2023 has no monthly figures"
          />
          <div className="mb-4">
            <Segmented label="Screening age" options={ASD_AGE_OPTIONS} value={monthAge} onChange={setMonthAge} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title={`Monthly ${ageLabel} Coverage by Year`}
            subtitle="% screened each month — 2023, 2024 and 2025"
            footnote={`Lowest month — ${lowestMonth(monthAge)}. Figures confirmed in the source data.`}
          >
            <TrendChart
              data={asdMonthlyCoverage(monthAge)}
              xKey="month"
              yDomain={[85, 100]}
              unit="%"
              series={MONTHLY_SERIES}
            />
          </ChartCard>
          <ChartCard title={`Monthly ${ageLabel} Children Screened by Year`} subtitle="Count completing M-CHAT/R — 2023, 2024 and 2025">
            <ComparisonBars data={asdMonthlyScreened(monthAge)} xKey="month" series={MONTHLY_SERIES} />
          </ChartCard>
        </div>
        <div className="mt-3">
          <Note title="Not reported:">
            The source has no monthly screening figures for 2023, so 2023 appears in the legend without a line or bars.
          </Note>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Coverage Trend — 18 & 24 Months"
          subtitle={`${first?.year ?? ''}–${latest?.year ?? ''}, including 2023, 2024 and 2025`}
          footnote={`18 months: ${pct(first?.cov18 ?? 0)} (${first?.year ?? ''}) to ${pct(latest?.cov18 ?? 0)} (${latest?.year ?? ''}); ${pct(covAt('2023')?.cov18 ?? 0)} in 2023 and ${pct(covAt('2024')?.cov18 ?? 0)} in 2024. 24-month coverage is reported from 2024 only; 2023 is not reported.`}
        >
          <TrendChart
            data={asdCoverageTrend}
            xKey="year"
            yDomain={[80, 100]}
            unit="%"
            series={[
              { key: 'cov18', name: '18-Month', color: C.azure },
              { key: 'cov24', name: '24-Month', color: C.teal },
            ]}
          />
        </ChartCard>
        <ChartCard
          title={`${riskAge === 'm18' ? '18' : '24'}-Month Risk Detection by Year`}
          subtitle="Medium (3–7) & high (8–20) risk cases"
          action={<Segmented label="Risk age" options={ASD_AGE_OPTIONS} value={riskAge} onChange={setRiskAge} />}
          footnote={
            riskAge === 'm18'
              ? 'The 18-month series covers 2020–2025, including 2023, 2024 and 2025.'
              : '24-month risk figures start in 2024; 2023 is not reported.'
          }
        >
          <ComparisonBars
            data={asdRiskByYear[riskAge]}
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
          title="By Wilayat & Health Centre (2024 only)"
          subtitle="Screening reach across North Batinah"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Screened by Wilayat (2024 only)" subtitle="18m vs 24m counts">
            <ComparisonBars
              data={asdByWilayat2024}
              xKey="wilayat"
              layout="vertical"
              height={300}
              categoryWidth={104}
              series={[
                { key: 'screened18', name: '18-Month', color: C.azure },
                { key: 'screened24', name: '24-Month', color: C.teal },
              ]}
            />
          </ChartCard>
          <ChartCard
            title="Screening by Health Centre (2024 only)"
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
              rows={asdByCenter2024.map((r) => [
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
        <div className="mt-3 space-y-3">
          <Note title="Not reported:">
            The source gives wilayat and health-centre breakdowns for 2024 only. No 2023 or 2025 figures exist at
            this level, so these charts are not year comparisons.
          </Note>
          <Note tone="warn" title="To verify with the source:">
            Wilayat counts add to {int(sumBy(asdByWilayat2024, (r) => r.screened18))} (18 months) and{' '}
            {int(sumBy(asdByWilayat2024, (r) => r.screened24))} (24 months), below the 2024 monthly totals of{' '}
            {int(sumBy(asd.monthly2024, (r) => r.screened18))} and {int(sumBy(asd.monthly2024, (r) => r.screened24))}.
            Confirm the period these breakdowns cover.
          </Note>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="Detailed Tables"
          subtitle="Monthly screening by year, 2025 governorate summary and risk distribution 2023–2025"
        />
        <div className="grid grid-cols-1 gap-4">
          <ChartCard
            title={`Monthly Screening ${tableYear} — 18m & 24m`}
            subtitle="Visits, screened, coverage and risk detections"
            action={<Segmented label="Year" options={YEAR_OPTIONS} value={tableYear} onChange={setTableYear} />}
          >
            {tableYear === '2023' ? (
              <Note title="Not reported:">
                The source has no monthly screening figures for 2023. The 2023 annual 18-month coverage and risk
                figures are in “Screening Indicators, 2023–2025” above.
              </Note>
            ) : (
              <>
                <DataTable
                  columns={[
                    { label: 'Month' },
                    { label: '18m Visits', align: 'right' },
                    { label: '18m Screened', align: 'right' },
                    { label: '18m Cov %', align: 'right' },
                    { label: '24m Visits', align: 'right' },
                    { label: '24m Screened', align: 'right' },
                    { label: '24m Cov %', align: 'right' },
                    { label: '18m Med', align: 'right' },
                    { label: '18m High', align: 'right' },
                    { label: '24m Med', align: 'right' },
                    { label: '24m High', align: 'right' },
                  ]}
                  rows={records.map((r) => [
                    r.month,
                    dash(r.visits18),
                    int(r.screened18),
                    pct(r.cov18),
                    dash(r.visits24),
                    int(r.screened24),
                    pct(r.cov24),
                    dash(r.med18),
                    dash(r.high18),
                    dash(r.med24),
                    dash(r.high24),
                  ])}
                  total={(() => {
                    const v18 = sumOrNull(records.map((r) => r.visits18))
                    const v24 = sumOrNull(records.map((r) => r.visits24))
                    const s18 = sumBy(records, (r) => r.screened18)
                    const s24 = sumBy(records, (r) => r.screened24)
                    return [
                      'TOTAL',
                      dash(v18),
                      int(s18),
                      v18 ? pct((s18 / v18) * 100) : '—',
                      dash(v24),
                      int(s24),
                      v24 ? pct((s24 / v24) * 100) : '—',
                      dash(sumOrNull(records.map((r) => r.med18))),
                      dash(sumOrNull(records.map((r) => r.high18))),
                      dash(sumOrNull(records.map((r) => r.med24))),
                      dash(sumOrNull(records.map((r) => r.high24))),
                    ]
                  })()}
                  dense
                />
                <div className="mt-3">
                  {tableYear === '2024' ? (
                    <Note title="2024:">
                      The source gives no visit counts for 2024, so “—” is shown and no annual coverage is computed;
                      the annual series gives {fmtPct(cov18.y2024)} (18 months) and {fmtPct(cov24.y2024)} (24 months).
                      Monthly 24-month risk counts add to {m24Risk2024.medium} medium and {m24Risk2024.high} high, while
                      the annual series reports {annualRisk24?.medium ?? '—'} and {annualRisk24?.high ?? '—'}; both are
                      shown as reported.
                    </Note>
                  ) : (
                    <Note title="2025:">
                      Monthly risk counts are not reported for 2025 (“—”); the 2025 totals are in the governorate
                      summary below.
                    </Note>
                  )}
                </div>
              </>
            )}
          </ChartCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              title="Governorate Summary (2025 only)"
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
              <div className="mt-3">
                <Note title="Not reported:">
                  This outcome summary (diagnoses, other developmental disorders, referrals) exists for 2025 only;
                  the 2023 and 2024 figures that do exist are in “Screening Indicators, 2023–2025”.
                </Note>
              </div>
            </ChartCard>
            <ChartCard
              title="Risk Distribution, 2023–2025"
              subtitle="All children screened at 18 and 24 months"
            >
              <DataTable
                columns={[
                  { label: 'Risk Band' },
                  ...YEARS.map((y) => ({ label: y, align: 'right' as const })),
                ]}
                rows={asdRiskBandsByYear.map((r) => [
                  r.band,
                  ...YEARS.map((y) => {
                    const v = r[`y${y}`]
                    return v === null ? notReported : int(v)
                  }),
                ])}
                total={[
                  'TOTAL',
                  ...YEARS.map((y) => dash(sumOrNull(asdRiskBandsByYear.map((r) => r[`y${y}`])))),
                ]}
              />
              <div className="mt-3 space-y-3">
                <Note title="Basis:">
                  2024 is the source&apos;s own distribution; 2025 adds the 18-month and 24-month figures of the 2025
                  governorate summary (the same basis — the 2024 medium-risk 30 is 18 + 12). 2023 has no low-risk or
                  24-month figures, so it is not reported.
                </Note>
                <Note title="2025:">{asd.note2025}</Note>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section aria-labelledby="asd-programme-challenges" className="rounded-2xl border border-navy/20 bg-surface p-6 shadow-sm dark:border-teal/40">
          <h2 id="asd-programme-challenges" className="text-xl font-semibold text-heading dark:text-white">Programme Challenges</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-teal">
            <li>Limited feedback on autism spectrum disorder (ASD) diagnosed cases from tertiary hospitals</li>
            <li>Logistical requirements for launching the ASD Clinic</li>
            <li>Tracking the number of ASD cases diagnosed in North Al Batinah for follow-up</li>
            <li>Some institutions are not integrated with the Sultan Qaboos University system.</li>
          </ul>
        </section>
        <section aria-labelledby="asd-future-plan" className="rounded-2xl border border-teal/60 bg-teal/10 p-6 shadow-sm">
          <h2 id="asd-future-plan" className="text-xl font-semibold text-heading dark:text-white">Future Plan</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-teal">
            <li>Conduct an ASD workshop for paediatricians on <time dateTime="2026-12-10" className="font-semibold">10 December 2026</time></li>
            <li>Launch the ASD Clinic in the <span className="font-semibold">first quarter of 2027</span></li>
            <li>Increase awareness about the ASD Clinic and early rehabilitation services</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
