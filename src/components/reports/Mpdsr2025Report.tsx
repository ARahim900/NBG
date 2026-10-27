import { CalendarRange, ClipboardList, Table2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import ChartCard from '../ui/ChartCard'
import KpiCard from '../ui/KpiCard'
import Note from '../ui/Note'
import Segmented from '../ui/Segmented'
import { C } from '../../lib/theme'
import DataTable from '../ui/DataTable'
import SectionTitle from '../ui/SectionTitle'
import { ComparisonBars } from '../charts/Charts'
import mpdsr from '../../data/mpdsr2025.json'
import {
  YEAR_OPTIONS,
  icd2024Against,
  icd2024Total,
  perinatal2024Totals,
  perinatalMonthly,
  type Year,
} from '../../data/years/women'
import { int } from '../../lib/format'

/** 2025 workbook tiles; the hint gives the 2024 final figure as context only (no change is calculated). */
const metrics = [
  { label: 'Records in the 2025 workbook', value: mpdsr.summary.records, prior: perinatal2024Totals.total },
  { label: 'Foetal deaths — as recorded', value: mpdsr.summary.stillbirth, prior: perinatal2024Totals.stillbirth },
  { label: 'Early neonatal — as recorded', value: mpdsr.summary.earlyNeonatal, prior: perinatal2024Totals.early },
  { label: 'Late neonatal — as recorded', value: mpdsr.summary.lateNeonatal, prior: perinatal2024Totals.late },
]

/** What each year's monthly series is, so the switch never mixes sources silently. */
const MONTHLY_SOURCE: Record<Year, string> = {
  '2023': 'Not reported in the dashboard sources',
  '2024': 'KPI-deck final surveillance series',
  '2025': 'Provisional MPDSR workbook · month label in column A, not the death date',
}

/** Blank cells read as "not reported", never as zero. */
const dash = <span className="text-ink/35">—</span>

/**
 * 2024 ICD-PM cell against a 2025 code definition. A 2024 count is shown only
 * when the two dictionaries define the code the same way; a conflicting code is
 * withheld ("— *") with the 2024 definition in the tooltip, and a code the 2024
 * table leaves undefined is marked "‡".
 */
const icd2024Cell = (prefix: string, code: string, description: string): ReactNode => {
  const m = icd2024Against(prefix, code, description)
  if (m.kind === 'absent') return dash
  if (m.kind === 'conflict')
    return (
      <span className="text-ink/50" title={`2024 table defines ${code} as “${m.description2024}” (${m.count}); not comparable with the 2025 definition`}>
        — *
      </span>
    )
  if (m.kind === 'unstated')
    return <span title={`2024 table gives no definition for ${code}; matched by code only`}>{m.count} ‡</span>
  return m.count
}

/** 2024 table's own total (†: includes withheld rows, so it can exceed the visible column). */
const icd2024TotalCell = (prefix: string): ReactNode => {
  const t = icd2024Total(prefix)
  return t == null ? dash : `${t} †`
}

export default function Mpdsr2025Report() {
  const [year, setYear] = useState<Year>('2025')
  const monthly = perinatalMonthly(year)
  const sum = (key: 'stillbirth' | 'early' | 'late' | 'total'): number =>
    (monthly ?? []).reduce((acc, r) => acc + r[key], 0)
  return (
    <section aria-label="2025 MPDSR workbook analysis" className="space-y-6">
      <SectionTitle icon={ClipboardList} title="2025 Stillbirth & Neonatal Review" subtitle="Provisional workbook records · January–December reporting months" />
      <Note title="119 recorded cases; reconciliation required">
        <span className="mt-2 block">These are workbook entries, not a confirmed count of unique deaths occurring in 2025. One incomplete row is excluded. A possible duplicate pair, conflicting dates and inconsistent coding remain unresolved; no case has been silently corrected or deduplicated.</span>
        <span className="mt-2 block">The previous dashboard headline was 116. The new source contains 119 categorised records, but the difference does not establish three additional unique deaths. No mortality rate or year-on-year change is calculated from these unreconciled records.</span>
      </Note>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {metrics.map(({ label, value, prior }) => (
          <KpiCard key={label} label={label} value={value} accent="navy" hint={`Provisional workbook records · 2024 final: ${int(prior)} · 2023 not reported`} />
        ))}
      </div>
      <p className="text-sm text-ink/75">The 2024 tile figures are the KPI-deck final surveillance totals, given for context only; they are a different source and method, so no change is calculated. The page’s “Perinatal Deaths by Month” chart holds the same 2024 series.</p>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title={year === '2025' ? 'Recorded Cases by Reporting Month (2025)' : `Perinatal Deaths by Month (${year})`}
          subtitle={MONTHLY_SOURCE[year]}
          action={<Segmented label="Monthly series year" options={YEAR_OPTIONS} value={year} onChange={setYear} />}
        >
          {monthly ? (
            <ComparisonBars data={monthly} xKey="month" series={[{ key: 'total', name: year === '2025' ? 'Recorded cases' : 'Perinatal deaths', color: C.navy }]} />
          ) : (
            <Note title="2023 not reported.">No 2023 monthly stillbirth or neonatal series is held in the dashboard sources. 2024 and 2025 are available from the switch.</Note>
          )}
          {year === '2025' && (
            <>
              <p className="mt-3 text-sm text-ink/75">Five records have different reporting and death months. One death date is invalid and another states 2024. All remain in their source reporting-month groups pending review.</p>
              <p className="mt-3 text-sm text-ink/75">“Foetal deaths” reflects the source label “Feotal”; no gestational-age or birth-weight threshold has been applied. Timing checks use the workbook’s 0–6 and 7–28 day categories.</p>
            </>
          )}
          {year === '2024' && (
            <p className="mt-3 text-sm text-ink/75">Final 2024 surveillance figures, shown one year at a time. They are not compared with the provisional 2025 workbook and no change is calculated. The two annual cohort totals in the 2024 reference below are not reconciled with each other.</p>
          )}
        </ChartCard>
        <ChartCard title={year === '2025' ? 'Monthly Records (2025)' : `Monthly Perinatal Deaths (${year})`} subtitle={year === '2025' ? 'Source categories from column G · counts, not rates' : `${MONTHLY_SOURCE[year]} · counts, not rates`}>
          {monthly ? (
            <DataTable
              columns={[{ label: 'Month' }, { label: year === '2025' ? 'Foetal deaths' : 'Stillbirth', align: 'right' }, { label: 'Early neonatal', align: 'right' }, { label: 'Late neonatal', align: 'right' }, { label: 'Total', align: 'right' }]}
              rows={monthly.map(r => [r.month, r.stillbirth, r.early, r.late, r.total])}
              total={['TOTAL', sum('stillbirth'), sum('early'), sum('late'), sum('total')]}
              dense
            />
          ) : (
            <Note title="2023 not reported.">The dashboard sources hold no 2023 monthly breakdown.</Note>
          )}
        </ChartCard>
      </div>
      <div>
        <SectionTitle icon={Table2} title="ICD-PM Coding — 2023, 2024 and 2025" subtitle="2025 final code in column Y compared with selected fields in columns P–X; 2024 ICD-PM counts alongside; 2023 not reported" />
        <p className="mb-4 text-sm leading-relaxed text-ink/80">117 records have final codes defined in the workbook dictionary. One final code is missing and one contains undefined cause code A7. Code descriptions below come from Sheet2. Nine records differ between final and selected codes; 13 final cause codes conflict with the recorded death category. These are source entries, not clinically validated classifications.</p>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {mpdsr.codeTables.map(table => (
            <ChartCard key={table.prefix} title={table.title} subtitle="2025 Final = column Y · 2025 Selected = columns P–X · — = not reported · — * = 2024 definition differs · ‡ = 2024 definition not stated">
              <DataTable
                columns={[{ label: 'Code' }, { label: 'Definition' }, { label: '2023', align: 'right' }, { label: '2024', align: 'right' }, { label: '2025 final', align: 'right' }, { label: '2025 selected', align: 'right' }]}
                rows={table.rows.map(r => [r.code, r.description, dash, icd2024Cell(table.prefix, r.code, r.description), r.finalCount, r.selectedCount])}
                total={['TOTAL', '', dash, icd2024TotalCell(table.prefix), table.rows.reduce((acc, r) => acc + r.finalCount, 0), table.rows.reduce((acc, r) => acc + r.selectedCount, 0)]}
                dense
              />
            </ChartCard>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink/75">Unmapped final cause: A7 — 1 record (row 95). Missing final code — 1 record (row 79). No replacement is inferred. Maternal and cause groups describe the same records and must not be added together.</p>
        <div className="mt-3">
          <Note title="Year coverage:">2024 counts are the original 2024 ICD-PM classification (final surveillance), shown only where the 2024 and 2025 dictionaries define the code the same way; a code absent from the 2024 table shows —. The 2024 and 2025 dictionaries define M1, M2 and N6 differently (2024: M1 placenta, cord and membranes, M2 “(none)”, N6 respiratory &amp; cardiovascular; 2025: M1 maternal complications of pregnancy, M2 placenta, cord and membranes, N6 infection, N7 respiratory and cardiovascular), so those 2024 counts are withheld (— *; hover for the 2024 entry) — see the 2024 ICD-PM tables below. Codes marked ‡ have no definition in the 2024 table and are matched by code only. † The 2024 TOTAL is the 2024 table’s own total (all 2024 codes, including withheld rows), so it can exceed the visible 2024 column. 2024 and 2025 are different review cycles and no change between them is calculated. No 2023 ICD-PM coding is held in the dashboard sources. The quality-of-care, modifiable-factor and demographic tables below exist only in the 2025 workbook; 2023 and 2024 are not reported.</Note>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Recorded Quality-of-Care Assessment" subtitle="119 categorised records · column AZ">
          <DataTable columns={[{ label: 'Assessment' }, { label: 'Records', align: 'right' }]} rows={mpdsr.quality.map(r => [r.label, r.count])} total={['TOTAL', mpdsr.summary.records]} />
          <p className="mt-3 text-sm text-ink/75">These are assessments entered in the workbook, not an independent judgement of care. The file does not establish which cases have been discussed by the committee.</p>
        </ChartCard>
        <ChartCard title="Recorded Modifiable Factors" subtitle="Explicit Yes entries only · a case can have multiple factors">
          <DataTable columns={[{ label: 'Group / factor' }, { label: 'Yes', align: 'right' }]} rows={mpdsr.factors.filter(r => r.yes > 0).map(r => [`${r.group}: ${r.label}`, r.yes])} dense />
          <p className="mt-3 text-sm text-ink/75">Free-text “Other” comments are not recoded into Yes/No factors. No preventability rate is inferred.</p>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {mpdsr.demographics.map(table => (
          <ChartCard key={table.title} title={table.title} subtitle="2025 workbook records">
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
      <SectionTitle icon={CalendarRange} title="Historical Reference — 2024" subtitle="Original 2024 figures and classifications retained; not directly compared with the provisional 2025 workbook" />
    </section>
  )
}
