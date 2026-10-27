import { useState } from 'react'
import { Activity, Dna, HeartPulse, Table2, Users } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { DS_CONDITIONS, ds2025, dsTotals } from '../data/wch2025'
import {
  DS_MONTHLY_OPTIONS,
  DS_REGISTRY_FIELDS,
  NOT_REPORTED,
  YEARS,
  YEAR_OPTIONS,
  dsAgeByYear,
  dsCapacityByYear,
  dsConditionsByYear,
  dsMonthlyByYear,
  dsNutritionByYear,
  dsRegisteredByCentre,
  dsRegistry,
  dsRegistryTrend,
  dsYearTotals,
  placeName,
  type DsMonthlyMetric,
  type DsYearRow,
  type Year,
} from '../data/years/childrenA'
import { C, YEAR_COLORS } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const T = dsYearTotals
const total = T['2025'].registered
const share = (v: number, year: Year) => pct((v / T[year].registered) * 100, 0)

/** One bar per year, 2023 → 2025, in the shared year colours. */
const YEAR_SERIES = YEARS.map((y) => ({ key: `y${y}`, name: y, color: YEAR_COLORS[y] }))

/** Monthly activity exists for 2024 only; the other years stay in the legend as not reported. */
const MONTHLY_SERIES = YEARS.map((y) => ({
  key: `y${y}`,
  name: y === '2024' ? y : `${y} (not reported)`,
  color: YEAR_COLORS[y],
}))

const NOT_RECORDED = 'Not recorded'
const yearCell = (row: DsYearRow, y: Year, missing: string = NOT_RECORDED) => {
  const v = row[`y${y}`]
  return v === null ? <span className="text-ink/55">{missing}</span> : int(v)
}

/** Most common condition in each year, with its share of that year's registry. */
const topByYear = YEARS.map((y) => {
  const top = dsConditionsByYear.reduce((a, b) => ((b[`y${y}`] ?? -1) > (a[`y${y}`] ?? -1) ? b : a))
  const count = top[`y${y}`] ?? 0
  return `${y}: ${top.label.toLowerCase()} ${int(count)} (${share(count, y)})`
}).join('; ')

/** Children with a weight category recorded vs children registered, per year. */
const weighed = (y: Year) => dsNutritionByYear.reduce((a, r) => a + (r[`y${y}`] ?? 0), 0)
const weighedText = YEARS.map((y) => `${int(weighed(y))} for ${int(T[y].registered)} registered in ${y}`).join(', ')

const MORBIDITY_TABLE_KEYS = [...DS_CONDITIONS.map((c) => c.key), 'underweight', 'overweight'] as const

const priorHint = (field: 'registered' | 'newCases' | 'age0to5') =>
  `2024: ${int(T['2024'][field])} · 2023: ${int(T['2023'][field])}`

