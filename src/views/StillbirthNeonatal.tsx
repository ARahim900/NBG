import { Activity, Baby, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import ProgrammeProfile from '../components/ui/ProgrammeProfile'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Mpdsr2025Report from '../components/reports/Mpdsr2025Report'
import Mpdsr2026Analysis from '../components/reports/Mpdsr2026Analysis'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { sn } from '../data/nbg'
import {
  cohortB,
  icdTablesYears,
  perinatalByCategoryYears,
  perinatalHeadline2025,
  perinatalMonthlyYears,
  perinatalTotals,
} from '../data/years/childrenB'
import mpdsr26 from '../data/mpdsr2026.json'
import { C, METRIC, YEAR_COLORS } from '../lib/theme'
import { int } from '../lib/format'

const NR = 'No data supplied'
const countOr = (v: number | null): string => (v === null ? NR : int(v))

const earlyNeonatal2025 =
  perinatalByCategoryYears.find((r) => r.category === 'Early neonatal')?.y2025 ?? null

const cohortBars = sn.yearTotals.filter((r) => r.category !== 'TOTAL')
const cohortTotal = sn.yearTotals.find((r) => r.category === 'TOTAL')

const period2026 = `Jan–${mpdsr26.summary.lastMonth}`

/** Year series for 2024–2026 on the light → dark year ramp (older years lighter). */
const YEAR_SERIES = [
  { key: 'y2024', name: '2024', color: YEAR_COLORS['2023'] },
  { key: 'y2025', name: '2025 (provisional)', color: YEAR_COLORS['2024'] },
  { key: 'y2026', name: `2026 (provisional, ${period2026})`, color: C.navy },
]

const muted = (text: string) => <span className="text-ink/55">{text}</span>

/** 2025/2026 cell of a definition-matched ICD-PM row: count, the code when it differs from 2024, or "—". */
const icdLaterCell = (code2024: string, value: number | null, code: string | null) => {
  if (value === null || code === null) return muted('—')
  return code === code2024 ? int(value) : `${int(value)} (${code})*`
}

export default function StillbirthNeonatal() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Baby}
        title="Stillbirth & Neonatal"
        subtitle={`Perinatal deaths 2024–2026 · 2024 KPI-deck surveillance · 2025 MPDSR workbook (provisional) · 2026 MPDSR workbook (provisional, ${period2026})`}
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
        <KpiCard
          label={`Perinatal Deaths (2026, ${period2026})`}
          value={countOr(perinatalTotals.y2026)}
          icon={Baby}
          accent="teal"
          hint={`Provisional MPDSR workbook · ${int(mpdsr26.summary.coded)} coded · ${int(mpdsr26.summary.highlighted)} highlighted, not yet coded`}
        />
        <KpiCard
          label="Perinatal Deaths — KPI Headline (2025)"
          value={countOr(perinatalHeadline2025)}
          icon={Activity}
          accent="navy"
          hint={`WCH KPI presentation · ${countOr(perinatalTotals.y2025)} provisional workbook records in the 2025 review below`}
        />
        <KpiCard
          label="Perinatal Deaths (2024)"
          value={countOr(perinatalTotals.y2024)}
          icon={Activity}
          accent="azure"
          hint={`KPI-deck final surveillance (cohort A) · previously shown here as ${countOr(cohortTotal?.cohortB ?? null)} (cohort B)`}
        />
      </div>

      {/* The same deaths by category two ways: by year, and by the two source cohorts. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Perinatal Deaths by Category"
          subtitle={`Count · 2024, 2025 and 2026 (${period2026})`}
          footnote={`2025 and 2026 counts are provisional MPDSR workbook records (unreconciled), so no year-on-year change is calculated. 2026 covers ${period2026} only.`}
        >
          <ComparisonBars
            data={perinatalByCategoryYears}
            xKey="category"
            height={300}
            series={YEAR_SERIES}
          />
        </ChartCard>
        <ChartCard
          title="Annual Cohort Comparison"
          subtitle={`Two surveillance cohorts in the source (${countOr(cohortTotal?.cohortA ?? null)} vs ${countOr(cohortTotal?.cohortB ?? null)})`}
          footnote={`Cohort A matches the 2024 KPI-deck monthly table exactly, so it is shown as 2024. Cohort B matches the 2025 MPDSR workbook for stillbirth (${countOr(cohortB('Stillbirth'))}) and late neonatal (${countOr(cohortB('Late Neonatal Death'))}) but not early neonatal (${countOr(cohortB('Early Neonatal Death'))} vs ${countOr(earlyNeonatal2025)}), and was previously shown on this page as 2024; its year needs confirmation, so it is kept out of every year column.`}
        >
          <ComparisonBars
            data={cohortBars}
            xKey="category"
            height={300}
            series={[
              { key: 'cohortA', name: 'Cohort A (2024)', color: METRIC[0] },
              { key: 'cohortB', name: 'Cohort B (year not confirmed)', color: METRIC[1] },
            ]}
          />
        </ChartCard>
      </div>

      {/* Twelve months by three years: full width so every month label reads. */}
      <ChartCard
        title="Perinatal Deaths by Month"
        subtitle="Monthly count · 2024, 2025 and 2026"
        footnote={`2024: KPI-deck surveillance. 2025 and 2026: provisional workbook records by reporting month, not death date; 2026 is reported to ${mpdsr26.summary.lastMonth}. Different sources, shown side by side; no change is calculated. The 2025 review below has the monthly breakdown by category for 2024 and 2025.`}
      >
        <TrendChart
          data={perinatalMonthlyYears}
          xKey="month"
          unit=""
          height={300}
          series={YEAR_SERIES}
        />
      </ChartCard>

      <Note tone="warn" title="Years covered:">
        2024 figures come from the KPI-deck final surveillance (total{' '}
        {countOr(perinatalTotals.y2024)}). 2025 figures come from the provisional MPDSR review
        workbook ({countOr(perinatalTotals.y2025)} records; the KPI presentation headline is{' '}
        {countOr(perinatalHeadline2025)}). 2026 figures come from the provisional 2026 MPDSR review
        workbook ({countOr(perinatalTotals.y2026)} records, {period2026}). The sources differ in
        method, so the counts are shown side by side without a percentage change.
      </Note>

      <Mpdsr2026Analysis />

      <Mpdsr2025Report />

      <div>
        <SectionTitle
          icon={Table2}
          title="2024 ICD-PM Codes Matched to 2025 and 2026 by Definition"
          subtitle="Perinatal-death cause coding · 2024 ICD-PM · 2025 and 2026 workbook final code"
        />
        <div className="space-y-4">
          <Note title="Years covered:">
            The ICD-PM table in the 2025 review above lists every 2025 code and shows a 2024 count
            only where both years define that code the same way. These tables start from the 2024
            codes and give the 2025 and 2026 counts for the same definition (the 2026 workbook uses
            the same code dictionary as 2025; 2026 counts are coded records only). The 2025 workbook numbers some
            codes differently from the 2024 table: 2024 M1 (complications of placenta, cord and
            membranes) is 2025 M2, and 2024 N6 (respiratory &amp; cardiovascular disorders) is 2025
            N7 — marked *. 2024 codes with no definition in the 2024 table (for example N5, N7,
            N10) are not matched and show —. 2024, 2025 and 2026 are different review cycles, so no
            change is calculated.
          </Note>
          {icdTablesYears.map((t) => (
            <ChartCard
              key={t.title}
              title={t.title}
              subtitle="Count by 2024 code · 2024, 2025 and 2026 · * = 2025/2026 code differs"
            >
              <DataTable
                columns={[
                  { label: 'Code (2024)' },
                  { label: 'Definition (2024 table)' },
                  { label: '2024', align: 'right' },
                  { label: '2025', align: 'right' },
                  { label: '2026', align: 'right' },
                ]}
                rows={t.rows.map((r) => [
                  r.code2024,
                  <span key={r.code2024} className="text-xs text-ink/65">
                    {r.description || '—'}
                  </span>,
                  int(r.y2024),
                  icdLaterCell(r.code2024, r.y2025, r.code2025),
                  icdLaterCell(r.code2024, r.y2026, r.code2025),
                ])}
                dense
              />
            </ChartCard>
          ))}
        </div>
      </div>

      <ProgrammeProfile
        id="sn-programme"
        caption={
          <>
            Programme-team counts as supplied; the reporting year is not stated. The 2025 KPI presentation separately
            reports {countOr(sn.summary2025.find((r) => r.metric.startsWith('Surveillance review'))?.value ?? null)}{' '}
            surveillance review meetings.
          </>
        }
        facts={[
          { label: 'Workshops conducted', value: 1 },
          { label: 'Master trainers', value: 3, detail: 'North Al Batinah Governorate' },
          { label: 'Committee meetings held', value: 21 },
        ]}
        challenges={[
          'Delays in the submission of stillbirth and neonatal death notification forms by institutions.',
          'Incomplete information in some death notification forms.',
          'Many cases cannot be reviewed within the month in which the death occurred.',
        ]}
        achievements={[
          'A catch-up plan has been put in place.',
          'Doctors have been provided with a standardised template to ensure consistency in case presentations.',
        ]}
        plan={[
          'Hold monthly case review meetings with the committee to prevent delays in reviewing stillbirths and neonatal deaths.',
        ]}
      />
    </div>
  )
}
