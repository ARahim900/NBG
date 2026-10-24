import { Activity, Apple, Baby, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import { ComparisonBars } from '../components/charts/Charts'
import { nutrition } from '../data/nutrition'
import { C } from '../lib/theme'
import { int } from '../lib/format'

const crit = nutrition.malnutritionByCriteria
const topCrit = crit.reduce((a, b) => (b.total > a.total ? b : a))
const underweight = crit.find((c) => c.criteria === 'Under weight')?.total ?? 0

export default function ChildNutrition() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Apple}
        title="Child Nutrition"
        subtitle="Malnutrition categories across North Batinah — 2025, by health centre"
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <KpiCard
          label="Malnutrition Cases (total)"
          value={int(nutrition.malnutritionTotal)}
          icon={Activity}
          accent="navy"
          hint="All categories, all centres"
        />
        <KpiCard
          label={`Largest Category`}
          value={topCrit.criteria}
          icon={Activity}
          accent="azure"
          hint={`${int(topCrit.total)} cases`}
        />
        <KpiCard
          label="Underweight Children"
          value={int(underweight)}
          icon={Baby}
          accent="teal"
          hint="Weight-for-age below normal"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Malnutrition by Category"
          subtitle="Total cases · 2025"
          footnote="Moderate wasting and underweight together account for most of the malnutrition burden."
        >
          <ComparisonBars
            data={crit}
            xKey="criteria"
            layout="vertical"
            height={300}
            series={[{ key: 'total', name: 'Cases', color: C.navy }]}
            showLegend={false}
          />
        </ChartCard>
        <ChartCard
          title="Malnutrition Cases by Wilayat"
          subtitle="All categories combined"
        >
          <ComparisonBars
            data={nutrition.malnutritionByWilayat}
            xKey="wilayat"
            series={[{ key: 'cases', name: 'Cases', color: C.azure }]}
            showLegend={false}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle icon={Table2} title="Detailed Tables" subtitle="Malnutrition categories" />
        <div className="space-y-4">
          <ChartCard title="Malnutrition by Category" subtitle="Cases, new & improved">
            <DataTable
              columns={[
                { label: 'Category' },
                { label: 'Total', align: 'right' },
                { label: 'New', align: 'right' },
                { label: 'Improved', align: 'right' },
              ]}
              rows={crit.map((c) => [c.criteria, int(c.total), int(c.newCases), int(c.improved)])}
              total={[
                'TOTAL',
                int(crit.reduce((a, b) => a + b.total, 0)),
                int(crit.reduce((a, b) => a + b.newCases, 0)),
                int(crit.reduce((a, b) => a + b.improved, 0)),
              ]}
              dense
            />
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
