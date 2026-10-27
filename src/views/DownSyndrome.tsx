import { useState } from 'react'
import { Activity, Dna, HeartPulse, Table2, Users } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, DonutChart, TrendChart } from '../components/charts/Charts'
import { ds } from '../data/nbg'
import { DS_CONDITIONS, ds2025, dsTotals } from '../data/wch2025'
import { C, YEAR_COLORS } from '../lib/theme'
import { int, pct } from '../lib/format'

const total = dsTotals.registered
const share = (v: number) => pct((v / total) * 100, 0)

const ageData = [
  { name: '0–5 years', value: dsTotals.age0to5, color: C.azure },
  { name: '6–12 years', value: dsTotals.age6to12, color: C.teal },
  { name: '13–18 years', value: dsTotals.age13to18, color: C.gold },
]

const conditions = DS_CONDITIONS.map(({ key, label }) => ({ label, count: dsTotals.comorbidities[key] }))
const topCondition = conditions.reduce((a, b) => (b.count > a.count ? b : a))

const m = dsTotals.comorbidities
const weighed = m.underweight + m.normalWeight + m.overweight
const nutrition = [
  { name: 'Underweight', value: m.underweight, color: C.alert },
  { name: 'Normal weight', value: m.normalWeight, color: C.good },
  { name: 'Overweight / obese', value: m.overweight, color: C.gold },
]

/** Registered cases per health centre, 2023–2025 (centre names match across years). */
const yearComparison = ds.yearComparison.map((r) => ({
  ...r,
  y2025: ds2025.centres.find((c) => c.name === r.center)?.registered ?? 0,
}))

// One shape for the registry table whatever the year.
interface RegistryRow {
  name: string
  registered: number
  newCases: number
  male: number
  female: number
  age0to5: number
  age6to12: number
  age13to18: number
}
const fromTuple = (r: (string | number)[]): RegistryRow => ({
  name: String(r[0]),
  registered: Number(r[1]),
  newCases: Number(r[2]),
  male: Number(r[3]),
  female: Number(r[4]),
  age0to5: Number(r[5]),
  age6to12: Number(r[6]),
  age13to18: Number(r[7]),
})
type Year = '2023' | '2024' | '2025'
const REGISTRY: Record<Year, RegistryRow[]> = {
  '2023': ds.facilities2023.map(fromTuple),
  '2024': ds.facilities2024.map(fromTuple),
  '2025': ds2025.centres,
}
const YEAR_OPTIONS: { value: Year; label: string }[] = [
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
]
const REGISTRY_FIELDS: (keyof Omit<RegistryRow, 'name'>)[] = [
  'registered',
  'newCases',
  'male',
  'female',
  'age0to5',
  'age6to12',
  'age13to18',
]

const MORBIDITY_TABLE_KEYS = [...DS_CONDITIONS.map((c) => c.key), 'underweight', 'overweight'] as const

export default function DownSyndrome() {
  const [year, setYear] = useState<Year>('2025')
  const rows = REGISTRY[year]

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Dna}
        title="Down Syndrome Registry"
        subtitle="Registered cases by health centre, associated comorbidities & nutrition — 2023 to 2025"
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
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard label="Total Registered (2025)" value={int(total)} icon={Dna} accent="navy" hint={`${ds2025.centres.length} health-centre clinics`} />
        <KpiCard label="Newly Diagnosed (2025)" value={int(dsTotals.newCases)} icon={Activity} accent="azure" hint="New cases this year" />
        <KpiCard label="Children Aged 0–5 (2025)" value={int(dsTotals.age0to5)} icon={Users} accent="teal" hint={`${share(dsTotals.age0to5)} of registry`} />
        <KpiCard label="Male : Female (2025)" value={`${dsTotals.male} : ${dsTotals.female}`} icon={HeartPulse} accent="gold" hint="Registry gender split" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Registered Cases by Health Centre" subtitle="2023, 2024 & 2025">
          <ComparisonBars
            data={yearComparison}
            xKey="center"
            layout="vertical"
            height={340}
            series={[
              { key: 'y2023', name: '2023', color: YEAR_COLORS['2023'] },
              { key: 'y2024', name: '2024', color: YEAR_COLORS['2024'] },
              { key: 'y2025', name: '2025', color: YEAR_COLORS['2025'] },
            ]}
          />
        </ChartCard>
        <ChartCard title="Age Distribution (2025)" subtitle={`${int(total)} registered children`}>
          <DonutChart data={ageData} height={340} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Associated Comorbidities (2025)"
          subtitle="Children with each condition, all health centres"
          footnote={`${topCondition.label} conditions remain the most common comorbidity (${int(topCondition.count)} children, ${share(topCondition.count)} of the registry).`}
        >
          <ComparisonBars
            data={conditions}
            xKey="label"
            layout="vertical"
            height={340}
            categoryWidth={120}
            series={[{ key: 'count', name: 'Children', color: C.navy }]}
            showLegend={false}
          />
        </ChartCard>
        <ChartCard
          title="Nutritional Status (2025)"
          subtitle="Weight categories"
          footnote={`Weight category recorded for ${int(weighed)} of ${int(total)} registered children: ${pct((m.normalWeight / weighed) * 100, 0)} normal weight, ${pct((m.underweight / weighed) * 100, 0)} underweight and ${pct((m.overweight / weighed) * 100, 0)} overweight or obese.`}
        >
          <DonutChart data={nutrition} height={340} />
        </ChartCard>
      </div>

      <ChartCard title="Monthly New Cases & Assessments (2024)" subtitle="Registry activity through the year">
        <TrendChart
          data={ds.monthly2024}
          xKey="month"
          series={[
            { key: 'assessments', name: 'Assessments', color: C.azure },
            { key: 'newCases', name: 'New cases', color: C.alert },
          ]}
        />
      </ChartCard>

      <div>
        <SectionTitle icon={Table2} title="Registry by Health Centre" subtitle="Registered children, new cases, gender and age group" />
        <ChartCard
          title={`Registered Cases by Health Centre (${year})`}
          subtitle=""
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
            rows={rows.map((r) => [r.name, ...REGISTRY_FIELDS.map((f) => int(r[f]))])}
            total={['TOTAL', ...REGISTRY_FIELDS.map((f) => int(rows.reduce((a, r) => a + r[f], 0)))]}
          />
        </ChartCard>
      </div>

      <ChartCard title="Associated Comorbidities by Health Centre (2025)" subtitle="Number of registered children with each condition">
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
            c.name,
            int(c.registered),
            ...MORBIDITY_TABLE_KEYS.map((k) => int(c.comorbidities[k])),
          ])}
          total={['TOTAL', int(total), ...MORBIDITY_TABLE_KEYS.map((k) => int(dsTotals.comorbidities[k]))]}
        />
        <div className="mt-3 space-y-3">
          <Note title="Source:">
            {ds2025.source.filename} — annual report of children with Down syndrome, January–December 2025.
            A child can have more than one condition.
          </Note>
          {ds2025.flags.length > 0 && (
            <Note tone="warn" title="To verify with the source:">
              {ds2025.flags.join(' ')}
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
