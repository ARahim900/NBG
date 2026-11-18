import { ClipboardCheck, GitCompare, ListChecks } from 'lucide-react'
import ChartCard from '../ui/ChartCard'
import DataTable from '../ui/DataTable'
import Note from '../ui/Note'
import SectionTitle from '../ui/SectionTitle'
import mpdsr25 from '../../data/mpdsr2025.json'
import mpdsr26 from '../../data/mpdsr2026.json'
import { sn } from '../../data/nbg'
import { int } from '../../lib/format'

type Category = 'stillbirth' | 'earlyNeonatal' | 'lateNeonatal'

const CATEGORY_LABEL: Record<Category, string> = {
  stillbirth: 'Stillbirth',
  earlyNeonatal: 'Early neonatal',
  lateNeonatal: 'Late neonatal',
}
const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[]

/** Reporting months covered by the 2026 workbook (January to the last month reported). */
const periodMonths = mpdsr26.monthly.findIndex((r) => r.month === mpdsr26.summary.lastMonth) + 1
const period = `Jan–${mpdsr26.summary.lastMonth}`

const sumMonths = <T,>(rows: T[], pick: (r: T) => number): number =>
  rows.slice(0, periodMonths).reduce((acc, r) => acc + pick(r), 0)

const deck2024Key: Record<Category, 'stillbirth' | 'end' | 'lnd'> = {
  stillbirth: 'stillbirth',
  earlyNeonatal: 'end',
  lateNeonatal: 'lnd',
}
const cohortA = (label: string): number =>
  sn.yearTotals.find((r) => r.category === label)?.cohortA ?? 0
const full2024: Record<Category, number> = {
  stillbirth: cohortA('Stillbirth'),
  earlyNeonatal: cohortA('Early Neonatal Death'),
  lateNeonatal: cohortA('Late Neonatal Death'),
}

const categoryRows = CATEGORIES.map((c) => ({
  label: CATEGORY_LABEL[c],
  full2024: full2024[c],
  full2025: mpdsr25.summary[c],
  period2024: sumMonths(sn.deckMonthly, (r) => r[deck2024Key[c]]),
  period2025: sumMonths(mpdsr25.monthly, (r) => r[c]),
  period2026: mpdsr26.summary[c],
}))
const columnTotal = (key: keyof Omit<(typeof categoryRows)[number], 'label'>): number =>
  categoryRows.reduce((acc, r) => acc + r[key], 0)

/** Final-code count for one ICD-PM code in a workbook summary. */
const finalCount = (data: typeof mpdsr25 | typeof mpdsr26, code: string): number =>
  data.codeTables.flatMap((t) => t.rows).find((r) => r.code === code)?.finalCount ?? 0
const icd2024 = (code: string): number => sn.icdMaternal.find((r) => r.code === code)?.count ?? 0
const pct = (part: number, whole: number): string => `${Math.round((part / whole) * 100)}%`

const coded = mpdsr26.summary.coded
const quality = (data: typeof mpdsr25 | typeof mpdsr26, start: string): number =>
  data.quality.filter((q) => q.label.startsWith(start)).reduce((acc, q) => acc + q.count, 0)
const qualityRows = [
  { label: 'Overall, there was good care', start: 'Overall' },
  { label: 'Improvement identified — would have made no difference', start: 'Improvement in quality of care were identified, if these had been in place it would' },
  { label: 'Improvement identified — may have made a difference', start: 'Improvement in quality of care were identified, if these had been in place it may' },
]
const factorsYes = (data: typeof mpdsr25 | typeof mpdsr26): number =>
  data.factors.reduce((acc, f) => acc + f.yes, 0)

const highlighted = mpdsr26.pending.filter((p) => p.highlighted)
const emptyFieldCount = (field: string): number =>
  mpdsr26.pending.filter((p) => p.emptyFields.includes(field)).length
const labourTimeEmpty = emptyFieldCount('Time spent in labour in the hospital')
const late = categoryRows.find((r) => r.label === 'Late neonatal')
const congenital26 = finalCount(mpdsr26, 'N1') + finalCount(mpdsr26, 'A1')

const recommendations = [
  `Prioritise late neonatal deaths at the next committee meeting: ${int(late?.period2026 ?? 0)} in ${period} 2026, against ${int(late?.period2025 ?? 0)} in ${period} 2025 and ${int(late?.full2024 ?? 0)} in the whole of 2024. Review care after day 7, discharge and follow-up for these cases.`,
  `Clear the coding backlog: ${int(highlighted.length)} highlighted cases (${highlighted[0]?.month}–${highlighted[highlighted.length - 1]?.month} 2026) have no final ICD-PM code or quality-of-care assessment. Code them at the next meeting and keep the monthly review cycle.`,
  `Maternal medical and surgical conditions (M4) remain the largest maternal group: ${int(finalCount(mpdsr26, 'M4'))} of ${int(coded)} coded 2026 cases (${pct(finalCount(mpdsr26, 'M4'), coded)}), ${int(finalCount(mpdsr25, 'M4'))} of ${int(mpdsr25.summary.records)} in 2025 and ${int(icd2024('M4'))} of ${int(columnTotal('full2024'))} in 2024. Strengthen antenatal identification and management of these conditions.`,
  `Congenital malformations (N1 and A1) account for ${int(congenital26)} of ${int(coded)} coded 2026 cases (${pct(congenital26, coded)}), and ${int(finalCount(mpdsr26, 'A6'))} stillbirths are coded as foetal death of unspecified cause (A6). Reinforce anomaly scanning and counselling, and complete placental and post-mortem investigation to reduce unspecified causes.`,
  `Improve form completeness: "Time spent in labour" is blank in ${int(labourTimeEmpty)} of ${int(mpdsr26.summary.records)} records, and only ${int(factorsYes(mpdsr26))} modifiable-factor entries are recorded across ${int(coded)} coded cases (${int(factorsYes(mpdsr25))} across ${int(mpdsr25.summary.records)} in 2025). Ask institutions to complete every field and the committee to apply the factor checklist to every case.`,
]

