import { Activity, CalendarX, HeartPulse, Sigma, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { md, sumBy } from '../data/nbg'
import { mdByYear, mdCause, mdDeaths, ukLabel, type Year } from '../data/years/women'
import { METRIC } from '../lib/theme'
import { int } from '../lib/format'

const firstYear = md.byYear[0]?.year ?? ''
const lastYear = md.byYear[md.byYear.length - 1]?.year ?? ''
const total10yr = sumBy(md.byYear, (r) => r.deaths)
const causesTotal = sumBy(md.causesCount, (r) => r.deaths)
const peak = md.byYear.reduce((a, b) => (b.deaths > a.deaths ? b : a))

/** Causes, largest first; "Other" is kept last as the remainder. */
const causeBars = md.causesCount
  .map((r) => ({ cause: ukLabel(r.cause), deaths: r.deaths }))
  .sort((a, b) => {
    if (a.cause === 'Other') return 1
    if (b.cause === 'Other') return -1
    return b.deaths - a.deaths
  })
const causeHeight = Math.max(260, 44 * causeBars.length)
/** Shared by the trend and causes cards so the paired row lines up. */
const rowHeight = Math.max(300, causeHeight)

/** KPI card for one of the three reporting years; a missing year says so. */
const yearCard = (year: Year, icon: typeof HeartPulse, accent: 'navy' | 'azure' | 'teal') => {
  const deaths = mdDeaths(year)
  const cause = mdCause(year)
  return (
    <KpiCard
      key={year}
      label={`Deaths (${year})`}
      value={deaths == null ? '—' : int(deaths)}
      icon={icon}
      accent={accent}
      hint={
        deaths == null
          ? 'No data supplied — no count in any 2025 source'
          : cause ?? 'Cause: no data supplied'
      }
    />
  )
}

export default function MaternalDeaths() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={HeartPulse}
        title="Maternal Deaths — 10-Year Surveillance"
        subtitle={`Deaths by year (${firstYear}–${lastYear}; no data supplied for 2025), causes and recent records`}
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {yearCard('2023', Activity, 'azure')}
        {yearCard('2024', HeartPulse, 'navy')}
        {yearCard('2025', CalendarX, 'teal')}
        <KpiCard
          label="10-Year Total"
          value={int(total10yr)}
          icon={Sigma}
          accent="gold"
          hint={`${firstYear}–${lastYear} · peak ${peak.year} (${peak.deaths} deaths, COVID-19 era)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Maternal Deaths by Year"
          subtitle={`Count · ${firstYear}–2025 · no data supplied for 2025`}
          footnote="The 2020–2021 spike coincides with the COVID-19 pandemic; 2023 and 2024 recorded 1 death each. 2025 has no point because no data was supplied."
        >
          <TrendChart
            data={mdByYear}
            xKey="year"
            height={rowHeight}
            unit=""
            series={[{ key: 'deaths', name: 'Deaths', color: METRIC[0] }]}
            showLegend={false}
          />
        </ChartCard>
        <ChartCard
          title="Causes of Death"
          subtitle="Count · cumulative, period not stated in the source · no data supplied for 2025"
          footnote={`Brought-dead and postpartum haemorrhage together account for ~43% of the ${causesTotal} recorded deaths.`}
        >
          <ComparisonBars
            data={causeBars}
            xKey="cause"
            layout="vertical"
            height={rowHeight}
            categoryWidth={150}
            series={[{ key: 'deaths', name: 'Deaths', color: METRIC[0] }]}
            showLegend={false}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="Records"
          subtitle="Causes and recent cases"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Causes of Death" subtitle="Count by cause · period not stated">
            <DataTable
              columns={[
                { label: 'Cause' },
                { label: 'Deaths', align: 'right' },
              ]}
              rows={md.causesCount.map((r) => [ukLabel(r.cause), int(r.deaths)])}
              total={['TOTAL', int(causesTotal)]}
            />
          </ChartCard>
          <ChartCard title="Recent Death Records" subtitle="Most recent cases · no data supplied for 2025">
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

      <Note title="No data supplied:">
        {md.note2025} The causes table totals {int(causesTotal)} deaths while the
        by-year series sums to {int(total10yr)}; the source does not state the
        period the causes cover, so both are shown as reported.
      </Note>
    </div>
  )
}
