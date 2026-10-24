import { Activity, Baby, CalendarRange, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Mpdsr2025Report from '../components/reports/Mpdsr2025Report'
import { ComparisonBars } from '../components/charts/Charts'
import { sn, sumBy } from '../data/nbg'
import { C } from '../lib/theme'
import { int } from '../lib/format'

const yt = (cat: string): number =>
  sn.yearTotals.find((r) => r.category === cat)?.cohortB ?? 0

const cohortBars = sn.yearTotals.filter((r) => r.category !== 'TOTAL')

const dStill = sumBy(sn.deckMonthly, (r) => r.stillbirth)
const dEnd = sumBy(sn.deckMonthly, (r) => r.end)
const dLnd = sumBy(sn.deckMonthly, (r) => r.lnd)
const dTotal = sumBy(sn.deckMonthly, (r) => r.total)

const icdTables = [
  { title: 'Maternal Condition (M)', rows: sn.icdMaternal.filter((r) => r.code !== 'Total') },
  { title: 'Antepartum — Foetal (A)', rows: sn.icdAntepartum.filter((r) => r.count > 0) },
  { title: 'Intrapartum — Foetal (I)', rows: sn.icdIntrapartum.filter((r) => r.count > 0) },
  { title: 'Neonatal Death (N)', rows: sn.icdNeonatal.filter((r) => r.count > 0) },
]

export default function StillbirthNeonatal() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Baby}
        title="Stillbirth & Neonatal"
        subtitle="2025 MPDSR workbook analysis and original 2024 surveillance reference"
      />

      <section aria-label="Stillbirth and neonatal programme activity">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            { label: 'Workshops conducted', value: 1 },
            { label: 'Master trainers in North Al Batinah Governorate', value: 3 },
            { label: 'Committee meetings held', value: 21 },
          ].map(({ label, value }) => (
            <KpiCard key={label} label={label} value={value} accent="navy" />
          ))}
        </div>
      </section>

      <Mpdsr2025Report />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <KpiCard
          label="Total Perinatal (2024)"
          value={int(yt('TOTAL'))}
          icon={Activity}
          accent="azure"
          hint="Final surveillance cohort"
        />
        <KpiCard
          label="Early Neonatal Deaths (2024)"
          value={int(yt('Early Neonatal Death'))}
          icon={Baby}
          accent="gold"
          hint="Within first 7 days"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          title="2024 Perinatal Deaths by Month"
          subtitle="Stillbirth, early & late neonatal (KPI-deck final surveillance)"
          className="xl:col-span-3"
        >
          <ComparisonBars
            data={sn.deckMonthly}
            xKey="month"
            stacked
            series={[
              { key: 'stillbirth', name: 'Stillbirth', color: C.navy },
              { key: 'end', name: 'Early neonatal', color: C.azure },
              { key: 'lnd', name: 'Late neonatal', color: C.teal },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Annual Cohort Comparison"
          subtitle="Two surveillance cohorts (113 vs 117)"
          className="xl:col-span-2"
        >
          <ComparisonBars
            data={cohortBars}
            xKey="category"
            layout="vertical"
            height={250}
            series={[
              { key: 'cohortA', name: 'Cohort A', color: C.teal },
              { key: 'cohortB', name: 'Cohort B', color: C.azure },
            ]}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="2024 ICD-PM Classification"
          subtitle="Perinatal-death cause coding"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {icdTables.map((t) => (
            <ChartCard key={t.title} title={t.title} subtitle="Code · count · description">
              <DataTable
                columns={[
                  { label: 'Code' },
                  { label: 'Count', align: 'right' },
                  { label: 'Description' },
                ]}
                rows={t.rows.map((r) => [
                  r.code,
                  int(r.count),
                  <span key={r.code} className="text-xs text-ink/65">
                    {r.description || '—'}
                  </span>,
                ])}
                dense
              />
            </ChartCard>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle
          icon={CalendarRange}
          title="Monthly Detail (2024)"
          subtitle="KPI-deck final surveillance figures"
        />
        <ChartCard title="Perinatal Deaths by Month (2024)" subtitle="">
          <DataTable
            columns={[
              { label: 'Month' },
              { label: 'Stillbirth', align: 'right' },
              { label: 'Early Neonatal', align: 'right' },
              { label: 'Late Neonatal', align: 'right' },
              { label: 'Total', align: 'right' },
            ]}
            rows={sn.deckMonthly.map((r) => [
              r.month,
              int(r.stillbirth),
              int(r.end),
              int(r.lnd),
              int(r.total),
            ])}
            total={['TOTAL', int(dStill), int(dEnd), int(dLnd), int(dTotal)]}
            dense
          />
          <div className="mt-3">
            <Note title="Source note:">
              The web app and KPI deck give slightly different 2024 monthly
              figures (web total 109; deck total 113). These original 2024 figures
              are retained. The 2025 analysis above uses the newly supplied MPDSR workbook.
            </Note>
          </div>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section aria-labelledby="sn-programme-challenges" className="card p-6">
          <h2 id="sn-programme-challenges" className="text-title text-heading">Programme Challenges</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-teal">
            <li>Delays in the submission of stillbirth and neonatal death notification forms by institutions.</li>
            <li>Incomplete information in some death notification forms.</li>
            <li>Many cases cannot be reviewed within the month in which the death occurred.</li>
          </ul>
        </section>
        <section aria-labelledby="sn-achievements" className="card p-6">
          <h2 id="sn-achievements" className="text-title text-heading">Achievements</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-teal">
            <li>A catch-up plan has been put in place.</li>
            <li>Doctors have been provided with a standardised template to ensure consistency in case presentations.</li>
          </ul>
        </section>
        <section aria-labelledby="sn-future-plan" className="card p-6">
          <h2 id="sn-future-plan" className="text-title text-heading">Future Plan</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink marker:text-teal">
            <li>Hold monthly case review meetings with the committee to prevent delays in reviewing stillbirths and neonatal deaths.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
