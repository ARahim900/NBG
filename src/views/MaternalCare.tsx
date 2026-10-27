import { Activity, Baby, Droplets, MapPin, Stethoscope } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { mc } from '../data/nbg'
import {
  YEAR_OPTIONS,
  mcByWilayat,
  mcDeliveries,
  priorYearsHint,
  ukLabel,
  type Year,
} from '../data/years/women'
import { METRIC, YEAR_COLORS } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const lastV = (a: { value: number }[]): number => a[a.length - 1]?.value ?? 0
const prevV = (a: { value: number }[]): number => a[a.length - 2]?.value ?? 0

const anc2025 = lastV(mc.ancTrend)
const booking2025 = lastV(mc.bookingTrend)
const anaemia2025 = lastV(mc.anaemiaTrend)
const gdm2025 = lastV(mc.gdmTrend)

const pct1 = (v: number): string => pct(v)

const outside2024 = mc.deliveryMethods2024.find((r) => r.method === 'Outside Health Facility')

// Combined anaemia + GDM trend (intersect on shared years from 2022)
const riskTrend = mc.anaemiaTrend
  .filter((r) => Number(r.year) >= 2022)
  .map((r) => ({
    year: r.year,
    anaemia: r.value,
    gdm: mc.gdmTrend.find((g) => g.year === r.year)?.value ?? null,
  }))

const YEAR_SERIES = [
  { key: 'y2023', name: '2023', color: YEAR_COLORS['2023'] },
  { key: 'y2024', name: '2024', color: YEAR_COLORS['2024'] },
  { key: 'y2025', name: '2025', color: YEAR_COLORS['2025'] },
]

/** Blank cells read as "no data supplied", never as zero. */
const dash = <span className="text-ink/35">—</span>

const fmtCell = (indicator: string, v: number | null): ReactNode => {
  if (v == null) return dash
  return indicator.includes('%') ? pct(v) : int(v)
}

const intCell = (v: number | null): ReactNode => (v == null ? dash : int(v))

/**
 * 2025 "tested" counts that nbg.json derives from 100% screening coverage ×
 * ANC bookings rather than a reported count; marked † in the indicator table.
 */
const DERIVED_2025 = new Set(['HIV Screening (tested)', 'Syphilis Screening (tested)'])
const cell2025 = (indicator: string, v: number | null): ReactNode =>
  v != null && DERIVED_2025.has(indicator) ? `${int(v)} †` : fmtCell(indicator, v)

