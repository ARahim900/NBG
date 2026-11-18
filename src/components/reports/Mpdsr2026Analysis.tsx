import { ClipboardList, ListChecks, Table2 } from 'lucide-react'
import ChartCard from '../ui/ChartCard'
import DataTable from '../ui/DataTable'
import KpiCard from '../ui/KpiCard'
import Note from '../ui/Note'
import SectionTitle from '../ui/SectionTitle'
import { TrendChart } from '../charts/Charts'
import mpdsr25 from '../../data/mpdsr2025.json'
import mpdsr26 from '../../data/mpdsr2026.json'
import { METRIC } from '../../lib/theme'
import { int } from '../../lib/format'

type Category = 'stillbirth' | 'earlyNeonatal' | 'lateNeonatal'

const CATEGORY_LABEL: Record<Category, string> = {
  stillbirth: 'Foetal deaths',
  earlyNeonatal: 'Early neonatal',
  lateNeonatal: 'Late neonatal',
}

/** Reporting months covered by the 2026 workbook (January to the last month reported). */
const periodMonths = mpdsr26.monthly.findIndex((r) => r.month === mpdsr26.summary.lastMonth) + 1
const period = `Jan–${mpdsr26.summary.lastMonth}`
const monthly = mpdsr26.monthly.slice(0, periodMonths)
const coded = mpdsr26.summary.coded
const highlighted = mpdsr26.pending.filter((p) => p.highlighted)

/** 2026 tiles; the hint gives the 2025 workbook figure as context only (no change is calculated). */
const metrics = [
  { label: 'Records in the 2026 workbook', value: mpdsr26.summary.records, prior: mpdsr25.summary.records },
  ...(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => ({
    label: `${CATEGORY_LABEL[c]} — as recorded`,
    value: mpdsr26.summary[c],
    prior: mpdsr25.summary[c],
  })),
]

const sum = (key: Category | 'total'): number => monthly.reduce((acc, r) => acc + r[key], 0)

/** 2025 count for a label in a 2025 list; 0 when the label is not recorded in 2025. */
const count2025 = (rows: { label: string; count: number }[], label: string): number =>
  rows.find((r) => r.label === label)?.count ?? 0

const qualityLabels = [...new Set([...mpdsr26.quality, ...mpdsr25.quality].map((q) => q.label))]
const factorRows = mpdsr26.factors
  .map((f) => ({ ...f, yes2025: mpdsr25.factors.find((g) => g.sourceColumn === f.sourceColumn)?.yes ?? 0 }))
  .filter((f) => f.yes > 0 || f.yes2025 > 0)

