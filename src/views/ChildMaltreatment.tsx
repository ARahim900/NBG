import { useState } from 'react'
import { AlertTriangle, Baby, MapPin, ShieldAlert, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { mt } from '../data/nbg'
import { mt2025 } from '../data/wch2025'
import {
  NOT_REPORTED,
  YEAR_OPTIONS,
  mtByAge,
  mtByWilayat,
  mtMonthly,
  mtTopType,
  mtTopWilayat,
  mtTotals,
  mtTypePct,
  pctCell,
  yearCell,
  yearSeries,
  type Year,
} from '../data/years/childrenC'
import { C, SERIES } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const n2023 = mtTotals.y2023
const n2024 = mtTotals.y2024
const n2025 = mtTotals.y2025 ?? mt2025.total
const share2025 = (v: number) => (v / mt2025.total) * 100

const top2023 = mtTopWilayat('y2023')
const top2024 = mtTopWilayat('y2024')
const top2025 = mtTopWilayat('y2025')
const topType2024 = mtTopType('y2024')
const topType2025 = mtTopType('y2025')

const under5 = mt2025.byAge.filter((a) => a.band === 'Under 1' || a.band === '1–4').reduce((s, a) => s + a.count, 0)
const male = mt2025.bySex.find((s) => s.sex === 'Male')?.count ?? 0
const female = mt2025.bySex.find((s) => s.sex === 'Female')?.count ?? 0

const typeSeries = mt2025.types.map((t, i) => ({ key: t, name: t, color: SERIES[i] }))

/** Sum of a year column; null when no wilayat reports that year. */
const columnTotal = (k: 'y2023' | 'y2024' | 'y2025'): number | null =>
  mtByWilayat.some((r) => r[k] !== null) ? mtByWilayat.reduce((a, r) => a + (r[k] ?? 0), 0) : null

/** Source spells one polyclinic without spaces; show it like its neighbours. */
const institutionName = (name: string): string =>
  name === 'AsSuwayq Extended HealthCenter(PolyClinic)' ? 'As Suwayq Extended Health Center (PolyClinic)' : name

const signedPct = (v: number | null) => (v === null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(0)}%`)
const muted = (v: string) => (v === NOT_REPORTED ? <span className="text-ink/50">{v}</span> : v)

/** Placeholder for a year the source does not break down. */
function NotReported({ year, detail }: { year: Year; detail: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-line/20 px-6 text-center text-body text-ink/65">
      <p>
        <span className="font-semibold text-heading">{year}: {NOT_REPORTED}.</span> {detail}
      </p>
    </div>
  )
}

export default function ChildMaltreatment() {
  const [typeYear, setTypeYear] = useState<Year>('2025')

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={ShieldAlert}
        title="Child Maltreatment Notifications"
        subtitle="2019–2025 trend · 2023–2025 by wilayat · type split 2024–2025 · 2025 by month, age and reporting institution (earlier years not reported)"
      />

      <section aria-label="Child maltreatment programme training">
        <dl className="grid grid-cols-2 gap-3.5">
          {[
            { label: 'Courses conducted', value: 1 },
            { label: 'Master trainers', value: 3 },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 sm:p-5">
              <dt className="text-caption font-medium text-ink/75">{label}</dt>
              <dd className="mt-3 text-3xl font-medium tabular-nums text-heading">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Notifications (2025)"
          value={int(n2025)}
          icon={ShieldAlert}
          accent="navy"
          delta={n2024 === null ? null : deltaPct(n2025, n2024)}
          deltaTone="neutral"
          hint={`2024: ${yearCell(n2024)} · 2023: ${yearCell(n2023)}`}
        />
        <KpiCard
          label="Highest Wilayat (2025)"
          value={top2025?.wilayat ?? NOT_REPORTED}
          icon={MapPin}
          accent="azure"
          hint={
            top2025
              ? `${int(top2025.value)} (${pct(share2025(top2025.value), 0)}) · 2024: ${top2024 ? `${top2024.wilayat} ${int(top2024.value)}` : NOT_REPORTED} · 2023: ${top2023 ? `${top2023.wilayat} ${int(top2023.value)}` : NOT_REPORTED}`
              : undefined
          }
        />
        <KpiCard
          label="Top Type (2025)"
          value={topType2025?.type ?? NOT_REPORTED}
          icon={AlertTriangle}
          accent="teal"
          hint={
            topType2025
              ? `${pct(topType2025.value)} · 2024: ${topType2024 ? `${topType2024.type} ${pct(topType2024.value)}` : NOT_REPORTED} · 2023: ${NOT_REPORTED.toLowerCase()}`
              : undefined
          }
        />
        <KpiCard
          label="Children Under 5 (2025)"
          value={pct(share2025(under5), 0)}
          icon={Baby}
          accent="gold"
          hint={`${int(under5)} of ${int(mt2025.total)} · ${male} boys, ${female} girls · age not reported for 2023–2024`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          title="Total Notifications Trend"
          subtitle="2019–2025"
          className="xl:col-span-3"
          footnote={`Notifications rose from ${yearCell(n2023)} in 2023 to ${yearCell(n2024)} in 2024 and ${int(n2025)} in 2025. The 2023→2024 rise reflects strengthened reporting and case detection.`}
        >
          <TrendChart
            data={mt.totalTrend}
            xKey="year"
            variant="area"
            unit=""
            series={[{ key: 'value', name: 'Notifications', color: C.navy }]}
          />
        </ChartCard>
        <ChartCard
          title="Maltreatment Type"
          subtitle="% of each year's notifications · 2023, 2024 & 2025"
          className="xl:col-span-2"
          footnote={`2024 shares are the KPI deck's own percentages; 2025 shares are counts over the ${int(mt2025.total)} notifications in the register. The source has no 2023 type split.`}
        >
          <ComparisonBars
            data={mtTypePct}
            xKey="type"
            layout="vertical"
            height={300}
            unit="%"
            categoryWidth={110}
            series={yearSeries(mtTypePct)}
          />
        </ChartCard>
      </div>

      <ChartCard title="Notifications by Wilayat" subtitle="Counts · 2023, 2024 & 2025">
        <ComparisonBars data={mtByWilayat} xKey="wilayat" series={yearSeries(mtByWilayat)} />
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Notifications by Month"
          subtitle="By notification date · 2023, 2024 & 2025"
          footnote="Monthly counts are available for 2025 only; 2023 and 2024 are not reported by month."
        >
          <TrendChart data={mtMonthly} xKey="month" unit="" series={yearSeries(mtMonthly)} />
        </ChartCard>
        <ChartCard
          title="Age of Child"
          subtitle="Years at notification · 2023, 2024 & 2025"
          footnote="Age bands are available for 2025 only; 2023 and 2024 are not reported by age."
        >
          <ComparisonBars data={mtByAge} xKey="band" series={yearSeries(mtByAge)} />
        </ChartCard>
      </div>

      <ChartCard
        title={`Maltreatment Type by Wilayat (${typeYear})`}
        subtitle="Counts"
        action={<Segmented label="Year" options={YEAR_OPTIONS} value={typeYear} onChange={setTypeYear} />}
      >
        {typeYear === '2025' ? (
          <ComparisonBars data={mt2025.byWilayat} xKey="wilayat" stacked series={typeSeries} />
        ) : (
          <NotReported
            year={typeYear}
            detail="The source gives the type split by wilayat for 2025 only."
          />
        )}
      </ChartCard>

      <div>
        <SectionTitle
          icon={Table2}
          title="Detailed Tables"
          subtitle="By wilayat and by type for 2023, 2024 & 2025, and by reporting institution"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Notifications by Wilayat (2023–2025)" subtitle="">
            <DataTable
              dense
              columns={[
                { label: 'Wilayat' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
                { label: '% of 2025', align: 'right' },
                { label: 'Change vs 2024', align: 'right' },
              ]}
              rows={mtByWilayat.map((r) => [
                r.wilayat,
                muted(yearCell(r.y2023)),
                muted(yearCell(r.y2024)),
                muted(yearCell(r.y2025)),
                r.y2025 === null ? '—' : pct(share2025(r.y2025)),
                r.y2025 === null || r.y2024 === null ? '—' : signedPct(deltaPct(r.y2025, r.y2024)),
              ])}
              total={[
                'TOTAL',
                yearCell(columnTotal('y2023')),
                yearCell(columnTotal('y2024')),
                int(mt2025.total),
                '100.0%',
                n2024 === null ? '—' : signedPct(deltaPct(n2025, n2024)),
              ]}
            />
          </ChartCard>
          <ChartCard
            title="Maltreatment Type (2023–2025)"
            subtitle="% of each year's notifications; 2025 count in brackets · shares are rounded to one decimal and may not sum to exactly 100%"
          >
            <DataTable
              dense
              columns={[
                { label: 'Type' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
              ]}
              rows={mtTypePct.map((r) => [
                r.type,
                muted(pctCell(r.y2023)),
                muted(pctCell(r.y2024)),
                r.y2025 === null ? muted(NOT_REPORTED) : `${pct(r.y2025)} (${int(r.count2025)})`,
              ])}
              total={['TOTAL', NOT_REPORTED, '100.0%', `100.0% (${int(mt2025.total)})`]}
            />
          </ChartCard>
        </div>
        <div className="mt-4">
          <ChartCard title="Notifications by Reporting Institution (2023–2025)" subtitle="">
            <DataTable
              dense
              columns={[
                { label: 'Institution' },
                { label: 'Wilayat' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
              ]}
              rows={mt2025.byInstitution.map((r) => [
                institutionName(r.institution),
                r.wilayat,
                muted(NOT_REPORTED),
                muted(NOT_REPORTED),
                int(r.count),
              ])}
              total={['TOTAL', '', NOT_REPORTED, NOT_REPORTED, int(mt2025.total)]}
            />
          </ChartCard>
        </div>
        <div className="mt-3 space-y-3">
          <Note title="Source:">
            2019–2024 totals, 2023–2024 wilayat counts and the 2024 type split are carried over
            from the department's earlier dashboard and KPI deck. 2025 is from {mt2025.source.filename} — {int(mt2025.total)}{' '}
            notifications dated January–December 2025 ({int(mt2025.omani)} Omani children). Only
            totals are published here; no individual records are stored in the dashboard.
          </Note>
          <Note title="Not reported:" tone="warn">
            The source has no 2023 type split, and no month, age, sex, type-by-wilayat or
            reporting-institution breakdown for 2023 or 2024. Those years are shown as “Not
            reported” rather than zero.
          </Note>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="maltreatment-challenges">
          <h3 id="maltreatment-challenges" className="text-title text-heading">Programme Challenges</h3>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-body text-ink/80 marker:text-teal">
            <li>Activating the regional hospital task force committee.</li>
            <li>Ensuring case follow-up by social affairs services.</li>
            <li>No paediatric psychologist for child abuse case follow-up.</li>
          </ul>
        </section>
        <section className="card p-5" aria-labelledby="maltreatment-achievements">
          <h3 id="maltreatment-achievements" className="text-title text-heading">Achievements</h3>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-body text-ink/80 marker:text-teal">
            <li>Three doctors successfully completed the course and received master trainer certification.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