export default function MaternalCare() {
  const [year, setYear] = useState<Year>('2025')
  const w = mcByWilayat(year)
  const byWilayat = year === '2025'

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Stethoscope}
        title="Maternal Care — Antenatal, Screening & Delivery"
        subtitle="Indicators for 2023, 2024 and 2025 with 2019–2025 trends; wilayat detail by year"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="ANC Bookings (2025)"
          value={int(anc2025)}
          icon={Stethoscope}
          accent="navy"
          delta={deltaPct(anc2025, prevV(mc.ancTrend))}
          hint={priorYearsHint(mc.ancTrend, int)}
        />
        <KpiCard
          label="1st-Trimester Booking (2025)"
          value={pct(booking2025)}
          icon={Activity}
          accent="azure"
          delta={deltaPct(booking2025, prevV(mc.bookingTrend))}
          hint={priorYearsHint(mc.bookingTrend, pct1)}
        />
        <KpiCard
          label="Anaemia in Pregnancy (2025)"
          value={pct(anaemia2025)}
          icon={Droplets}
          accent="good"
          deltaTone="down"
          delta={deltaPct(anaemia2025, prevV(mc.anaemiaTrend))}
          hint={`${priorYearsHint(mc.anaemiaTrend, pct1)} · lower is better`}
        />
        <KpiCard
          label="Gestational Diabetes (2025)"
          value={pct(gdm2025)}
          icon={Baby}
          accent="gold"
          deltaTone="down"
          delta={deltaPct(gdm2025, prevV(mc.gdmTrend))}
          hint={`${priorYearsHint(mc.gdmTrend, pct1)} · lower is better`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="ANC Booking Trend"
          subtitle="Registered pregnant women (count) · 2019–2025"
        >
          <TrendChart
            data={mc.ancTrend}
            xKey="year"
            height={300}
            unit=""
            series={[{ key: 'value', name: 'ANC bookings', color: METRIC[0] }]}
          />
        </ChartCard>
        <ChartCard
          title="First-Trimester Booking Rate"
          subtitle="Percentage · 2019–2025 · early antenatal registration"
          footnote="Steady improvement from 81.2% (2019) to 96.0% (2025)."
        >
          <TrendChart
            data={mc.bookingTrend}
            xKey="year"
            height={300}
            unit="%"
            series={[{ key: 'value', name: '1st trimester', color: METRIC[0] }]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Anaemia and Gestational Diabetes"
          subtitle="% of pregnancies · 2022–2025"
        >
          <TrendChart
            data={riskTrend}
            xKey="year"
            height={300}
            yDomain={[0, 40]}
            unit="%"
            series={[
              { key: 'anaemia', name: 'Anaemia', color: METRIC[0] },
              { key: 'gdm', name: 'GDM', color: METRIC[1] },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Deliveries by Method"
          subtitle="Count · 2023, 2024 and 2025 · a missing bar means no data supplied that year"
          footnote={
            outside2024
              ? `2024: ${int(outside2024.count)} deliveries (${pct(outside2024.pct)}) occurred outside a health facility.`
              : undefined
          }
        >
          <ComparisonBars
            data={mcDeliveries}
            xKey="label"
            height={300}
            series={YEAR_SERIES}
          />
          <div className="mt-3">
            <Note title="No data supplied:">
              2025 — no delivery figures in the 2025 antenatal workbook. 2023 —
              normal deliveries and deliveries outside a health facility. In the
              2024 source, normal and caesarean counts together exceed the
              total-deliveries figure; all values are shown as reported.
            </Note>
          </div>
        </ChartCard>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-[16rem] flex-1">
            <SectionTitle
              icon={MapPin}
              title={`${year} Maternal Care by Wilayat`}
              subtitle="Jan–Dec totals summed across health centres · wilayat breakdown reported for 2025 only"
            />
          </div>
          <div className="mb-4">
            <Segmented
              label="Wilayat detail year"
              options={YEAR_OPTIONS}
              value={year}
              onChange={setYear}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <ChartCard
            title={`ANC Registration and First-Trimester Booking by Wilayat (${year})`}
            subtitle={`Count · ${year} · new registrations and first-trimester bookings`}
          >
            {byWilayat ? (
              <ComparisonBars
                data={w.rows}
                xKey="wilayat"
                height={300}
                series={[
                  { key: 'newAnc', name: 'New ANC reg.', color: METRIC[0] },
                  { key: 'firstTri', name: '1st trimester', color: METRIC[1] },
                ]}
              />
            ) : (
              <Note title={`No data supplied by wilayat for ${year}.`}>
                The {year} source gives governorate totals only:{' '}
                {w.total.newAnc == null ? 'no data supplied' : int(w.total.newAnc)} new ANC
                registrations and{' '}
                {w.total.firstTri == null ? 'no data supplied' : int(w.total.firstTri)}{' '}
                first-trimester bookings. The table below shows every wilayat row as
                no data supplied.
              </Note>
            )}
          </ChartCard>

          <ChartCard
            title={`${year} Maternal Care Indicators by Wilayat`}
            subtitle={
              byWilayat
                ? 'Sum of health-centre returns'
                : '— = no data supplied · governorate row from the indicator table'
            }
            footnote={
              byWilayat
                ? undefined
                : `${year} governorate totals: new ANC = registered pregnant women, 1st Tri = first-trimester bookings, anaemia = anaemia cases. No data supplied for PNC, PIH, infertility or influenza in ${year}.`
            }
          >
            <DataTable
              columns={[
                { label: 'Wilayat' },
                { label: 'New ANC', align: 'right' },
                { label: '1st Tri', align: 'right' },
                { label: 'Anaemia', align: 'right' },
                { label: 'PNC 2wk', align: 'right' },
                { label: 'PNC 6wk', align: 'right' },
                { label: 'PIH', align: 'right' },
                { label: 'Infert.', align: 'right' },
                { label: 'Influenza', align: 'right' },
              ]}
              rows={w.rows.map((r) => [
                r.wilayat,
                intCell(r.newAnc),
                intCell(r.firstTri),
                intCell(r.anaemia),
                intCell(r.pnc2),
                intCell(r.pnc6),
                intCell(r.pih),
                intCell(r.infertility),
                intCell(r.influenza),
              ])}
              total={[
                w.total.wilayat,
                intCell(w.total.newAnc),
                intCell(w.total.firstTri),
                intCell(w.total.anaemia),
                intCell(w.total.pnc2),
                intCell(w.total.pnc6),
                intCell(w.total.pih),
                intCell(w.total.infertility),
                intCell(w.total.influenza),
              ]}
              dense
            />
          </ChartCard>
        </div>
      </div>

      <ChartCard
        title="Maternal Care Indicators"
        subtitle="2023, 2024 and 2025 · — = no data supplied that year · † = derived, not a reported count"
      >
        <DataTable
          columns={[
            { label: 'Indicator' },
            { label: '2023', align: 'right' },
            { label: '2024', align: 'right' },
            { label: '2025', align: 'right' },
          ]}
          rows={mc.indicators.map((r) => [
            ukLabel(r.indicator),
            fmtCell(r.indicator, r.y2023),
            fmtCell(r.indicator, r.y2024),
            cell2025(r.indicator, r.y2025),
          ])}
          dense
        />
        <div className="mt-3">
          <Note title="Source note:">
            2025 antenatal figures (1st-trimester bookings, total ANC visits,
            anaemia cases) are taken from the North Batinah MCH&nbsp;2025
            workbook — 28 health centres across the 6 wilayat — and reconcile
            with the by-wilayat table above. &dagger; HIV &amp; syphilis &ldquo;tested&rdquo;
            2025 are derived from the 100% screening coverage recorded that
            year, not a reported count.
            2025 delivery, congenital-screening positives (HIV/syphilis),
            teenage-pregnancy and out-of-facility delivery figures are not in
            the antenatal workbook and remain blank pending the maternity/lab
            source. The KPI cards and trend charts use the KPI-deck series,
            which differs slightly from this table: ANC 2025 12,433 (deck
            headline) vs 12,488 (sum of centres); ANC 2024 12,753 (web) /
            12,754 (deck); 1st-trimester booking 2023 94.4% / 94.5% and 2024
            95.0% / 95.4%; anaemia 2023 34.0% / 33.9% and 2024 34.0% / 34.4%.
          </Note>
        </div>
      </ChartCard>
    </div>
  )
}