export default function Mpdsr2026Analysis() {
  return (
    <section aria-label="2026 MPDSR comparative analysis" className="space-y-8">
      <SectionTitle
        icon={GitCompare}
        title="2026 Review — Comparison with 2024 and 2025"
        subtitle={`Provisional 2026 MPDSR workbook · ${period} reporting months · ${int(mpdsr26.summary.records)} records`}
      />
      <Note title={`${int(mpdsr26.summary.records)} recorded cases in ${period} 2026:`}>
        {int(coded)} have a final ICD-PM code; {int(highlighted.length)} highlighted cases are not yet
        coded. Highlighted cases and empty fields are listed as pending items below. 2026 counts are by
        reporting month and cover {periodMonths} months, so they are compared with the same months of
        2024 and 2025 as well as the full years.
      </Note>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Deaths by Category — Full Year and Same Period"
          subtitle={`Count · 2024 and 2025 full year · ${period} for 2024, 2025 and 2026`}
          footnote="2024: KPI-deck surveillance. 2025 and 2026: provisional MPDSR workbook records by reporting month. Different sources and methods, so counts are shown side by side."
        >
          <DataTable
            columns={[
              { label: 'Category' },
              { label: '2024', align: 'right' },
              { label: '2025', align: 'right' },
              { label: `2024 ${period}`, align: 'right' },
              { label: `2025 ${period}`, align: 'right' },
              { label: `2026 ${period}`, align: 'right' },
            ]}
            rows={categoryRows.map((r) => [r.label, int(r.full2024), int(r.full2025), int(r.period2024), int(r.period2025), int(r.period2026)])}
            total={['TOTAL', int(columnTotal('full2024')), int(columnTotal('full2025')), int(columnTotal('period2024')), int(columnTotal('period2025')), int(columnTotal('period2026'))]}
            dense
          />
        </ChartCard>
        <ChartCard
          title="Quality of Care and Modifiable Factors"
          subtitle={`Count · 2025 all records · 2026 coded records (${int(coded)})`}
          footnote="These fields exist only in the 2025 and 2026 workbooks; none were supplied for 2024. Factors count explicit Yes entries; a case can have several."
        >
          <DataTable
            columns={[{ label: 'Assessment' }, { label: '2025', align: 'right' }, { label: '2026', align: 'right' }]}
            rows={[
              ...qualityRows.map((q) => [q.label, int(quality(mpdsr25, q.start)), int(quality(mpdsr26, q.start))]),
              ['Modifiable-factor entries (Yes)', int(factorsYes(mpdsr25)), int(factorsYes(mpdsr26))],
            ]}
            dense
          />
        </ChartCard>
      </div>

      <section aria-labelledby="sn-recommendations" className="card p-5">
        <h3 id="sn-recommendations" className="flex items-center gap-2 text-title text-heading">
          <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
          Recommendations
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink">
          {recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </section>

      <div>
        <SectionTitle
          icon={ListChecks}
          title="Pending Items — Next Committee Meeting"
          subtitle={`${int(mpdsr26.pending.length)} records · ${int(highlighted.length)} highlighted (not yet coded) · ${int(mpdsr26.pending.length - highlighted.length)} with empty fields`}
        />
        <ChartCard
          title="Cases to Review and Code"
          subtitle="2026 workbook · Sheet1 row reference · no patient identifiers"
          footnote="Every highlighted case and every record with an empty field in the case details, final ICD-PM code or quality-of-care column. Pending records stay in the case totals; cause, quality and factor counts use coded records only."
        >
          <DataTable
            columns={[{ label: 'Row' }, { label: 'Month' }, { label: 'Category' }, { label: 'Status' }, { label: 'Empty fields' }]}
            rows={mpdsr26.pending.map((p) => [
              p.row,
              p.month,
              CATEGORY_LABEL[p.category as Category],
              p.highlighted ? 'Highlighted — not yet coded' : 'Coded — field missing',
              <span key={p.row} className="text-xs text-ink/70">
                {p.emptyFields.join(', ') || '—'}
              </span>,
            ])}
            dense
          />
        </ChartCard>
      </div>
    </section>
  )
}
