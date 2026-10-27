import { useState } from 'react'
import { CalendarCheck, ClipboardList, Download, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import ProgrammeProfile from '../components/ui/ProgrammeProfile'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { MONTHS, coverage, visits2025, visitsByWilayat, type VisitSheet } from '../data/wch2025'
import {
  NOT_REPORTED,
  SAFE_TRANSPORT_2025_LABEL,
  SAFE_TRANSPORT_WORKSHOPS_TOTAL,
  VISIT_METRIC_OPTIONS,
  YEARS,
  monthFigure,
  safeTransportWorkshops,
  visitCsv,
  type VisitMetric,
} from '../data/years/childrenA'
import { downloadCsv } from '../lib/csv'
import { METRIC } from '../lib/theme'
import { int, pct } from '../lib/format'

const { three, four } = visits2025

/** Safe Transport of the Critically Ill Child — programme figures supplied by the department. */
const SAFE_TRANSPORT = [
  { label: 'Workshops conducted', value: SAFE_TRANSPORT_WORKSHOPS_TOTAL, detail: '2023–2025 · 1 each year' },
  { label: 'Master trainers', value: 2, detail: 'North Al Batinah Governorate' },
]

const cov = (s: VisitSheet['statedTotals']) => coverage(s.clerked, s.target)
const fmtCov = (v: number | null) => (v === null ? '—' : pct(v))
const dash = (v: number | null) => (v === null ? '—' : int(v))
const notReported = <span className="text-ink/55">{NOT_REPORTED}</span>

const monthly = MONTHS.map((month, i) => ({
  month,
  three: three.monthlyClerked[i],
  four: four.monthlyClerked[i],
}))

const w3 = visitsByWilayat(three)
const w4 = visitsByWilayat(four)
const oneDecimal = (v: number | null) => (v === null ? null : Number(v.toFixed(1)))
const byWilayat = w3.map((r) => {
  const f = w4.find((x) => x.wilayat === r.wilayat)
  return {
    wilayat: r.wilayat,
    three: oneDecimal(coverage(r.clerked, r.target)),
    four: f ? oneDecimal(coverage(f.clerked, f.target)) : null,
  }
})

/** Month trend beside vertical wilayat bars: both use the taller height so the cards line up. */
const VISIT_ROW_HEIGHT = Math.max(300, 44 * byWilayat.length)

type VisitAge = 'three' | 'four'
const AGE_OPTIONS: { value: VisitAge; label: string }[] = [
  { value: 'three', label: '3-year visit' },
  { value: 'four', label: '4-year visit' },
]
const AGE_LABEL: Record<VisitAge, string> = { three: '3-year visit', four: '4-year visit' }
const METRIC_LABEL: Record<VisitMetric, string> = { clerked: 'children seen', target: 'target cohort', referred: 'referrals' }

/** Both sheets, every institution and month, as long-form CSV rows. */
const exportRecords = () => {
  const { header, rows } = visitCsv([
    { label: AGE_LABEL.three, sheet: three },
    { label: AGE_LABEL.four, sheet: four },
  ])
  downloadCsv(`nbg-3-4-year-visits-${visits2025.year}-monthly-records.csv`, header, rows)
}

export default function ExtraChildHealthRegister() {
  const [age, setAge] = useState<VisitAge>('three')
  const [metric, setMetric] = useState<VisitMetric>('clerked')
  const sheet = visits2025[age]
  const ageShort = age === 'three' ? '3' : '4'

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={ClipboardList}
        title="Extra Child Health Register"
        subtitle="3 & 4-year developmental visits in primary health care (2025) and Safe Transport of the Critically Ill Child — North Batinah. ASD Early Screening is part of this register."
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="3-Year Visit Coverage (2025)"
          value={fmtCov(cov(three.statedTotals))}
          icon={CalendarCheck}
          accent="navy"
          hint={`${int(three.statedTotals.clerked)} of ${int(three.statedTotals.target)} children · 2023–2024 no data supplied`}
        />
        <KpiCard
          label="4-Year Visit Coverage (2025)"
          value={fmtCov(cov(four.statedTotals))}
          icon={CalendarCheck}
          accent="azure"
          hint={`${int(four.statedTotals.clerked)} of ${int(four.statedTotals.target)} children · 2023–2024 no data supplied`}
        />
        <KpiCard
          label="Referred at 3 Years (2025)"
          value={int(three.statedTotals.referred)}
          icon={ClipboardList}
          accent="teal"
          hint="As reported — see data notes"
        />
        <KpiCard
          label="Referred at 4 Years (2025)"
          value={int(four.statedTotals.referred)}
          icon={ClipboardList}
          accent="gold"
          hint="As reported — see data notes"
        />
      </div>

      <div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Visits by Month (2025 Only)" subtitle="Count of children seen at the 3 and 4-year visits, all institutions · 2025">
            <TrendChart
              data={monthly}
              xKey="month"
              unit=""
              height={VISIT_ROW_HEIGHT}
              series={[
                { key: 'three', name: '3-year visit', color: METRIC[0] },
                { key: 'four', name: '4-year visit', color: METRIC[1] },
              ]}
            />
          </ChartCard>
          <ChartCard title="Coverage by Wilayat (2025 Only)" subtitle="% of the target cohort seen · 2025">
            <ComparisonBars
              data={byWilayat}
              xKey="wilayat"
              unit="%"
              layout="vertical"
              height={VISIT_ROW_HEIGHT}
              categoryWidth={104}
              series={[
                { key: 'three', name: '3-year visit', color: METRIC[0] },
                { key: 'four', name: '4-year visit', color: METRIC[1] },
              ]}
            />
          </ChartCard>
        </div>
        <div className="mt-3">
          <Note title="No data supplied:">
            Monthly and wilayat figures exist for {visits2025.year} only ({visits2025.source.filename}); no data was
            supplied for 2023 and 2024, so these two charts are not year comparisons.
          </Note>
        </div>
      </div>

      <ChartCard title="3 & 4-Year Visits by Year, 2023–2025" subtitle="Governorate totals — target cohort, children seen, coverage and referrals · 2023, 2024 and 2025">
        <DataTable
          dense
          columns={[
            { label: 'Year' },
            { label: '3y Target', align: 'right' },
            { label: '3y Seen', align: 'right' },
            { label: '3y Coverage', align: 'right' },
            { label: '3y Referred', align: 'right' },
            { label: '4y Target', align: 'right' },
            { label: '4y Seen', align: 'right' },
            { label: '4y Coverage', align: 'right' },
            { label: '4y Referred', align: 'right' },
          ]}
          rows={YEARS.map((y) =>
            String(visits2025.year) === y
              ? [
                  y,
                  ...[three, four].flatMap((s) => [
                    int(s.statedTotals.target),
                    int(s.statedTotals.clerked),
                    fmtCov(cov(s.statedTotals)),
                    int(s.statedTotals.referred),
                  ]),
                ]
              : [y, ...Array.from({ length: 8 }, () => notReported)],
          )}
        />
        <div className="mt-3">
          <Note title="No data supplied:">
            The register holds the {visits2025.year} workbook only ({visits2025.source.filename}). No 3 or 4-year visit
            figures for 2023 or 2024 exist in the dashboard data, so those years are shown as “{NOT_REPORTED}”, not zero.
          </Note>
        </div>
      </ChartCard>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-[16rem] flex-1">
            <SectionTitle
              icon={Table2}
              title="Visits by Health Institution (2025)"
              subtitle="Annual totals and the full monthly records for every institution — choose the visit"
            />
          </div>
          <div className="mb-4">
            <Segmented label="Visit" options={AGE_OPTIONS} value={age} onChange={setAge} />
          </div>
        </div>

        <div className="space-y-4">
          <ChartCard
            title={`${ageShort}-Year Developmental Visit by Institution — Annual Totals`}
            subtitle="Grouped by wilayat, north to south · 2025"
          >
            <DataTable
              dense
              columns={[
                { label: 'Institution' },
                { label: 'Wilayat' },
                { label: 'Target', align: 'right' },
                { label: 'Seen', align: 'right' },
                { label: 'Coverage', align: 'right' },
                { label: 'Referred', align: 'right' },
              ]}
              rows={sheet.centres.map((c) => [
                c.name,
                c.wilayat,
                int(c.target),
                int(c.clerked),
                fmtCov(coverage(c.clerked, c.target)),
                int(c.referred),
              ])}
              total={[
                'GOVERNORATE',
                '',
                int(sheet.statedTotals.target),
                int(sheet.statedTotals.clerked),
                fmtCov(cov(sheet.statedTotals)),
                int(sheet.statedTotals.referred),
              ]}
            />
          </ChartCard>

          <ChartCard
            title={`${ageShort}-Year Visit — Monthly Records by Institution`}
            subtitle={`Monthly ${METRIC_LABEL[metric]} for all ${sheet.centres.length} institutions, January–December ${visits2025.year}; “—” is a blank in the workbook`}
            action={
              <div className="flex flex-wrap items-end gap-3">
                <Segmented label="Figure" options={VISIT_METRIC_OPTIONS} value={metric} onChange={setMetric} />
                <button
                  type="button"
                  onClick={exportRecords}
                  className="inline-flex min-h-11 items-center gap-2 rounded-control border border-line/20 px-4 text-label text-heading transition-colors hover:bg-tint/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure/60"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Export CSV
                </button>
              </div>
            }
          >
            <p className="mb-3 text-xs text-ink/80 sm:hidden">Swipe the table sideways to see every month.</p>
            <DataTable
              dense
              columns={[
                { label: 'Institution' },
                { label: 'Wilayat' },
                ...MONTHS.map((m) => ({ label: m, align: 'right' as const })),
                { label: metric === 'target' ? 'Workbook annual target' : 'Workbook total', align: 'right' },
              ]}
              rows={sheet.centres.map((c) => [
                c.name,
                c.wilayat,
                ...MONTHS.map((_, i) => dash(monthFigure(c, i, metric))),
                int(c[metric]),
              ])}
            />
            <div className="mt-3">
              <Note title="Export:">
                The CSV holds every record for both visits — one row per institution and month with target, seen and
                referred, plus each institution&apos;s workbook annual figures (target is the annual cohort, not a sum
                of the months). Blank months are left empty, not zero.
              </Note>
            </div>
          </ChartCard>

          <div className="space-y-3">
            <Note title="Source:">
              {visits2025.source.filename}. Figures are as reported in the workbook; “Workbook total” is the
              institution&apos;s own total column, which can differ from its months (see data notes); for the target
              figure it is the institution&apos;s annual target cohort (“Workbook annual target”). Coverage above
              100% and the items below are shown as reported, not corrected.
            </Note>
            {sheet.flags.length > 0 && (
              <details className="card px-3.5 py-3 text-caption leading-relaxed text-heading/80">
                <summary className="cursor-pointer font-bold">
                  Data notes for the {ageShort}-year sheet ({sheet.flags.length}) — to verify with the source
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {sheet.flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </div>

      <ProgrammeProfile
        id="safe-transport"
        title="Safe Transport of the Critically Ill Child"
        caption="2023–2025"
        facts={SAFE_TRANSPORT}
        byYear={
          <>
            <DataTable
              dense
              columns={[{ label: 'Workshops by year' }, ...YEARS.map((y) => ({ label: y, align: 'right' as const }))]}
              rows={[
                [
                  'Safe Transport workshops',
                  dash(safeTransportWorkshops.y2023),
                  dash(safeTransportWorkshops.y2024),
                  SAFE_TRANSPORT_2025_LABEL,
                ],
              ]}
            />
            <p className="mt-2 text-caption text-ink/60">
              2023 and 2024 are from the 5-year plan; 2025 was confirmed by the department. Master trainers: 2.
            </p>
          </>
        }
      />
    </div>
  )
}
