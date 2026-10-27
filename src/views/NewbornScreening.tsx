import {
  ArrowRight,
  Baby,
  ClipboardList,
  Ear,
  Stethoscope,
  Table2,
  TestTubes,
} from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { TrendChart } from '../components/charts/Charts'
import { fp } from '../data/nbg'
import { childIndicators3y, screeningByYear, screeningCoverageTrend } from '../data/years/childrenB'
import { METRIC } from '../lib/theme'
import { cell, int, pct } from '../lib/format'
import type { ViewProps } from '../lib/dashboards'

const NR = 'No data supplied'

/** 2023–2025 screening row by metric name. */
const row = (metric: string) => screeningByYear.find((r) => r.metric === metric)

const liveBirths = row('Total live births (governorate)')
const tshScreened = row('Newborns screened for congenital hypothyroidism (TSH)')
const tshCoverage = row('TSH screening coverage %')
const tshPositive = row('TSH-positive results')
const cordHigh = row('Initial cord TSH ≥ 40 mIU/L')
const confirmedCH = row('Confirmed congenital hypothyroidism cases')
const hearingScreened = row('Newborns screened for hearing')
const hearingCoverage = row('Hearing screening coverage %')

const countOr = (v: number | null | undefined): string => (v == null ? NR : int(v))
const pctOr = (v: number | null | undefined): string => (v == null ? NR : pct(v))
const muted = (text: string) => <span className="text-ink/55">{text}</span>
const yearCell = (v: number | null, isPct: boolean) =>
  v === null ? muted(NR) : isPct ? pct(v) : int(v)

/** 2025 hearing coverage differs between sources (106% source file vs 103% KPI-deck series). */
const HEARING_COVERAGE = 'Hearing screening coverage %'
const deckHearing2025 = fp.hearingTrend.find((h) => h.year === '2025')?.screened ?? null

// Hearing referrals & TSH-positive counts over time.
const referralsTrend = fp.hearingTrend.map((h) => ({
  year: h.year,
  hearing: h.referred,
  tsh: fp.tshTrend.find((t) => t.year === h.year)?.positive ?? null,
}))

const linkButton =
  'inline-flex items-center gap-2 rounded-control border border-line/20 px-4 py-2 text-label text-heading transition-colors duration-200 hover:bg-tint/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure'

