import { AlertTriangle, MapPin, ShieldAlert, Table2, TrendingUp } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { mt, sumBy } from '../data/nbg'
import { C } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const n2025 = mt.totalTrend.find((r) => r.year === '2025')?.value ?? 0
const n2024 = mt.totalTrend.find((r) => r.year === '2024')?.value ?? 0
const n2023 = mt.totalTrend.find((r) => r.year === '2023')?.value ?? 0
const topWilayat = mt.byWilayat.reduce((a, b) => (b.y2024 > a.y2024 ? b : a))
const topType2025 = mt.typePct.reduce((a, b) => (b.y2025 > a.y2025 ? b : a))

export default function ChildMaltreatment() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={ShieldAlert}
        title="Child Maltreatment Notifications"
        subtitle="Counts by wilayat (2023 vs 2024), 2019–2025 trend, distribution & maltreatment type"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Notifications (2025)"
          value={int(n2025)}
          icon={ShieldAlert}
          accent="navy"
          delta={deltaPct(n2025, n2024)}
          hint="vs 195 in 2024"
        />
        <KpiCard
          label="Notifications (2024)"
          value={int(n2024)}
          icon={TrendingUp}
          accent="azure"
          delta={deltaPct(n2024, n2023)}
          hint="vs 92 in 2023"
        />
        <KpiCard
          label="Highest Wilayat (2024)"
          value={topWilayat.wilayat}
          icon={MapPin}
          accent="teal"
          hint={`${int(topWilayat.y2024)} notifications`}
        />
        <KpiCard
          label="Top Type (2025)"
          value={topType2025.type}
          icon={AlertTriangle}
          accent="gold"
          hint={`${pct(topType2025.y2025)} of cases`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          title="Total Notifications Trend"
          subtitle="2019–2025"
          className="xl:col-span-3"
          footnote="The steep 2023→2024 rise (92→195) reflects strengthened reporting and case detection."
        >
          <TrendChart
            data={mt.totalTrend}
            xKey="year"
            variant="area"
            unit=""
            series={[{ key: 'value', name: 'Notifications', color: C.navy }]}
          />
        </ChartCard>
        <ChartCard
          title="Maltreatment Type"
          subtitle="% of cases · 2024 vs 2025"
          className="xl:col-span-2"
        >
          <ComparisonBars
            data={mt.typePct}
            xKey="type"
            layout="vertical"
            height={260}
            unit="%"
            series={[
              { key: 'y2024', name: '2024', color: C.azure },
              { key: 'y2025', name: '2025', color: C.navy },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Notifications by Wilayat"
        subtitle="Counts · 2023 vs 2024"
      >
        <ComparisonBars
          data={mt.byWilayat}
          xKey="wilayat"
          series={[
            { key: 'y2023', name: '2023', color: C.teal },
            { key: 'y2024', name: '2024', color: C.azure },
          ]}
        />
      </ChartCard>

      <div>
        <SectionTitle
          icon={Table2}
          title="Detailed Table"
          subtitle="By wilayat with year-on-year change"
        />
        <ChartCard title="Notifications by Wilayat (2023 vs 2024)" subtitle="">
          <DataTable
            columns={[
              { label: 'Wilayat' },
              { label: '2023', align: 'right' },
              { label: '2024', align: 'right' },
              { label: '% of 2024', align: 'right' },
              { label: '% Change', align: 'right' },
            ]}
            rows={mt.byWilayat.map((r) => [
              r.wilayat,
              int(r.y2023),
              int(r.y2024),
              pct(r.pct2024),
              `${r.change > 0 ? '+' : ''}${r.change.toFixed(0)}%`,
            ])}
            total={[
              'TOTAL',
              int(sumBy(mt.byWilayat, (r) => r.y2023)),
              int(sumBy(mt.byWilayat, (r) => r.y2024)),
              '100.0%',
              '',
            ]}
            dense
          />
          <div className="mt-3">
            <Note tone="warn" title="2025 distribution:">
              The source deck reports ~19.6% for five wilayat and 0% for Saham —
              a placeholder split rather than confirmed per-wilayat counts, so
              2025 wilayat shares should be treated with caution.
            </Note>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
