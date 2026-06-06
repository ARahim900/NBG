import { Activity, CalendarX, HeartPulse, Sigma, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, DonutChart } from '../components/charts/Charts'
import { md, sumBy } from '../data/nbg'
import { C, SERIES } from '../lib/theme'
import { int } from '../lib/format'

const total10yr = sumBy(md.byYear, (r) => r.deaths)
const peak = md.byYear.reduce((a, b) => (b.deaths > a.deaths ? b : a))
const deaths2024 = md.byYear.find((r) => r.year === '2024')?.deaths ?? 0
const deaths2023 = md.byYear.find((r) => r.year === '2023')?.deaths ?? 0

const causeSlices = md.causesCount.map((r, i) => ({
  name: r.cause,
  value: r.deaths,
  color: SERIES[i % SERIES.length],
}))

export default function MaternalDeaths() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={HeartPulse}
        title="Maternal Deaths — 10-Year Surveillance"
        subtitle="Deaths by year (2015–2024), causes and recent records"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Deaths (2024)"
          value={int(deaths2024)}
          icon={HeartPulse}
          accent="navy"
          hint="Latest surveillance year"
        />
        <KpiCard
          label="Deaths (2023)"
          value={int(deaths2023)}
          icon={Activity}
          accent="azure"
          hint="Prior year"
        />
        <KpiCard
          label="10-Year Total"
          value={int(total10yr)}
          icon={Sigma}
          accent="gold"
          hint="2015–2024 cumulative"
        />
        <KpiCard
          label="Peak Year"
          value={peak.year}
          icon={CalendarX}
          accent="navy"
          hint={`${peak.deaths} deaths (COVID-19 era)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Maternal Deaths by Year"
          subtitle="2015–2024"
          footnote="The 2020–2021 spike coincides with the COVID-19 pandemic; 2023–2024 returned to 1 death/year."
        >
          <ComparisonBars
            data={md.byYear}
            xKey="year"
            height={300}
            series={[{ key: 'deaths', name: 'Deaths', color: C.navy }]}
            showLegend={false}
          />
        </ChartCard>
        <ChartCard
          title="Causes of Death"
          subtitle="Cumulative count"
          footnote="Brought-dead and postpartum haemorrhage together account for ~43% of the 30 recorded deaths."
        >
          <DonutChart data={causeSlices} height={300} />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="Records"
          subtitle="Causes and recent cases"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Causes of Death" subtitle="Count by cause">
            <DataTable
              columns={[
                { label: 'Cause' },
                { label: 'Deaths', align: 'right' },
              ]}
              rows={md.causesCount.map((r) => [r.cause, int(r.deaths)])}
              total={['TOTAL', int(sumBy(md.causesCount, (r) => r.deaths))]}
            />
          </ChartCard>
          <ChartCard title="Recent Death Records" subtitle="Most recent cases">
            <DataTable
              columns={[
                { label: 'Year' },
                { label: 'Date' },
                { label: 'Cause' },
              ]}
              rows={md.recent.map((r) => [r.year, r.date, r.cause])}
              dense
            />
          </ChartCard>
        </div>
      </div>

      <Note title="2025:">{md.note2025}</Note>
    </div>
  )
}
