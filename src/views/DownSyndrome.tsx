import { Activity, Dna, HeartPulse, Table2, Users } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, DonutChart, TrendChart } from '../components/charts/Charts'
import { ds } from '../data/nbg'
import { C } from '../lib/theme'
import { int, pct } from '../lib/format'

const gv = (starts: string): number =>
  ds.gov2025.find((r) => r.metric.startsWith(starts))?.value ?? 0

const totalReg = gv('Total registered')
const newCases = gv('Newly diagnosed')
const males = gv('Males')
const females = gv('Females')

const ageData = [
  { name: '0–5 years', value: gv('Age 0-5'), color: C.azure },
  { name: '6–12 years', value: gv('Age 6-12'), color: C.teal },
  { name: '13–18 years', value: gv('Age 13-18'), color: C.gold },
]

const morb2024 = ds.morbidities('2024')
const nutrition2024 = ds.nutrition('2024').map((r, i) => ({
  name: r.label,
  value: r.count,
  color: [C.alert, C.good, C.gold][i],
}))

// Totals for the 2024 facility table (sum numeric columns 1..7)
const numCols = [1, 2, 3, 4, 5, 6, 7]
const facTotals = numCols.map((j) =>
  ds.facilities2024.reduce((acc, row) => acc + Number(row[j]), 0),
)

