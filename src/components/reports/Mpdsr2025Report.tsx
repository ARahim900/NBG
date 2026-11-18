import { ClipboardList, Table2 } from 'lucide-react'
import ChartCard from '../ui/ChartCard'
import KpiCard from '../ui/KpiCard'
import Note from '../ui/Note'
import { METRIC } from '../../lib/theme'
import DataTable from '../ui/DataTable'
import SectionTitle from '../ui/SectionTitle'
import { TrendChart } from '../charts/Charts'
import mpdsr from '../../data/mpdsr2025.json'
import { perinatalMonthly } from '../../data/years/women'

/** 2025 workbook tiles. */
const metrics = [
  { label: 'Records in the 2025 workbook', value: mpdsr.summary.records },
  { label: 'Foetal deaths — as recorded', value: mpdsr.summary.stillbirth },
  { label: 'Early neonatal — as recorded', value: mpdsr.summary.earlyNeonatal },
  { label: 'Late neonatal — as recorded', value: mpdsr.summary.lateNeonatal },
]

const monthly = perinatalMonthly('2025') ?? []
const sum = (key: 'stillbirth' | 'early' | 'late' | 'total'): number => monthly.reduce((acc, r) => acc + r[key], 0)

export default function Mpdsr2025Report() {
  return (
    <section aria-label="2025 MPDSR workbook analysis" className="space-y-8">
      <SectionTitle icon={ClipboardList} title="2025 Stillbirth & Neonatal Review" subtitle="Provisional workbook records · January–December reporting months" />
      <Note title="119 recorded cases; reconciliation required">
        <span className="mt-2 block">These are workbook entries, not a confirmed count of unique deaths occurring in 2025. One incomplete row is excluded. A possible duplicate pair, conflicting dates and inconsistent coding remain unresolved; no case has been silently corrected or deduplicated.</span>
        <span className="mt-2 block">The previous dashboard headline was 116. The new source contains 119 categorised records, but the difference does not establish three additional unique deaths. No mortality rate or year-on-year change is calculated from these unreconciled records.</span>
      </Note>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {metrics.map(({ label, value }) => (
          <KpiCard key={label} label={label} value={value} accent="navy" hint="Provisional workbook records" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <ChartCard
          title="Recorded Cases by Reporting Month (2025)"
          subtitle="Count · 2025 · provisional MPDSR workbook · month label in column A, not the death date"
        >
          <TrendChart
              data={monthly}
              xKey="month"
              height={300}
              unit=""
              series={[{ key: 'total', name: 'Recorded cases', color: METRIC[0] }]}
              showLegend={false}
            />
          <p className="mt-3 text-sm text-ink/75">Five records have different reporting and death months. One death date is invalid and another states 2024. All remain in their source reporting-month groups pending review.</p>
          <p className="mt-3 text-sm text-ink/75">“Foetal deaths” reflects the source label “Feotal”; no gestational-age or birth-weight threshold has been applied. Timing checks use the workbook’s 0–6 and 7–28 day categories.</p>
        </ChartCard>
        <ChartCard title="Monthly Records (2025)" subtitle="Count · 2025 · source categories from column G · counts, not rates">
          <DataTable
              columns={[{ label: 'Month' }, { label: 'Foetal deaths', align: 'right' }, { label: 'Early neonatal', align: 'right' }, { label: 'Late neonatal', align: 'right' }, { label: 'Total', align: 'right' }]}
              rows={monthly.map(r => [r.month, r.stillbirth, r.early, r.late, r.total])}
              total={['TOTAL', sum('stillbirth'), sum('early'), sum('late'), sum('total')]}
              dense
            />
        </ChartCard>
      </div>
      <div>
        <SectionTitle icon={Table2} title="ICD-PM Coding — 2025" subtitle="Final code in column Y and selected fields in columns P–X" />
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink/80">117 records have final codes defined in the workbook dictionary. One final code is missing and one contains undefined cause code A7. Code descriptions below come from Sheet2. Nine records differ between final and selected codes; 13 final cause codes conflict with the recorded death category. These are source entries, not clinically validated classifications.</p>
          {/* Wide tables: one per row so no column is squeezed. */}
          <div className="grid grid-cols-1 gap-4">
            {mpdsr.codeTables.map(table => (
              <ChartCard key={table.prefix} title={table.title} subtitle="Count · 2025 · Final = column Y · Selected = columns P–X">
                <DataTable
                  columns={[{ label: 'Code' }, { label: 'Definition' }, { label: '2025 final', align: 'right' }, { label: '2025 selected', align: 'right' }]}
                  rows={table.rows.map(r => [r.code, r.description, r.finalCount, r.selectedCount])}
                  total={['TOTAL', '', table.rows.reduce((acc, r) => acc + r.finalCount, 0), table.rows.reduce((acc, r) => acc + r.selectedCount, 0)]}
                  dense
                />
              </ChartCard>
            ))}
          </div>
          <p className="text-sm text-ink/75">Unmapped final cause: A7 — 1 record (row 95). Missing final code — 1 record (row 79). No replacement is inferred. Maternal and cause groups describe the same records and must not be added together.</p>
          <Note title="Year coverage:">2025 coding is compared with 2026 in the 2026 review above. The quality-of-care, modifiable-factor and demographic tables below come from the 2025 workbook.</Note>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Recorded Quality-of-Care Assessment" subtitle="Count · 2025 · 119 categorised records · column AZ">
          <DataTable columns={[{ label: 'Assessment' }, { label: 'Records', align: 'right' }]} rows={mpdsr.quality.map(r => [r.label, r.count])} total={['TOTAL', mpdsr.summary.records]} />
          <p className="mt-3 text-sm text-ink/75">These are assessments entered in the workbook, not an independent judgement of care. The file does not establish which cases have been discussed by the committee.</p>
        </ChartCard>
        <ChartCard title="Recorded Modifiable Factors" subtitle="Count · 2025 · explicit Yes entries only · a case can have multiple factors">
          <DataTable columns={[{ label: 'Group / factor' }, { label: 'Yes', align: 'right' }]} rows={mpdsr.factors.filter(r => r.yes > 0).map(r => [`${r.group}: ${r.label}`, r.yes])} dense />
          <p className="mt-3 text-sm text-ink/75">Free-text “Other” comments are not recoded into Yes/No factors. No preventability rate is inferred.</p>
        </ChartCard>
      </div>
      {/* Two per row; with an odd count the first table takes the full row so the delivery pair sits together. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {mpdsr.demographics.map((table, i) => (
          <ChartCard key={table.title} title={table.title} subtitle="Count · 2025 · workbook records" className={i === 0 && mpdsr.demographics.length % 2 === 1 ? 'xl:col-span-2' : ''}>
            <DataTable columns={[{ label: 'Category' }, { label: 'Records', align: 'right' }]} rows={table.rows.map(r => [r.label, r.count])} total={['TOTAL', mpdsr.summary.records]} dense />
          </ChartCard>
        ))}
      </div>
      <section aria-labelledby="mpdsr-source-checks" className="card p-5">
        <h3 id="mpdsr-source-checks" className="text-title text-heading">Source checks and reconciliation</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink">{mpdsr.summary.flaggedRecords} categorised records have at least one validation flag. Flags overlap and do not mean every record is incorrect. Row 44 is a separate incomplete entry, excluded from all totals. Rows 17 and 19 are possible duplicates and remain counted pending confirmation.</p>
        <details className="mt-4">
          <summary className="cursor-pointer py-2 font-medium text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">View validation findings and source references</summary>
          <DataTable columns={[{ label: 'Check' }, { label: 'Affected rows', align: 'right' }, { label: 'Sheet1 rows' }]} rows={mpdsr.issueSummary.map(issue => [issue.kind, issue.count, [...new Set(mpdsr.issues.filter(r => r.kind === issue.kind).map(r => r.row))].join(', ')])} dense />
          <p className="mt-4 text-sm text-ink/75">Date checks retain the source category. Foetal death before delivery is not automatically treated as an error. No unique patient identifier is present, so matching records cannot establish duplication. The workbook has a red-colour legend but no explicit review-status field; its formatting does not establish a reliable reviewed/unreviewed count.</p>
        </details>
        <p className="mt-4 break-words text-xs leading-relaxed text-ink/70">Source: {mpdsr.source.filename} · Sheet1 {mpdsr.source.caseRange}; coding dictionary: Sheet2 {mpdsr.source.codeRange}. Workbook read without modification. The app includes aggregate counts, coding summaries and row-level validation references, without direct patient identifiers.</p>
      </section>
    </section>
  )
}
