import ChartCard from '../ui/ChartCard'
import DataTable from '../ui/DataTable'
import { ComparisonBars } from '../charts/Charts'
import { extendedNewborn, institutions, newbornTotals, rejectionRate } from '../../data/extendedNewborn2026'
import { int, pct } from '../../lib/format'
import { C } from '../../lib/theme'

const chartStyle = '[&_h3]:text-heading dark:[&_h3]:text-glow'
const rateLabel = (value: number | null) => value === null ? 'Not available' : pct(value, 2)
/** App-wide spelling "Sohar"; the workbook's sourceName is unchanged. */
const displayName = (name: string) => name.replace(/^Suhar\b/, 'Sohar')
const chartData = institutions.map((row) => ({
  ...row,
  institution: displayName(row.name).replace(' Hospital', '').replace(' Polyclinic', ' PC'),
  rejectionRate: rejectionRate(row.received, row.rejected),
}))
const metrics = [
  { label: 'Reported deliveries', value: int(newbornTotals.deliveries), hint: 'Omani and non-Omani · five institutions' },
  { label: 'Reported screened newborns', value: int(newbornTotals.screened), hint: 'Omani and non-Omani · five institutions' },
  { label: 'Laboratory samples received', value: int(newbornTotals.received), hint: 'Sample activity, not unique newborns' },
  { label: 'Laboratory samples rejected', value: int(newbornTotals.rejected), hint: `${rateLabel(rejectionRate(newbornTotals.received, newbornTotals.rejected))} of samples received` },
]
const programmeSections = [
  {
    title: 'Programme Challenges',
    items: [
      'Discharge of newborns from Sohar Hospital before 24 hours of age.',
      'Continued rejection of dried blood spot (DBS) cards by the laboratory.',
      'Challenges in ensuring follow-up for newborns diagnosed with congenital hypothyroidism.',
      'Lack of regular monthly feedback to the governorate on positive screening results.',
    ],
  },
  {
    title: 'Achievements',
    items: [
      'A decree establishing the Extended Newborn Screening committees has been announced.',
      'A reduction in the rejection rate of DBS cards by the central laboratory has been reported.',
    ],
  },
  {
    title: 'Future Plan',
    items: [
      'Improve screening coverage to reach 100% of newborns.',
      'Increase community awareness of the Extended Newborn Screening programme.',
    ],
  },
]