export default function DownSyndrome() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Dna}
        title="Down Syndrome Registry"
        subtitle="Registered cases, associated morbidities & nutrition — 2023, 2024 & 2025 governorate registry"
      />

      <section aria-label="Down syndrome programme capacity">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Workshops conducted', value: 2 },
            { label: 'Awareness campaigns conducted', value: 2 },
            { label: 'Master trainers in North Al Batinah Governorate', value: 2 },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col rounded-2xl border border-[#A4C5BB]/60 bg-[#A4C5BB]/10 p-5 shadow-sm">
              <dt className="text-sm font-medium text-[#4E4456] dark:text-[#A4C5BB]">{label}</dt>
              <dd className="mt-auto pt-3 text-4xl font-semibold tabular-nums text-[#4E4456] dark:text-white">{value}</dd>
            </div>
          ))}
          <div className="flex flex-col rounded-2xl border border-[#A4C5BB]/60 bg-[#A4C5BB]/10 p-5 shadow-sm">
            <dt className="text-sm font-medium text-[#4E4456] dark:text-[#A4C5BB]">Focal points in institutions</dt>
            <dd className="mt-auto flex gap-6 pt-3 text-[#4E4456] dark:text-white">
              <span className="flex flex-col gap-1"><span className="text-4xl font-semibold tabular-nums">6</span><span className="text-sm">Doctors</span></span>
              <span className="flex flex-col gap-1"><span className="text-4xl font-semibold tabular-nums">6</span><span className="text-sm">Nurses</span></span>
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Total Registered (2025)"
          value={int(totalReg)}
          icon={Dna}
          accent="navy"
          hint="Cumulative governorate registry"
        />
        <KpiCard
          label="Newly Diagnosed (2025)"
          value={int(newCases)}
          icon={Activity}
          accent="azure"
          hint="New cases this year"
        />
        <KpiCard
          label="Children Aged 0–5 (2025)"
          value={int(gv('Age 0-5'))}
          icon={Users}
          accent="teal"
          hint={`${pct((gv('Age 0-5') / totalReg) * 100, 0)} of registry`}
        />
        <KpiCard
          label="Male : Female (2025)"
          value={`${males} : ${females}`}
          icon={HeartPulse}
          accent="gold"
          hint="Registry gender split"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Registered Cases by Health Centre"
          subtitle="2023 vs 2024"
        >
          <ComparisonBars
            data={ds.yearComparison}
            xKey="center"
            layout="vertical"
            height={300}
            series={[
              { key: 'y2023', name: '2023', color: C.teal },
              { key: 'y2024', name: '2024', color: C.azure },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Age Distribution (2025)"
          subtitle={`${int(totalReg)} registered children`}
        >
          <DonutChart data={ageData} height={300} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Associated Morbidities (2024)"
          subtitle="Conditions among registered children"
          footnote="Cardiac issues remain the most common comorbidity (~44%)."
        >
          <ComparisonBars
            data={morb2024}
            xKey="label"
            layout="vertical"
            height={320}
            series={[{ key: 'count', name: 'Cases', color: C.navy }]}
            showLegend={false}
          />
        </ChartCard>
        <ChartCard
          title="Nutritional Status (2024)"
          subtitle="Weight categories"
          footnote="Most registered children (71%) are a normal weight; 17% are overweight or obese and 13% underweight."
        >
          <DonutChart data={nutrition2024} height={320} />
        </ChartCard>
      </div>

      <ChartCard
        title="Monthly New Cases & Assessments (2024)"
        subtitle="Registry activity through the year"
      >
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
        <SectionTitle
          icon={Table2}
          title="Detailed Registry (2024)"
          subtitle="By health centre"
        />
        <ChartCard title="Registered Cases by Health Centre (2024)" subtitle="">
          <DataTable
            columns={[
              { label: ds.facilityHeaders[0] },
              { label: ds.facilityHeaders[1], align: 'right' },
              { label: ds.facilityHeaders[2], align: 'right' },
              { label: ds.facilityHeaders[3], align: 'right' },
              { label: ds.facilityHeaders[4], align: 'right' },
              { label: ds.facilityHeaders[5], align: 'right' },
              { label: ds.facilityHeaders[6], align: 'right' },
              { label: ds.facilityHeaders[7], align: 'right' },
            ]}
            rows={ds.facilities2024.map((row) => [
              row[0],
              ...numCols.map((j) => int(Number(row[j]))),
            ])}
            total={['TOTAL', ...facTotals.map((t) => int(t))]}
            dense
          />
          <div className="mt-3">
            <Note title="2025:">{ds.note2025}</Note>
          </div>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section aria-labelledby="ds-programme-challenges" className="rounded-2xl border border-[#4E4456]/20 bg-surface p-6 shadow-sm dark:border-[#A4C5BB]/40">
          <h2 id="ds-programme-challenges" className="text-xl font-semibold text-[#4E4456] dark:text-white">Programme Challenges</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink">No genetic counsellor is currently available in North Al Batinah Governorate.</p>
        </section>
        <section aria-labelledby="ds-achievements" className="rounded-2xl border border-[#A4C5BB]/60 bg-[#A4C5BB]/10 p-6 shadow-sm">
          <h2 id="ds-achievements" className="text-xl font-semibold text-[#4E4456] dark:text-white">Achievements</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-[#A4C5BB]">
            <li>A poster presentation on the Basma app won third place at COMHS Research Day.</li>
            <li>An oral presentation was delivered at a paediatric conference in Taiwan.</li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="ds-future-plan" className="rounded-2xl border border-[#A4C5BB]/60 bg-[#A4C5BB]/10 p-6 shadow-sm">
        <h2 id="ds-future-plan" className="text-xl font-semibold text-[#4E4456] dark:text-white">Future Plan</h2>
        <ul className="mt-4 space-y-5 text-sm leading-relaxed text-ink">
          <li className="grid items-center gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="font-semibold">Launch the Basma app.</p>
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
                  className="flex min-w-0 flex-col items-center gap-3 rounded-xl border border-[#A4C5BB]/60 bg-surface p-3 text-center font-semibold text-[#4E4456] shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4E4456] dark:text-[#A4C5BB] dark:focus-visible:outline-[#A4C5BB]">
                  <span className="block w-full max-w-44 rounded-lg bg-white p-3">
                    <img src={image} alt={`Basma QR code labelled ${label} in the supplied PDF`} width={707} height={707}
                      className="h-auto w-full" loading="lazy" />
                  </span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </li>
          <li className="border-t border-[#A4C5BB]/40 pt-4">Publish the research paper.</li>
        </ul>
      </section>
    </div>
  )
}
