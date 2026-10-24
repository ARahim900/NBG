import { Milk } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { nutrition } from '../data/nutrition'
import { C } from '../lib/theme'
import { int, pct } from '../lib/format'

const ebBirth = nutrition.ebByMilestone[0]
const eb6 = nutrition.ebByMilestone.find((m) => m.milestone === '6 months')

export default function BreastFeedingBfhi() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Milk}
        title="Breast Feeding & BFHI"
        subtitle="Programme capacity and training · infant-feeding indicators for 2025"
      />

      <section aria-label="Breastfeeding programme capacity and training">
        <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            { label: 'Breastfeeding specialists', value: 7, detail: '3 at governorate level · 4 at Suhar Hospital' },
            { label: 'Nurse-led courses conducted', value: 6, detail: '3 by Suhar Hospital · 3 by Saham Hospital' },
            { label: 'WHO national assessors', value: 3, detail: null },
          ].map(({ label, value, detail }) => (
            <div key={label} className="card p-5">
              <dt className="text-caption font-medium text-ink/75">{label}</dt>
              <dd className="mt-3 text-3xl font-medium tabular-nums text-[#4E4456] dark:text-[#A4C5BB]">{value}</dd>
              {detail && <dd className="mt-2 text-caption text-ink/65">{detail}</dd>}
            </div>
          ))}
        </dl>
      </section>

      <div className="max-w-sm">
        <KpiCard
          label="Exclusive Breastfeeding @ Birth"
          value={pct(ebBirth?.pct ?? 0)}
          icon={Milk}
          accent="gold"
          hint={`2025 · ${pct(eb6?.pct ?? 0)} at 6 months`}
        />
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
  )
}