export default function DownSyndrome() {
  const [year, setYear] = useState<Year>('2025')
  const [monthlyMetric, setMonthlyMetric] = useState<DsMonthlyMetric>('newCases')
  const rows = dsRegistry[year]

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Dna}
        title="Down Syndrome Registry"
        subtitle="Registered cases by health centre, associated comorbidities and nutrition — 2023, 2024 and 2025"
      />

      <section aria-label="Down syndrome programme capacity">
        <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Workshops conducted', value: 2 },
            { label: 'Awareness campaigns conducted', value: 2 },
            { label: 'Master trainers in North Al Batinah Governorate', value: 2 },
          ].map(({ label, value }) => (
            <div key={label} className="card flex flex-col p-5">
              <dt className="text-caption font-medium text-ink/75">{label}</dt>
              <dd className="mt-auto pt-3 text-3xl font-medium tabular-nums text-heading">{value}</dd>
            </div>
          ))}
          <div className="card flex flex-col p-5">
            <dt className="text-caption font-medium text-ink/75">Focal points in institutions</dt>
            <dd className="mt-auto flex gap-6 pt-3 text-heading">
              <span className="flex flex-col gap-1"><span className="text-3xl font-medium tabular-nums">{ds2025.focalPoints.doctors}</span><span className="text-sm">Doctors</span></span>
              <span className="flex flex-col gap-1"><span className="text-3xl font-medium tabular-nums">{ds2025.focalPoints.nurses}</span><span className="text-sm">Nurses</span></span>
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <DataTable
            dense
            columns={[{ label: 'Capacity by year' }, ...YEARS.map((y) => ({ label: y, align: 'right' as const }))]}
            rows={dsCapacityByYear.map((r) => [r.label, ...YEARS.map((y) => yearCell(r, y, NOT_REPORTED))])}
          />
        </div>
        <div className="mt-3">
          <Note title="Sources:">
            2023 and 2024 are the 5-year-plan child-health indicators; the plan has no 2025 figure, so 2025 is shown
            as “{NOT_REPORTED}”. The workshop, campaign, master-trainer and focal-point cards are the department&apos;s
            update and do not state a year.
          </Note>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Total Registered (2025)"
          value={int(total)}
          icon={Dna}
          accent="navy"
          delta={deltaPct(total, T['2024'].registered)}
          deltaTone="neutral"
          hint={priorHint('registered')}
        />
        <KpiCard
          label="Newly Diagnosed (2025)"
          value={int(T['2025'].newCases)}
          icon={Activity}
          accent="azure"
          delta={deltaPct(T['2025'].newCases, T['2024'].newCases)}
          deltaTone="neutral"
          hint={priorHint('newCases')}
        />
        <KpiCard
          label="Children Aged 0–5 (2025)"
          value={int(T['2025'].age0to5)}
          icon={Users}
          accent="teal"
          hint={`${share(T['2025'].age0to5, '2025')} of registry · ${priorHint('age0to5')}`}
        />
        <KpiCard
          label="Male : Female (2025)"
          value={`${T['2025'].male} : ${T['2025'].female}`}
          icon={HeartPulse}
          accent="gold"
          hint={`2024: ${T['2024'].male} : ${T['2024'].female} · 2023: ${T['2023'].male} : ${T['2023'].female}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Registered Cases by Health Centre" subtitle="2023, 2024 and 2025">
          <ComparisonBars
            data={dsRegisteredByCentre}
            xKey="center"
            layout="vertical"
            height={380}
            categoryWidth={112}
            series={YEAR_SERIES}
          />
        </ChartCard>
        <ChartCard
          title="Registry Size & New Diagnoses by Year"
          subtitle="All six health-centre clinics, 2023–2025"
          footnote={`Registered children: ${dsRegistryTrend.map((r) => `${int(r.registered)} (${r.year})`).join(', ')}.`}
        >
          <ComparisonBars
            data={dsRegistryTrend}
            xKey="year"
            height={380}
            series={[
              { key: 'registered', name: 'Registered', color: C.navy },
              { key: 'newCases', name: 'Newly diagnosed', color: C.teal },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Age Distribution by Year" subtitle="Registered children per age group, 2023–2025">
          <ComparisonBars data={dsAgeByYear} xKey="band" height={320} series={YEAR_SERIES} />
        </ChartCard>
        <ChartCard
          title="Nutritional Status by Year"
          subtitle="Children in each weight category, 2023–2025"
          footnote={`Weight categories recorded: ${weighedText}. The 2023 and 2024 summaries count more weight records than registered children; figures are shown as reported.`}
        >
          <ComparisonBars data={dsNutritionByYear} xKey="label" height={320} series={YEAR_SERIES} />
        </ChartCard>
      </div>

      <ChartCard
        title="Associated Comorbidities by Year"
        subtitle="Children with each condition, all health centres — 2023, 2024 and 2025"
        footnote={`Most common condition — ${topByYear}.`}
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[3fr_2fr]">
          <ComparisonBars
            data={dsConditionsByYear}
            xKey="label"
            layout="vertical"
            height={560}
            categoryWidth={124}
            series={YEAR_SERIES}
          />
          <DataTable
            dense
            columns={[
              { label: 'Condition' },
              ...YEARS.map((y) => ({ label: y, align: 'right' as const })),
            ]}
            rows={dsConditionsByYear.map((r) => [r.label, ...YEARS.map((y) => yearCell(r, y))])}
          />
        </div>
        <div className="mt-3 space-y-3">
          <Note title="Categories differ by year:">
            The 2023 and 2024 summaries record growth issues and asthma; the 2025 workbook does not, and
            instead records diabetes and haematological conditions. A category missing from a year is shown
            as “{NOT_RECORDED}”, not zero. Thyroid for 2025 is hypothyroidism plus hyperthyroidism (recorded
            separately in 2025), shown against the earlier “Thyroid problems” count.
          </Note>
          <Note tone="warn" title="Shown as reported:">
            Developmental delay is {int(dsConditionsByYear.find((r) => r.label === 'Developmental delay')?.y2025 ?? 0)} in
            2025 against {int(dsConditionsByYear.find((r) => r.label === 'Developmental delay')?.y2024 ?? 0)} in 2024 — some
            clinics recorded every registered child. Confirm the recording basis with the source before comparing years.
          </Note>
        </div>
      </ChartCard>

      <ChartCard
        title={`Monthly ${monthlyMetric === 'newCases' ? 'New Cases' : 'Assessments'} by Year`}
        subtitle="Registry activity through the year — 2023, 2024 and 2025"
        action={
          <Segmented label="Figure" options={DS_MONTHLY_OPTIONS} value={monthlyMetric} onChange={setMonthlyMetric} />
        }
      >
        <TrendChart data={dsMonthlyByYear(monthlyMetric)} xKey="month" unit="" series={MONTHLY_SERIES} />
        <div className="mt-3">
          <Note title="Not reported:">
            Monthly registry activity is available for 2024 only. The source provides no monthly figures for 2023
            or 2025, so those years appear in the legend without a line; annual new diagnoses for all three years are
            in the chart “Registry Size & New Diagnoses by Year”.
          </Note>
        </div>
      </ChartCard>

      <div>
        <SectionTitle icon={Table2} title="Registry by Health Centre" subtitle="Registered children, new cases, gender and age group — choose a year" />
        <ChartCard
          title={`Registered Cases by Health Centre (${year})`}
          subtitle="Six health-centre clinics"
          action={<Segmented label="Year" options={YEAR_OPTIONS} value={year} onChange={setYear} />}
        >
          <DataTable
            dense
            columns={[
              { label: 'Health Centre' },
              { label: 'Registered', align: 'right' },
              { label: 'New Cases', align: 'right' },
              { label: 'Males', align: 'right' },
              { label: 'Females', align: 'right' },
              { label: 'Age 0–5', align: 'right' },
              { label: 'Age 6–12', align: 'right' },
              { label: 'Age 13–18', align: 'right' },
            ]}
            rows={rows.map((r) => [r.name, ...DS_REGISTRY_FIELDS.map((f) => int(r[f]))])}
            total={['TOTAL', ...DS_REGISTRY_FIELDS.map((f) => int(T[year][f]))]}
          />
        </ChartCard>
      </div>

      <ChartCard title="Associated Comorbidities by Health Centre (2025 only)" subtitle="Number of registered children with each condition">
        <DataTable
          dense
          columns={[
            { label: 'Health Centre' },
            { label: 'Registered', align: 'right' },
            ...DS_CONDITIONS.map((c) => ({ label: c.label, align: 'right' as const })),
            { label: 'Underweight', align: 'right' },
            { label: 'Overweight / obese', align: 'right' },
          ]}
          rows={ds2025.centres.map((c) => [
            placeName(c.name),
            int(c.registered),
            ...MORBIDITY_TABLE_KEYS.map((k) => int(c.comorbidities[k])),
          ])}
          total={['TOTAL', int(total), ...MORBIDITY_TABLE_KEYS.map((k) => int(dsTotals.comorbidities[k]))]}
        />
        <div className="mt-3 space-y-3">
          <Note title="Source:">
            {ds2025.source.filename} — annual report of children with Down syndrome, January–December 2025.
            A child can have more than one condition. Comorbidities by health centre are not reported for 2023 or
            2024; those years are available as governorate totals only (chart above).
          </Note>
          {ds2025.flags.length > 0 && (
            <Note tone="warn" title="To verify with the source:">
              {ds2025.flags.map(placeName).join(' ')}
            </Note>
          )}
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section aria-labelledby="ds-programme-challenges" className="card p-6">
          <h2 id="ds-programme-challenges" className="text-title text-heading">Programme Challenges</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-body text-ink/80 marker:text-teal">
            <li>No genetic counsellor is currently available in North Al Batinah Governorate.</li>
            <li>Social affairs require an IQ test for children with Down syndrome, but only one psychologist is available.</li>
          </ul>
        </section>
        <section aria-labelledby="ds-achievements" className="card p-6">
          <h2 id="ds-achievements" className="text-title text-heading">Achievements</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-body text-ink/80 marker:text-teal">
            <li>
              Research study: <cite className="not-italic font-medium text-heading">“A Digital Health Approach to Supporting Caregivers of Children with Down Syndrome in Oman: Development of a Web-Based Toolkit”</cite>.
            </li>
            <li>A poster presentation on the Basma app won third place at COMHS Research Day.</li>
            <li>An oral presentation was delivered at a paediatric conference in Taiwan.</li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="ds-future-plan" className="card p-6">
        <h2 id="ds-future-plan" className="text-title text-heading">Future Plan</h2>
        <ul className="mt-4 space-y-5 text-body text-ink/80">
          <li className="grid items-center gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="font-semibold text-heading">Launch the Basma app.</p>
              <p className="mt-2">BASMAH — Caregiver Toolkit for Down Syndrome</p>
              <p className="mt-2 text-ink/75">Scan a QR code, or select it to open its link.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Google Play Store', image: '/basma/google-play-qr.png', url: 'https://q.me-qr.com/nh2qqjkk' },
                { label: 'Apple Store', image: '/basma/apple-store-qr.png', url: 'https://q.me-qr.com/lq6nayae' },
              ].map(({ label, image, url }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  aria-label={`Open the Basma ${label} QR link (opens in a new tab)`}
                  className="flex min-w-0 flex-col items-center gap-3 rounded-card border border-[rgb(var(--card-border))] bg-surface p-3 text-center font-semibold text-heading shadow-card transition-shadow hover:shadow-card-hover">
                  <span className="block w-full max-w-44 rounded-control bg-white p-3">
                    <img src={image} alt={`Basma QR code labelled ${label} in the supplied PDF`} width={707} height={707}
                      className="h-auto w-full" loading="lazy" />
                  </span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </li>
          <li className="border-t border-sky pt-4 dark:border-[rgb(var(--card-border))]">Publish the research paper.</li>
        </ul>
      </section>
    </div>
  )
}
