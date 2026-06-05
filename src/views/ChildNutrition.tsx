import { Activity, Apple, Baby, Milk, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { nutrition } from '../data/nutrition'
import { C } from '../lib/theme'
import { int, pct } from '../lib/format'

const crit = nutrition.malnutritionByCriteria
const topCrit = crit.reduce((a, b) => (b.total > a.total ? b : a))
const underweight = crit.find((c) => c.criteria === 'Under weight')?.total ?? 0
const ebBirth = nutrition.ebByMilestone[0]
const eb6 = nutrition.ebByMilestone.find((m) => m.milestone === '6 months')

export default function ChildNutrition() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Apple}
        title="Child Nutrition"
        subtitle="Malnutrition categories and infant-feeding patterns across North Batinah — 2025, by health centre"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
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
        <KpiCard
          label="Exclusive Breastfeeding @ Birth"
          value={pct(ebBirth?.pct ?? 0)}
          icon={Milk}
          accent="gold"
          hint={`Falls to ${pct(eb6?.pct ?? 0)} by 6 months`}
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
        <SectionTitle
          icon={Milk}
          title="Infant Feeding Pattern"
          subtitle="Breastfeeding, formula & complementary feeding by child age"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="Exclusive Breastfeeding Rate by Age"
            subtitle="% exclusively breastfed · birth → 18 months"
            footnote="The classic decline: 77.9% at birth, below 13% by 6 months as complementary foods begin."
          >
            <TrendChart
              data={nutrition.ebByMilestone}
              xKey="milestone"
              variant="area"
              yDomain={[0, 100]}
              unit="%"
              series={[{ key: 'pct', name: 'Exclusive breastfeeding', color: C.teal }]}
            />
          </ChartCard>
          <ChartCard
            title="Feeding Composition by Age"
            subtitle="Children by feeding type (count)"
            footnote="Mixed = breast + formula + complementary foods. Bottle use rises from ~21% at birth to ~38% by 18 months."
          >
            <ComparisonBars
              data={nutrition.feedingByMilestone}
              xKey="milestone"
              stacked
              series={[
                { key: 'eb', name: 'Exclusive BF', color: C.teal },
                { key: 'pb', name: 'Predominant BF', color: C.azure },
                { key: 'formula', name: 'Formula only', color: C.gold },
                { key: 'mixed', name: 'Mixed / complementary', color: C.navy },
              ]}
            />
          </ChartCard>
        </div>
      </div>

      <div>
        <SectionTitle icon={Table2} title="Detailed Tables" subtitle="Categories & feeding milestones" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
          <ChartCard title="Exclusive Breastfeeding by Age" subtitle="">
            <DataTable
              columns={[
                { label: 'Child Age' },
                { label: 'Exclusively BF', align: 'right' },
                { label: 'Total Infants', align: 'right' },
                { label: 'Rate', align: 'right' },
              ]}
              rows={nutrition.ebByMilestone.map((m) => [
                m.milestone,
                int(m.eb),
                int(m.total),
                pct(m.pct),
              ])}
              dense
            />
            <div className="mt-3">
              <Note title="2025:">
                Figures are summed across all health-centre returns in the six
                wilayat. EB = exclusively breastfed.
              </Note>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
