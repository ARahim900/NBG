import { Activity, Baby, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Mpdsr2025Report from '../components/reports/Mpdsr2025Report'
import { ComparisonBars } from '../components/charts/Charts'
import { sn } from '../data/nbg'
import {
  cohortB,
  icdTables3y,
  perinatalByCategory3y,
  perinatalHeadline2025,
  perinatalMonthly3y,
  perinatalTotals,
} from '../data/years/childrenB'
import { C, YEAR_COLORS } from '../lib/theme'
import { int } from '../lib/format'

const NR = 'Not reported'
const countOr = (v: number | null): string => (v === null ? NR : int(v))

const earlyNeonatal2025 =
  perinatalByCategory3y.find((r) => r.category === 'Early neonatal')?.y2025 ?? null

const cohortBars = sn.yearTotals.filter((r) => r.category !== 'TOTAL')
const cohortTotal = sn.yearTotals.find((r) => r.category === 'TOTAL')

/** Grouped-bar series for 2023–2025; 2023 has no source, so its legend says so. */
const YEAR_SERIES = [
  { key: 'y2023', name: '2023 (not reported)', color: YEAR_COLORS['2023'] },
  { key: 'y2024', name: '2024', color: YEAR_COLORS['2024'] },
  { key: 'y2025', name: '2025 (provisional)', color: YEAR_COLORS['2025'] },
]

const muted = (text: string) => <span className="text-ink/55">{text}</span>

/** 2025 cell of a definition-matched ICD-PM row: count, the 2025 code when it differs, or "—". */
const icd2025Cell = (r: { code2024: string; y2025: number | null; code2025: string | null }) => {
  if (r.y2025 === null || r.code2025 === null) return muted('—')
  return r.code2025 === r.code2024 ? int(r.y2025) : `${int(r.y2025)} (${r.code2025})*`
}

export default function StillbirthNeonatal() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Baby}
        title="Stillbirth & Neonatal"
        subtitle="Perinatal deaths 2023–2025 · 2023 not reported · 2024 KPI-deck surveillance · 2025 MPDSR workbook (provisional)"
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
        <p className="mt-2 text-caption text-ink/60">
          Programme-team counts as supplied; the reporting year is not stated in the source. The
          2025 KPI presentation separately reports{' '}
          {countOr(sn.summary2025.find((r) => r.metric.startsWith('Surveillance review'))?.value ?? null)}{' '}
          surveillance review meetings.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
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
        <KpiCard
          label="Perinatal Deaths (2023)"
          value={countOr(perinatalTotals.y2023)}
          icon={Baby}
          accent="teal"
          hint="No 2023 count in the sources"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Perinatal Deaths by Category"
          subtitle="Count · 2023, 2024 & 2025"
          footnote="2023 is not reported in the sources. 2025 counts are provisional MPDSR workbook records (unreconciled), so no year-on-year change is calculated."
        >
          <ComparisonBars
            data={perinatalByCategory3y}
            xKey="category"
            height={300}
            series={YEAR_SERIES}
          />
        </ChartCard>
        <ChartCard
          title="Perinatal Deaths by Month"
          subtitle="Monthly total · 2023, 2024 & 2025"
          footnote="2024: KPI-deck surveillance. 2025: provisional workbook records by reporting month, not death date. 2023: not reported. Different sources, shown side by side; no change is calculated. The 2025 review below has the monthly breakdown by category for each year."
        >
          <ComparisonBars
            data={perinatalMonthly3y}
            xKey="month"
            height={300}
            series={YEAR_SERIES}
          />
        </ChartCard>
      </div>

      <Mpdsr2025Report />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Annual Cohort Comparison"
          subtitle={`Two surveillance cohorts in the source (${countOr(cohortTotal?.cohortA ?? null)} vs ${countOr(cohortTotal?.cohortB ?? null)})`}
          footnote={`Cohort A matches the 2024 KPI-deck monthly table exactly, so it is shown as 2024. Cohort B matches the 2025 MPDSR workbook for stillbirth (${countOr(cohortB('Stillbirth'))}) and late neonatal (${countOr(cohortB('Late Neonatal Death'))}) but not early neonatal (${countOr(cohortB('Early Neonatal Death'))} vs ${countOr(earlyNeonatal2025)}), and was previously shown on this page as 2024; its year needs confirmation, so it is kept out of every year column.`}
        >
          <ComparisonBars
            data={cohortBars}
            xKey="category"
            layout="vertical"
            height={250}
            categoryWidth={120}
            series={[
              { key: 'cohortA', name: 'Cohort A (2024)', color: YEAR_COLORS['2024'] },
              { key: 'cohortB', name: 'Cohort B (year not confirmed)', color: C.muted },
            ]}
          />
        </ChartCard>
        <div className="space-y-3">
          <Note tone="warn" title="Years covered:">
            2023 perinatal-death figures are not reported in any source used by this dashboard.
            2024 figures come from the KPI-deck final surveillance (total{' '}
            {countOr(perinatalTotals.y2024)}). 2025 figures come from the provisional MPDSR review
            workbook ({countOr(perinatalTotals.y2025)} records; the KPI presentation headline is{' '}
            {countOr(perinatalHeadline2025)}). The 2024 and 2025 sources differ in method, so the
            counts are shown side by side without a percentage change.
          </Note>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="2024 ICD-PM Codes Matched to 2025 by Definition"
          subtitle="Perinatal-death cause coding · 2023 not reported · 2024 ICD-PM · 2025 workbook final code"
        />
        <div className="mb-4">
          <Note title="Years covered:">
            The ICD-PM table in the 2025 review above lists every 2025 code and shows a 2024 count
            only where both years define that code the same way. These tables start from the 2024
            codes and give the 2025 count for the same definition. The 2025 workbook numbers some
            codes differently from the 2024 table: 2024 M1 (complications of placenta, cord and
            membranes) is 2025 M2, and 2024 N6 (respiratory &amp; cardiovascular disorders) is 2025
            N7 — marked *. 2024 codes with no definition in the 2024 table (for example N5, N7,
            N10) are not matched and show —. No 2023 ICD-PM coding is held in the sources. 2024 and
            2025 are different review cycles, so no change is calculated.
          </Note>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {icdTables3y.map((t) => (
            <ChartCard
              key={t.title}
              title={t.title}
              subtitle="2024 code · 2023, 2024 & 2025 · * = 2025 code differs"
            >
              <DataTable
                columns={[
                  { label: 'Code (2024)' },
                  { label: 'Definition (2024 table)' },
                  { label: '2023', align: 'right' },
                  { label: '2024', align: 'right' },
                  { label: '2025', align: 'right' },
                ]}
                rows={t.rows.map((r) => [
                  r.code2024,
                  <span key={r.code2024} className="text-xs text-ink/65">
                    {r.description || '—'}
                  </span>,
                  muted(NR),
                  int(r.y2024),
                  icd2025Cell(r),
                ])}
                dense
              />
            </ChartCard>
          ))}
        </div>
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
