import { MapPin, Microscope, PieChart, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, DonutChart, TrendChart } from '../components/charts/Charts'
import { ca, sumBy } from '../data/nbg'
import { C } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const n2025 = ca.totalTrend.find((r) => r.year === '2025')?.value ?? 0
const n2024 = ca.totalTrend.find((r) => r.year === '2024')?.value ?? 0
const n2023 = ca.totalTrend.find((r) => r.year === '2023')?.value ?? 0
const publicShare2025 = ca.sectorPct.find((r) => r.year === '2025')?.moh ?? 0
const topWilayat = ca.byWilayat.reduce((a, b) => (b.y2024 > a.y2024 ? b : a))

const sector2024 = ca.bySector.find((r) => r.sector === 'Public')
const sectorDonut = [
  { name: 'Public (MOH)', value: sector2024?.y2024 ?? 0, color: C.navy },
  {
    name: 'Private',
    value: ca.bySector.find((r) => r.sector === 'Private')?.y2024 ?? 0,
    color: C.teal,
  },
]

export default function CongenitalAnomalies() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Microscope}
        title="Congenital Anomalies & Genetic Disorders"
        subtitle="Notifications by wilayat / facility / sector (2023–2024), 2019–2025 trend & 2023–2025 sector split"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Notifications (2025)"
          value={int(n2025)}
          icon={Microscope}
          accent="navy"
          delta={deltaPct(n2025, n2024)}
          hint="vs 93 in 2024"
        />
        <KpiCard
          label="Notifications (2024)"
          value={int(n2024)}
          icon={Microscope}
          accent="azure"
          delta={deltaPct(n2024, n2023)}
          hint="vs 82 in 2023"
        />
        <KpiCard
          label="Public-Sector Share (2025)"
          value={pct(publicShare2025)}
          icon={PieChart}
          accent="teal"
          hint="Up from 71% in 2024"
        />
        <KpiCard
          label="Most Reported Wilayat"
          value={topWilayat.wilayat}
          icon={MapPin}
          accent="gold"
          hint={`${int(topWilayat.y2024)} of ${int(n2024)} (2024)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Total Notifications Trend"
          subtitle="MOH · 2019–2025"
          footnote="MOH notifications reached 175 in 2025 — the highest in the seven-year series."
        >
          <TrendChart
            data={ca.totalTrend}
            xKey="year"
            variant="area"
            unit=""
            height={280}
            series={[{ key: 'value', name: 'Notifications', color: C.azure }]}
          />
        </ChartCard>
        <ChartCard
          title="Sector Split: MOH vs Private"
          subtitle="% of notifications · 2023–2025"
          footnote="2025: MOH share rose to 96% (Private 4%) of registered cases."
        >
          <ComparisonBars
            data={ca.sectorPct}
            xKey="year"
            stacked
            unit="%"
            height={280}
            series={[
              { key: 'moh', name: 'MOH', color: C.navy },
              { key: 'private', name: 'Private', color: C.teal },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Notifications by Reporting Facility"
          subtitle="2023 vs 2024"
        >
          <ComparisonBars
            data={ca.byFacility}
            xKey="facility"
            layout="vertical"
            height={320}
            series={[
              { key: 'y2023', name: '2023', color: C.teal },
              { key: 'y2024', name: '2024', color: C.azure },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="By Sector (2024)"
          subtitle="Public vs private count"
        >
          <DonutChart data={sectorDonut} height={320} />
        </ChartCard>
      </div>

      <div>
        <SectionTitle icon={Table2} title="Detailed Tables" subtitle="By wilayat & facility" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Notifications by Wilayat" subtitle="2023 vs 2024">
            <DataTable
              columns={[
                { label: 'Wilayat' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '% Change', align: 'right' },
              ]}
              rows={ca.byWilayat.map((r) => [
                r.wilayat,
                int(r.y2023),
                int(r.y2024),
                `${r.change > 0 ? '+' : ''}${r.change.toFixed(0)}%`,
              ])}
              total={[
                'TOTAL',
                int(sumBy(ca.byWilayat, (r) => r.y2023)),
                int(sumBy(ca.byWilayat, (r) => r.y2024)),
                '',
              ]}
              dense
            />
          </ChartCard>
          <ChartCard title="By Reporting Facility" subtitle="2023 vs 2024">
            <DataTable
              columns={[
                { label: 'Facility' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
              ]}
              rows={ca.byFacility.map((r) => [
                r.facility,
                int(r.y2023),
                int(r.y2024),
              ])}
              total={[
                'TOTAL',
                int(sumBy(ca.byFacility, (r) => r.y2023)),
                int(sumBy(ca.byFacility, (r) => r.y2024)),
              ]}
              dense
            />
            <div className="mt-3">
              <Note title="2025:">{ca.note2025}</Note>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
