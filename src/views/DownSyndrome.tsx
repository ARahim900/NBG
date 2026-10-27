import { useState } from 'react'
import { Activity, Dna, HeartPulse, Table2, Users } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import ProgrammeProfile from '../components/ui/ProgrammeProfile'
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
import { METRIC, YEAR_COLORS } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const T = dsYearTotals
const total = T['2025'].registered
const share = (v: number, year: Year) => pct((v / T[year].registered) * 100, 0)

/** One bar per year, 2023 → 2025, in the shared year colours. */
const YEAR_SERIES = YEARS.map((y) => ({ key: `y${y}`, name: y, color: YEAR_COLORS[y] }))

/** Monthly activity exists for 2024 only; the other years stay in the legend marked "no data supplied". */
const MONTHLY_SERIES = YEARS.map((y) => ({
  key: `y${y}`,
  name: y === '2024' ? y : `${y} (${NOT_REPORTED.toLowerCase()})`,
  color: YEAR_COLORS[y],
}))

const yearCell = (row: DsYearRow, y: Year, missing: string = NOT_REPORTED) => {
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

/** Row 1 pairs vertical centre bars with a trend; both use the taller height so the cards line up. */
const CENTRE_ROW_HEIGHT = Math.max(300, 44 * dsRegisteredByCentre.length)

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
        <ChartCard title="Registered Cases by Health Centre" subtitle="Count · 2023, 2024 and 2025">
          <ComparisonBars
            data={dsRegisteredByCentre}
            xKey="center"
            layout="vertical"
            height={CENTRE_ROW_HEIGHT}
            categoryWidth={112}
            series={YEAR_SERIES}
          />
        </ChartCard>
        <ChartCard
          title="Registry Size & New Diagnoses by Year"
          subtitle="Count · all six health-centre clinics · 2023, 2024 and 2025"
          footnote={`Registered children: ${dsRegistryTrend.map((r) => `${int(r.registered)} (${r.year})`).join(', ')}.`}
        >
          <TrendChart
            data={dsRegistryTrend}
            xKey="year"
            unit=""
            height={CENTRE_ROW_HEIGHT}
            series={[
              { key: 'registered', name: 'Registered', color: METRIC[0] },
              { key: 'newCases', name: 'Newly diagnosed', color: METRIC[1] },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Age Distribution by Year" subtitle="Count of registered children per age group · 2023, 2024 and 2025">
          <ComparisonBars data={dsAgeByYear} xKey="band" height={300} series={YEAR_SERIES} />
        </ChartCard>
        <ChartCard
          title="Nutritional Status by Year"
          subtitle="Count of children in each weight category · 2023, 2024 and 2025"
          footnote={`Weight categories recorded: ${weighedText}. The 2023 and 2024 summaries count more weight records than registered children; figures are shown as reported.`}
        >
          <ComparisonBars data={dsNutritionByYear} xKey="label" height={300} series={YEAR_SERIES} />
        </ChartCard>
      </div>

      <ChartCard
        title="Associated Comorbidities by Year"
        subtitle="Count of children with each condition, all health centres · 2023, 2024 and 2025"
        footnote={`Most common condition — ${topByYear}. Growth issues = underweight, the same definition as 2023 (23) and 2024 (32).`}
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[3fr_2fr]">
          <ComparisonBars
            data={dsConditionsByYear}
            xKey="label"
            layout="vertical"
            height={Math.max(260, 44 * dsConditionsByYear.length)}
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
            The 2023 and 2024 summaries record asthma; the 2025 workbook does not, and instead records diabetes
            and haematological conditions. A category missing from a year is shown as “{NOT_REPORTED}”, not zero.
            Thyroid for 2025 is hypothyroidism plus hyperthyroidism (recorded separately in 2025), shown against
            the earlier “Thyroid problems” count. Growth issues for 2025 is the 2025 underweight total.
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
        subtitle="Count · 2023, 2024 and 2025"
        action={
          <Segmented label="Figure" options={DS_MONTHLY_OPTIONS} value={monthlyMetric} onChange={setMonthlyMetric} />
        }
      >
        <TrendChart data={dsMonthlyByYear(monthlyMetric)} xKey="month" unit="" height={300} series={MONTHLY_SERIES} />
        <div className="mt-3">
          <Note title="No data supplied:">
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
          subtitle={`Count · six health-centre clinics · ${year}`}
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

      <ChartCard title="Associated Comorbidities by Health Centre (2025 Only)" subtitle="Count of registered children with each condition · 2025">
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
            A child can have more than one condition. No comorbidities by health centre were supplied for 2023 or
            2024; those years are available as governorate totals only (chart above).
          </Note>
          {ds2025.flags.length > 0 && (
            <Note tone="warn" title="To verify with the source:">
              {ds2025.flags.map(placeName).join(' ')}
            </Note>
          )}
        </div>
      </ChartCard>

      <ProgrammeProfile
        id="ds-programme"
        caption="Department update · workshops, campaigns, trainers and focal points do not state a year"
        facts={[
          { label: 'Workshops conducted', value: 2 },
          { label: 'Awareness campaigns', value: 2 },
          { label: 'Master trainers', value: 2, detail: 'North Al Batinah Governorate' },
          {
            label: 'Focal points in institutions',
            value: ds2025.focalPoints.doctors + ds2025.focalPoints.nurses,
            detail: `${ds2025.focalPoints.doctors} doctors · ${ds2025.focalPoints.nurses} nurses`,
          },
        ]}
        byYear={
          <>
            <DataTable
              dense
              columns={[{ label: 'Health centres' }, ...YEARS.map((y) => ({ label: y, align: 'right' as const }))]}
              rows={dsCapacityByYear.map((r) => [r.label, ...YEARS.map((y) => yearCell(r, y, NOT_REPORTED))])}
            />
            <p className="mt-2 text-caption text-ink/60">
              2023 and 2024 are from the 5-year plan. 2025: the 6 clinics in the 2025 Down syndrome report, all with
              trained staff (confirmed by the department).
            </p>
          </>
        }
        challenges={[
          'No genetic counsellor is currently available in North Al Batinah Governorate.',
          'Social affairs require an IQ test for children with Down syndrome, but only one psychologist is available.',
        ]}
        achievements={[
          <>
            Research study:{' '}
            <cite className="not-italic font-medium text-heading">
              “A Digital Health Approach to Supporting Caregivers of Children with Down Syndrome in Oman: Development of a
              Web-Based Toolkit”
            </cite>
            .
          </>,
          'A poster presentation on the Basma app won third place at COMHS Research Day.',
          'An oral presentation was delivered at a paediatric conference in Taiwan.',
        ]}
        plan={[
          <>
            <span className="font-semibold text-heading">Launch the Basma app</span> — BASMAH, the caregiver toolkit for
            Down syndrome. Scan a QR code, or select it to open its link.
            <span className="mt-3 flex flex-wrap gap-3">
              {[
                { label: 'Google Play Store', image: '/basma/google-play-qr.png', url: 'https://q.me-qr.com/nh2qqjkk' },
                { label: 'Apple Store', image: '/basma/apple-store-qr.png', url: 'https://q.me-qr.com/lq6nayae' },
              ].map(({ label, image, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open the Basma ${label} QR link (opens in a new tab)`}
                  className="flex w-28 flex-col items-center gap-1.5 rounded-control border border-[rgb(var(--card-border))] bg-surface p-2 text-center text-caption font-semibold text-heading transition-shadow hover:shadow-card-hover"
                >
                  <span className="block w-full rounded-control bg-white p-1.5">
                    <img
                      src={image}
                      alt={`Basma QR code labelled ${label} in the supplied PDF`}
                      width={707}
                      height={707}
                      className="h-auto w-full"
                      loading="lazy"
                    />
                  </span>
                  {label}
                </a>
              ))}
            </span>
          </>,
          'Publish the research paper.',
        ]}
      />
    </div>
  )
}