export default function Mpdsr2026Analysis() {
  return (
    <section aria-label="2026 MPDSR workbook analysis" className="space-y-8">
      <SectionTitle
        icon={ClipboardList}
        title="2026 Stillbirth & Neonatal Review"
        subtitle={`Provisional workbook records · ${period} reporting months · compared with the 2025 workbook`}
      />
      <Note title={`${int(mpdsr26.summary.records)} recorded cases in ${period} 2026:`}>
        {int(coded)} have a final ICD-PM code; {int(highlighted.length)} highlighted cases are not yet coded.
        Highlighted cases and records with empty fields are listed under cases awaiting committee review below. Code, quality-of-care and
        modifiable-factor counts use coded records only. 2026 covers {periodMonths} reporting months, so no
        year-on-year change is calculated.
      </Note>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {metrics.map(({ label, value, prior }) => (
          <KpiCard key={label} label={label} value={value} accent="navy" hint={`Provisional workbook records · 2025: ${int(prior)}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ChartCard
          title="Recorded Cases by Reporting Month (2026)"
          subtitle={`Count · ${period} 2026 · provisional MPDSR workbook · month label in column A`}
        >
          <TrendChart
            data={monthly}
            xKey="month"
            height={300}
            unit=""
            series={[{ key: 'total', name: 'Recorded cases', color: METRIC[0] }]}
            showLegend={false}
          />
        </ChartCard>
        <ChartCard title="Monthly Records (2026)" subtitle="Count · 2026 · source categories from column I · counts, not rates">
          <DataTable
            columns={[
              { label: 'Month' },
              { label: 'Foetal deaths', align: 'right' },
              { label: 'Early neonatal', align: 'right' },
              { label: 'Late neonatal', align: 'right' },
              { label: 'Total', align: 'right' },
            ]}
            rows={monthly.map((r) => [r.month, r.stillbirth, r.earlyNeonatal, r.lateNeonatal, r.total])}
            total={['TOTAL', sum('stillbirth'), sum('earlyNeonatal'), sum('lateNeonatal'), sum('total')]}
            dense
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="ICD-PM Coding — 2025 and 2026"
          subtitle="Final code in column Y and selected fields in columns P–X · both years use the same Sheet2 dictionary"
        />
        <div className="grid grid-cols-1 gap-4">
          {mpdsr26.codeTables.map((table) => {
            const rows2025 = mpdsr25.codeTables.find((t) => t.prefix === table.prefix)?.rows ?? []
            const final2025 = (code: string): number => rows2025.find((r) => r.code === code)?.finalCount ?? 0
            return (
              <ChartCard
                key={table.prefix}
                title={table.title}
                subtitle={`Count · 2025 all records · 2026 coded records (${int(coded)}) · Final = column Y · Selected = columns P–X`}
              >
                <DataTable
                  columns={[
                    { label: 'Code' },
                    { label: 'Definition' },
                    { label: '2025 final', align: 'right' },
                    { label: '2026 final', align: 'right' },
                    { label: '2026 selected', align: 'right' },
                  ]}
                  rows={table.rows.map((r) => [r.code, r.description, final2025(r.code), r.finalCount, r.selectedCount])}
                  total={[
                    'TOTAL',
                    '',
                    rows2025.reduce((acc, r) => acc + r.finalCount, 0),
                    table.rows.reduce((acc, r) => acc + r.finalCount, 0),
                    table.rows.reduce((acc, r) => acc + r.selectedCount, 0),
                  ]}
                  dense
                />
              </ChartCard>
            )
          })}
        </div>
        <p className="mt-4 text-sm text-ink/75">
          Maternal and cause groups describe the same records and must not be added together. 2026 is a partial year
          ({period}) and 2025 is a full year, so counts are shown side by side without a change.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Recorded Quality-of-Care Assessment" subtitle={`Count · 2025 all records · 2026 coded records (${int(coded)}) · column AZ`}>
          <DataTable
            columns={[{ label: 'Assessment' }, { label: '2025', align: 'right' }, { label: '2026', align: 'right' }]}
            rows={qualityLabels.map((label) => [label, count2025(mpdsr25.quality, label), count2025(mpdsr26.quality, label)])}
            total={['TOTAL', mpdsr25.summary.records, coded]}
          />
        </ChartCard>
        <ChartCard title="Recorded Modifiable Factors" subtitle="Count · 2025 and 2026 · explicit Yes entries only · a case can have multiple factors">
          <DataTable
            columns={[{ label: 'Group / factor' }, { label: '2025', align: 'right' }, { label: '2026', align: 'right' }]}
            rows={factorRows.map((f) => [`${f.group}: ${f.label}`, f.yes2025, f.yes])}
            dense
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {mpdsr26.demographics.map((table) => {
          const rows2025 = mpdsr25.demographics.find((t) => t.title === table.title)?.rows ?? []
          const labels = [...new Set([...table.rows, ...rows2025].map((r) => r.label))]
          return (
            <ChartCard key={table.title} title={table.title} subtitle="Count · 2025 and 2026 · workbook records">
              <DataTable
                columns={[{ label: 'Category' }, { label: '2025', align: 'right' }, { label: '2026', align: 'right' }]}
                rows={labels.map((label) => [label, count2025(rows2025, label), count2025(table.rows, label)])}
                total={['TOTAL', mpdsr25.summary.records, mpdsr26.summary.records]}
                dense
              />
            </ChartCard>
          )
        })}
      </div>

      <div>
        <SectionTitle
          icon={ListChecks}
          title="Cases Awaiting Committee Review"
          subtitle={`${int(mpdsr26.pending.length)} records · ${int(highlighted.length)} highlighted, not yet coded · ${int(mpdsr26.pending.length - highlighted.length)} coded with a field missing`}
        />
        <ChartCard
          title="Cases to Review and Code"
          subtitle="2026 workbook · Sheet1 row reference · no patient identifiers"
          footnote="Every highlighted case and every record with an empty field in the case details, final ICD-PM code or quality-of-care column. Pending records stay in the case totals."
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
        <p className="mt-4 break-words text-xs leading-relaxed text-ink/70">
          Source: {mpdsr26.source.filename} (corrected) · Sheet1 {mpdsr26.source.caseRange}. Workbook read without
          modification. The app includes aggregate counts and row references only, without patient identifiers.
        </p>
      </div>
    </section>
  )
}
