import { Droplets, Pill, ShieldCheck, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { anaemia, anaemiaFollowup } from '../data/nutrition'
import { C } from '../lib/theme'
import { int, pct } from '../lib/format'

const g = anaemia.gov
const ratio = (a: number, b: number): number => (b ? (a / b) * 100 : 0)
const fu = anaemiaFollowup.gov

const coverage = anaemia.byWilayat.map((w) => ({
  wilayat: w.wilayat,
  cov9: ratio(w.s9, w.t9),
  cov18: ratio(w.s18, w.t18),
}))
const prevalence = anaemia.byWilayat.map((w) => ({
  wilayat: w.wilayat,
  prev9: ratio(w.a9, w.s9),
  prev18: ratio(w.a18, w.s18),
}))
const counts = anaemia.byWilayat.map((w) => ({
  wilayat: w.wilayat,
  screened: w.s9,
  anaemic: w.a9,
}))

export default function ChildAnaemia() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Droplets}
        title="Child Anaemia Screening"
        subtitle="Haemoglobin screening at 9 & 18 months across North Batinah — 2025, by health centre"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="9-Month Screening Coverage"
          value={pct(ratio(g.s9, g.t9))}
          icon={ShieldCheck}
          accent="navy"
          hint={`${int(g.s9)} of ${int(g.t9)} target`}
        />
        <KpiCard
          label="9-Month Anaemia Prevalence"
          value={pct(ratio(g.a9, g.s9))}
          icon={Droplets}
          accent="gold"
          hint={`${int(g.a9)} children anaemic`}
        />
        <KpiCard
          label="18-Month Screening Coverage"
          value={pct(ratio(g.s18, g.t18))}
          icon={ShieldCheck}
          accent="azure"
          hint={`${int(g.s18)} of ${int(g.t18)} target`}
        />
        <KpiCard
          label="18-Month Anaemia Prevalence"
          value={pct(ratio(g.a18, g.s18))}
          icon={Droplets}
          accent="teal"
          hint={`${int(g.a18)} children anaemic`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Anaemia Prevalence by Wilayat"
          subtitle="% of screened children · 9 vs 18 months"
          footnote="Prevalence eases between 9 and 18 months as iron-rich complementary feeding is established."
        >
          <ComparisonBars
            data={prevalence}
            xKey="wilayat"
            unit="%"
            series={[
              { key: 'prev9', name: '9 months', color: C.gold },
              { key: 'prev18', name: '18 months', color: C.teal },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Screening Coverage by Wilayat"
          subtitle="% of target screened · 9 vs 18 months"
        >
          <ComparisonBars
            data={coverage}
            xKey="wilayat"
            unit="%"
            series={[
              { key: 'cov9', name: '9 months', color: C.navy },
              { key: 'cov18', name: '18 months', color: C.azure },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Screened vs Anaemic Children (9 months)"
        subtitle="Counts by wilayat"
      >
        <ComparisonBars
          data={counts}
          xKey="wilayat"
          series={[
            { key: 'screened', name: 'Screened', color: C.azure },
            { key: 'anaemic', name: 'Anaemic', color: C.alert },
          ]}
        />
      </ChartCard>

      <div>
        <SectionTitle
          icon={Table2}
          title="Detailed Table"
          subtitle="By wilayat · 9 & 18-month screening"
        />
        <ChartCard title="Anaemia Screening by Wilayat (2025)" subtitle="">
          <DataTable
            columns={[
              { label: 'Wilayat' },
              { label: '9m Target', align: 'right' },
              { label: '9m Screened', align: 'right' },
              { label: '9m Anaemic', align: 'right' },
              { label: '9m %', align: 'right' },
              { label: '18m Target', align: 'right' },
              { label: '18m Screened', align: 'right' },
              { label: '18m Anaemic', align: 'right' },
              { label: '18m %', align: 'right' },
            ]}
            rows={anaemia.byWilayat.map((w) => [
              w.wilayat,
              int(w.t9),
              int(w.s9),
              int(w.a9),
              pct(ratio(w.a9, w.s9)),
              int(w.t18),
              int(w.s18),
              int(w.a18),
              pct(ratio(w.a18, w.s18)),
            ])}
            total={[
              'GOVERNORATE',
              int(g.t9),
              int(g.s9),
              int(g.a9),
              pct(ratio(g.a9, g.s9)),
              int(g.t18),
              int(g.s18),
              int(g.a18),
              pct(ratio(g.a18, g.s18)),
            ]}
            dense
          />
          <div className="mt-3">
            <Note title="Validated:">
              Governorate totals reconcile exactly to the source workbook's own
              TOTAL row (9-month: 10,427 screened / 4,988 anaemic; 18-month:
              9,926 / 3,837). "%" = anaemic among those screened.
            </Note>
          </div>
        </ChartCard>
      </div>

      {/* ===== Treatment follow-up ===== */}
      <div>
        <SectionTitle
          icon={Pill}
          title="Anaemia Treatment Follow-up"
          subtitle="Iron treatment, 3-month continuation & improvement among anaemic children (9-month cohort)"
        />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiCard
            label="Anaemic Cases Followed"
            value={int(fu.cases)}
            icon={Pill}
            accent="navy"
            hint="On the follow-up register"
          />
          <KpiCard
            label="Received Iron"
            value={pct(ratio(fu.iron, fu.cases))}
            icon={Pill}
            accent="azure"
            hint={`${int(fu.iron)} children treated`}
          />
          <KpiCard
            label="Continued Iron 3 Months"
            value={pct(ratio(fu.cont3, fu.iron))}
            icon={Pill}
            accent="teal"
            hint={`${int(fu.cont3)} of those treated`}
          />
          <KpiCard
            label="Improved"
            value={pct(ratio(fu.improved, fu.cases))}
            icon={Pill}
            accent="good"
            hint={`${int(fu.improved)} children`}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="Treatment Cascade by Wilayat"
            subtitle="Cases → on iron → improved"
          >
            <ComparisonBars
              data={anaemiaFollowup.byWilayat}
              xKey="wilayat"
              series={[
                { key: 'cases', name: 'Cases', color: C.navy },
                { key: 'iron', name: 'On iron', color: C.azure },
                { key: 'improved', name: 'Improved', color: C.good },
              ]}
            />
          </ChartCard>
          <ChartCard title="Monthly Cases vs Improved" subtitle="Across 2025">
            <TrendChart
              data={anaemiaFollowup.monthly}
              xKey="month"
              series={[
                { key: 'cases', name: 'New cases', color: C.gold },
                { key: 'improved', name: 'Improved', color: C.good },
              ]}
            />
          </ChartCard>
        </div>

        <div className="mt-4">
          <ChartCard title="Treatment Follow-up by Wilayat (2025)" subtitle="">
            <DataTable
              columns={[
                { label: 'Wilayat' },
                { label: 'Cases', align: 'right' },
                { label: 'On Iron', align: 'right' },
                { label: 'Iron %', align: 'right' },
                { label: 'Continued 3mo', align: 'right' },
                { label: 'Improved', align: 'right' },
                { label: 'Improved %', align: 'right' },
              ]}
              rows={anaemiaFollowup.byWilayat.map((w) => [
                w.wilayat,
                int(w.cases),
                int(w.iron),
                pct(ratio(w.iron, w.cases)),
                int(w.cont3),
                int(w.improved),
                pct(ratio(w.improved, w.cases)),
              ])}
              total={[
                'GOVERNORATE',
                int(fu.cases),
                int(fu.iron),
                pct(ratio(fu.iron, fu.cases)),
                int(fu.cont3),
                int(fu.improved),
                pct(ratio(fu.improved, fu.cases)),
              ]}
              dense
            />
            <div className="mt-3">
              <Note title="Source:">
                Anaemia follow-up register (9-month cohort). Governorate totals
                reconcile to the workbook's TOTAL (3,867 cases). "Improved %" is
                among all followed cases.
              </Note>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