export default function NewbornScreening({ onNavigate }: ViewProps) {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Stethoscope}
        title="Newborn Screening"
        subtitle="Congenital hypothyroidism (TSH) & neonatal hearing screening — North Batinah, 2023–2025 (trends 2019–2025)"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
        <KpiCard
          label="TSH Screening Coverage (2025)"
          value={pctOr(tshCoverage?.y2025)}
          icon={Baby}
          accent="navy"
          hint={`${countOr(tshScreened?.y2025)} of ${countOr(liveBirths?.y2025)} live births · 2024: ${pctOr(tshCoverage?.y2024)} · 2023: ${pctOr(tshCoverage?.y2023)}`}
        />
        <KpiCard
          label="Confirmed Congenital Hypothyroidism (2025)"
          value={countOr(confirmedCH?.y2025)}
          icon={TestTubes}
          accent="azure"
          hint={`From ${countOr(cordHigh?.y2025)} cord TSH ≥ 40 mIU/L · TSH-positive: ${countOr(tshPositive?.y2025)} (2025), ${countOr(tshPositive?.y2024)} (2024), ${countOr(tshPositive?.y2023)} (2023)`}
        />
        <KpiCard
          label="Neonatal Hearing Coverage (2025)"
          value={pctOr(hearingCoverage?.y2025)}
          icon={Ear}
          accent="teal"
          hint={`${countOr(hearingScreened?.y2025)} screened · 2024: ${pctOr(hearingCoverage?.y2024)} · 2023: ${pctOr(hearingCoverage?.y2023)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Screening Coverage"
          subtitle="Coverage % · 2019–2025"
          footnote="2025 hearing coverage is 103% in the KPI-deck series shown here and 106% in the source file used for the 2025 KPI. The trend series gives coverage only, not counts."
        >
          <TrendChart
            data={screeningCoverageTrend}
            xKey="year"
            unit="%"
            height={300}
            series={[
              { key: 'tsh', name: 'TSH coverage', color: METRIC[0] },
              { key: 'hearing', name: 'Hearing coverage', color: METRIC[1] },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Newborn Screening Referrals"
          subtitle="Count · 2019–2025"
          footnote={`Hearing referrals: ${countOr(row('Hearing referrals')?.y2023)} (2023), ${countOr(row('Hearing referrals')?.y2024)} (2024), ${countOr(row('Hearing referrals')?.y2025)} (2025). Confirmed congenital hypothyroidism remains rare.`}
        >
          <TrendChart
            data={referralsTrend}
            xKey="year"
            unit=""
            height={300}
            series={[
              { key: 'hearing', name: 'Hearing referred', color: METRIC[0] },
              { key: 'tsh', name: 'TSH positive', color: METRIC[1] },
            ]}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="Screening Records (2023–2025)"
          subtitle="Governorate totals by year"
        />
        <ChartCard title="Newborn Screening (2023, 2024 & 2025)" subtitle="Governorate totals · 2023, 2024 and 2025">
          <DataTable
            columns={[
              { label: 'Metric' },
              { label: '2023', align: 'right' },
              { label: '2024', align: 'right' },
              { label: '2025', align: 'right' },
            ]}
            rows={screeningByYear.map((r) => [
              r.metric,
              yearCell(r.y2023, r.isPct),
              yearCell(r.y2024, r.isPct),
              r.metric === HEARING_COVERAGE && r.y2025 !== null ? `${pct(r.y2025)}*` : yearCell(r.y2025, r.isPct),
            ])}
            dense
          />
          <div className="mt-3 space-y-3">
            <Note title="2025:">{fp.note2025}</Note>
            <Note tone="warn" title="No data supplied:">
              Live births, initial cord TSH ≥ 40 mIU/L and confirmed congenital hypothyroidism are
              reported for 2025 only. The 2023 and 2024 screened counts come from the 5-year-plan
              indicators; coverage, referral and TSH-positive figures come from the 2019–2025
              trend series.
            </Note>
            <Note title="* Hearing coverage 2025:">
              {pctOr(hearingCoverage?.y2025)} is the 2025 newborn-screening source file used for the
              2025 KPI; the KPI-deck trend series (Screening Coverage chart) gives{' '}
              {pctOr(deckHearing2025)}. The figure needs confirmation; neither value has been changed.
            </Note>
          </div>
        </ChartCard>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => onNavigate('ecr')} className={linkButton}>
            3 &amp; 4-year developmental visits are now in the Extra Child Health Register
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('children/newborn-screening/extended-newborn-screening-2026')}
            className={linkButton}
          >
            Extended Newborn Screening 2026
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={ClipboardList}
          title="Children's Health — Service Readiness"
          subtitle="Five-year-plan newborn, Down-syndrome & autism indicators · 2023, 2024 & 2025"
        />
        <ChartCard title="Child-Health 5-Year-Plan Indicators (2023–2025)" subtitle="Count · 2023, 2024 and 2025">
          <DataTable
            columns={[
              { label: 'Indicator' },
              { label: '2023', align: 'right' },
              { label: '2024', align: 'right' },
              { label: '2025', align: 'right' },
            ]}
            rows={childIndicators3y.map((r) => [
              r.indicator,
              cell(r.y2023),
              cell(r.y2024),
              r.y2025 === null
                ? muted(NR)
                : r.y2025Source
                  ? `${int(r.y2025)} (${r.y2025Source})`
                  : int(r.y2025),
            ])}
            dense
          />
          <div className="mt-3">
            <Note title="2025:">
              The 5-year-plan indicator sheet covers 2023 and 2024. For 2025, the two screening
              counts come from the 2025 newborn-screening figures; the Down syndrome centres and the
              Safe Transport workshop were confirmed by the department. Health centres with staff
              trained for autism screening: no data supplied for 2025.
            </Note>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
