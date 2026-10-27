import { MapPin, Microscope, PieChart, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { ca, sumBy } from '../data/nbg'
import {
  caFacility3y,
  caPublicShare,
  caSector3y,
  caTotals,
  caWilayat3y,
} from '../data/years/childrenB'
import { C, YEAR_COLORS } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const NR = 'Not reported'
const countOr = (v: number | null): string => (v === null ? NR : int(v))
const pctOr = (v: number | null): string => (v === null ? NR : pct(v))

const n2023 = caTotals.y2023
const n2024 = caTotals.y2024
const n2025 = caTotals.y2025

/** Change only when both years are reported; a missing year never counts as 0. */
const changeOr = (cur: number | null, prev: number | null): number | null =>
  cur === null || prev === null ? null : deltaPct(cur, prev)

// Facility rows for 2023 sum to less than the governorate total (as supplied).
const facility2023 = sumBy(caFacility3y, (r) => r.y2023)

// Most-notifying wilayat per year with a wilayat breakdown (2023, 2024).
const topIn = (key: 'y2023' | 'y2024') =>
  caWilayat3y.reduce((a, b) => ((b[key] ?? 0) > (a[key] ?? 0) ? b : a))
const top2023 = topIn('y2023')
const top2024 = topIn('y2024')

/** Grouped-bar series for 2023–2025; 2025 is kept in the legend when missing. */
const yearSeries = (missing2025: boolean) => [
  { key: 'y2023', name: '2023', color: YEAR_COLORS['2023'] },
  { key: 'y2024', name: '2024', color: YEAR_COLORS['2024'] },
  { key: 'y2025', name: missing2025 ? '2025 (not reported)' : '2025', color: YEAR_COLORS['2025'] },
]

const muted = (text: string) => (
  <span className="text-ink/55">{text}</span>
)

export default function CongenitalAnomalies() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Microscope}
        title="Congenital Anomalies & Genetic Disorders"
        subtitle="Notifications 2023–2025 · total trend 2019–2025 · sector split 2023–2025 · wilayat & facility detail 2023–2024 (2025 not reported)"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Notifications (2025)"
          value={countOr(n2025)}
          icon={Microscope}
          accent="navy"
          hint={`2024: ${countOr(n2024)} · 2023: ${countOr(n2023)} · change not confirmed: the 2025 source describes MOH cases`}
        />
        <KpiCard
          label="Notifications (2024)"
          value={countOr(n2024)}
          icon={Microscope}
          accent="azure"
          delta={changeOr(n2024, n2023)}
          deltaTone="neutral"
          hint={`vs ${countOr(n2023)} in 2023`}
        />
        <KpiCard
          label="Public-Sector Share (2025)"
          value={pctOr(caPublicShare.y2025)}
          icon={PieChart}
          accent="teal"
          hint={`2024: ${pctOr(caPublicShare.y2024)} · 2023: ${pctOr(caPublicShare.y2023)}`}
        />
        <KpiCard
          label="Most Reported Wilayat (2023–2024)"
          value={top2024.wilayat}
          icon={MapPin}
          accent="gold"
          hint={`${int(top2024.y2024)} (2024) · ${top2023.wilayat === top2024.wilayat ? '' : `${top2023.wilayat} `}${int(top2023.y2023)} (2023) · 2025 not reported`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Total Notifications Trend"
          subtitle="Notifications · 2019–2025"
          footnote={`2025 reached ${countOr(n2025)} — the highest in the seven-year series (KPI-deck chart; the slide headline cites 168). The 2023 (${countOr(n2023)}) and 2024 (${countOr(n2024)}) values equal the public + private totals in the sector table; the source describes the 2025 figure as MOH cases.`}
        >
          <TrendChart
            data={ca.totalTrend}
            xKey="year"
            variant="area"
            unit=""
            height={280}
            series={[{ key: 'value', name: 'Notifications', color: C.azure }]}
          />
        </ChartCard>
        <ChartCard
          title="Sector Split: MOH vs Private"
          subtitle="% of notifications · 2023–2025"
          footnote={`MOH share: ${pctOr(caPublicShare.y2023)} (2023), ${pctOr(caPublicShare.y2024)} (2024), ${pctOr(caPublicShare.y2025)} (2025).`}
        >
          <ComparisonBars
            data={ca.sectorPct}
            xKey="year"
            stacked
            unit="%"
            height={280}
            series={[
              { key: 'moh', name: 'MOH', color: C.navy },
              { key: 'private', name: 'Private', color: C.teal },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Notifications by Reporting Facility"
          subtitle="Count · 2023, 2024 & 2025"
          footnote="2025: no facility breakdown in the source — only the governorate total and sector percentages."
        >
          <ComparisonBars
            data={caFacility3y}
            xKey="facility"
            layout="vertical"
            height={380}
            categoryWidth={120}
            series={yearSeries(true)}
          />
        </ChartCard>
        <ChartCard
          title="Notifications by Sector"
          subtitle="Public (MOH) vs private count · 2023, 2024 & 2025"
          footnote={`2025 sector counts are not reported; the 2025 split is published only as a percentage (MOH ${pctOr(caPublicShare.y2025)}).`}
        >
          <ComparisonBars
            data={caSector3y}
            xKey="sector"
            height={380}
            series={yearSeries(true)}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="Detailed Tables"
          subtitle="By wilayat & facility · 2023, 2024 & 2025"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Notifications by Wilayat" subtitle="2023, 2024 & 2025">
            <DataTable
              columns={[
                { label: 'Wilayat' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
                { label: '% Change 2023→2024', align: 'right' },
              ]}
              rows={caWilayat3y.map((r) => [
                r.wilayat,
                int(r.y2023),
                int(r.y2024),
                muted(countOr(r.y2025)),
                `${r.change > 0 ? '+' : ''}${r.change.toFixed(0)}%`,
              ])}
              total={[
                'TOTAL',
                int(sumBy(caWilayat3y, (r) => r.y2023)),
                int(sumBy(caWilayat3y, (r) => r.y2024)),
                muted(NR),
                '',
              ]}
              dense
            />
          </ChartCard>
          <ChartCard title="By Reporting Facility" subtitle="2023, 2024 & 2025">
            <DataTable
              columns={[
                { label: 'Facility' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
              ]}
              rows={caFacility3y.map((r) => [
                r.facility,
                int(r.y2023),
                int(r.y2024),
                muted(countOr(r.y2025)),
              ])}
              total={[
                'TOTAL',
                int(facility2023),
                int(sumBy(caFacility3y, (r) => r.y2024)),
                muted(NR),
              ]}
              dense
            />
          </ChartCard>
        </div>
        <div className="mt-4 space-y-3">
          <Note title="2025:">{ca.note2025}</Note>
          <Note tone="warn" title="Not reported:">
            The sources give no 2025 breakdown by wilayat, reporting facility or sector count —
            only the 2025 total ({countOr(n2025)}) and the MOH / private percentage split. These cells
            are shown as “Not reported”, not as zero. The wilayat table sums to the public-sector
            count; the facility table includes private hospitals. The 2023 facility rows sum to{' '}
            {int(facility2023)}, not the 2023 total of {countOr(n2023)}, as supplied in the source;
            the difference is not allocated.
          </Note>
        </div>
      </div>
      <section
        aria-labelledby="ca-programme-challenges"
        className="rounded-2xl border border-navy/20 bg-surface p-6 shadow-sm dark:border-teal/40"
      >
        <h2 id="ca-programme-challenges" className="text-xl font-semibold text-heading dark:text-white">
          Programme Challenges
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink">
          Congenital anomaly cases are not being reported through Tarassud by physicians in private hospitals within the governorate.
        </p>
      </section>
    </div>
  )
}