export default function ExtendedNewbornScreening2026() {
  return (
    <section id="extended-newborn-2026" aria-labelledby="extended-newborn-title" className="space-y-6">
      <header>
        <h2 id="extended-newborn-title" className="text-xl font-medium leading-tight text-heading sm:text-[1.4rem]">
          Extended Newborn Screening 2026
        </h2>
        <p className="mt-2 text-caption text-ink/70">
          North Al Batinah Governorate · reporting period: 8 February–31 August 2026
        </p>
      </header>

      <section aria-label="Programme launch and activities">
        <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            { label: 'Programme started', value: '8 February 2026' },
            { label: 'Workshops conducted', value: '2' },
            { label: 'Meetings conducted', value: '5' },
          ].map(({ label, value }) => (
            <div key={label} className="card p-5">
              <dt className="text-caption font-medium text-ink/75">{label}</dt>
              <dd className="mt-3 text-2xl font-medium tabular-nums text-heading dark:text-glow">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-caption text-ink/60">Launch date and activity counts supplied by the programme team.</p>
      </section>

      <dl className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {metrics.map(({ label, value, hint }) => (
          <div key={label} className="card p-4 sm:p-5">
            <dt className="text-caption font-medium text-ink/75">
              <span className="mb-3 block h-1 w-7 bg-teal" aria-hidden="true" />{label}
            </dt>
            <dd className="mt-2 text-3xl font-medium tabular-nums text-heading dark:text-glow">{value}</dd>
            <dd className="mt-2 text-caption text-ink/65">{hint}</dd>
          </div>
        ))}
      </dl>

      <p className="rounded-xl border border-teal/60 bg-teal/10 p-4 text-body text-ink/80">
        These are reported institution totals, not a verified governorate coverage measure.
        Suwaiq reports 541 screened newborns against 537 deliveries; its Omani-only ratio is 101.50%.
        The discrepancy requires reconciliation. Laboratory samples are counted separately and must not be added to newborn counts.
      </p>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard className={chartStyle} title="Deliveries & screened newborns" subtitle="Reported counts · all nationalities · 8 February–31 August 2026" footnote="Five reporting institutions. PC = Polyclinic. Bar lengths show counts, not verified coverage.">
          <ComparisonBars data={chartData} xKey="institution" layout="vertical" categoryWidth={72} height={350}
            series={[{ key: 'deliveries', name: 'Deliveries', color: C.navy }, { key: 'screened', name: 'Screened', color: C.teal }]} />
        </ChartCard>
        <ChartCard className={chartStyle} title="Laboratory sample rejection rate" subtitle="Rejected ÷ received × 100 · same reporting period" footnote="Hibi: 1 rejected sample out of 9 received. Small sample counts can produce a high percentage; this is not a trend chart.">
          <ComparisonBars data={chartData} xKey="institution" layout="vertical" categoryWidth={72} height={350}
            valueFormatter={(value) => pct(value, 2)} showLegend={false}
            series={[{ key: 'rejectionRate', name: 'Rejection rate', color: C.navy }]} />
        </ChartCard>
      </div>

      <ChartCard className={chartStyle} title="Institution screening summary" subtitle="Reported deliveries and screening counts by nationality"
        footnote="The workbook’s ‘Coverage % of Omani’ is shown as a reported screening-to-delivery ratio. It is not capped at 100% or presented as verified coverage. No newborn-level linkage is supplied.">
        <DataTable dense columns={[
          { label: 'Institution' }, { label: 'Omani deliveries', align: 'right' },
          { label: 'Non-Omani deliveries', align: 'right' }, { label: 'Total deliveries', align: 'right' },
          { label: 'Omani screened', align: 'right' }, { label: 'Non-Omani screened', align: 'right' },
          { label: 'Total screened', align: 'right' }, { label: 'Omani screening ratio', align: 'right' },
        ]} rows={institutions.map((row) => [displayName(row.name), int(row.omaniDeliveries), int(row.nonOmaniDeliveries), int(row.deliveries), int(row.omaniScreened), int(row.nonOmaniScreened), int(row.screened), rateLabel(row.omaniScreeningRatio)])}
          total={['REPORTED TOTAL', int(newbornTotals.omaniDeliveries), int(newbornTotals.nonOmaniDeliveries), int(newbornTotals.deliveries), int(newbornTotals.omaniScreened), int(newbornTotals.nonOmaniScreened), int(newbornTotals.screened), 'Not verified']} />
      </ChartCard>

      <ChartCard className={chartStyle} title="Laboratory sample summary" subtitle="Samples received and rejected · not unique newborns"
        footnote="The total rejection rate uses summed rejected and received samples, not an average of institution percentages. Sample receipts and newborn screening totals are not directly interchangeable.">
        <DataTable dense columns={[{ label: 'Institution' }, { label: 'Received', align: 'right' }, { label: 'Rejected', align: 'right' }, { label: 'Rejection rate', align: 'right' }]}
          rows={institutions.map((row) => [displayName(row.name), int(row.received), int(row.rejected), rateLabel(rejectionRate(row.received, row.rejected))])}
          total={['REPORTED TOTAL', int(newbornTotals.received), int(newbornTotals.rejected), rateLabel(rejectionRate(newbornTotals.received, newbornTotals.rejected))]} />
      </ChartCard>

      <details className="card p-5">
        <summary className="cursor-pointer rounded text-body font-semibold text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-azure">
          Data source & interpretation
        </summary>
        <div className="mt-4 space-y-3 text-caption text-ink/80">
          <p className="break-words">Source: {extendedNewborn.source.filename} · {extendedNewborn.source.sheet}, {extendedNewborn.source.range}.</p>
          <p>All five institution rows are included. Delivery and screening totals reconcile with their nationality subtotals. Omani percentages were checked against the source counts; laboratory rejection rates are calculated from the supplied counts.</p>
          <p>This February–August summary replaces the earlier submitted-period figures on this page. The datasets are not added together. The workbook supplies no monthly breakdown, positive-result counts, congenital hypothyroidism case counts, or comparable earlier rejection rates.</p>
          <p>Suwaiq’s screened count exceeds deliveries. Hibi reports 17 screened newborns but 9 laboratory samples received. The workbook does not explain these differences; no transfers, repeats or missing cases have been assumed.</p>
        </div>
      </details>

      <section aria-label="Programme review and future plan" className="space-y-4">
        <p className="text-caption text-ink/65">Programme-team update. The reported reduction in DBS-card rejection cannot be verified from this single-period workbook.</p>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {programmeSections.map(({ title, items }) => (
            <section key={title} className="card p-5">
              <h3 className="text-title text-heading dark:text-glow">{title}</h3>
              <ul className="mt-4 space-y-3 text-body text-ink/80">
                {items.map((item) => <li key={item} className="flex items-start gap-2.5"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" /><span>{item}</span></li>)}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </section>
  )
}
