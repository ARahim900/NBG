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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Registered Cases by Health Centre"
          subtitle="2023 vs 2024"
          className="xl:col-span-2"
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
          <DonutChart data={ageData} />
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
        >
          <DonutChart data={nutrition2024} />
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
    </div>
  )
}
