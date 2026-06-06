import { Activity, Baby, Droplets, MapPin, Stethoscope } from 'lucide-react'
import type { ReactNode } from 'react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, DonutChart, TrendChart } from '../components/charts/Charts'
import { mc, sumBy } from '../data/nbg'
import { C } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const lastV = (a: { value: number }[]): number => a[a.length - 1]?.value ?? 0
const prevV = (a: { value: number }[]): number => a[a.length - 2]?.value ?? 0

const anc2025 = lastV(mc.ancTrend)
const booking2025 = lastV(mc.bookingTrend)
const anaemia2025 = lastV(mc.anaemiaTrend)
const gdm2025 = lastV(mc.gdmTrend)

const deliveryDonut = [
  { name: 'Normal delivery', value: mc.deliveryMethods2024[0]?.count ?? 0, color: C.navy },
  { name: 'Cesarean section', value: mc.deliveryMethods2024[1]?.count ?? 0, color: C.teal },
]

// Combined anaemia + GDM trend (intersect on shared years from 2022)
const riskTrend = mc.anaemiaTrend
  .filter((r) => Number(r.year) >= 2022)
  .map((r) => ({
    year: r.year,
    anaemia: r.value,
    gdm: mc.gdmTrend.find((g) => g.year === r.year)?.value ?? null,
  }))

const w = mc.byWilayat2025
const wTotals = {
  newAnc: sumBy(w, (r) => r.newAnc),
  firstTri: sumBy(w, (r) => r.firstTri),
  anaemia: sumBy(w, (r) => r.anaemia),
  pnc2: sumBy(w, (r) => r.pnc2),
  pnc6: sumBy(w, (r) => r.pnc6),
  pih: sumBy(w, (r) => r.pih),
  infertility: sumBy(w, (r) => r.infertility),
  influenza: sumBy(w, (r) => r.influenza),
}

const fmtCell = (indicator: string, v: number | null): ReactNode => {
  if (v == null) return <span className="text-ink/35">—</span>
  return indicator.includes('%') ? pct(v) : int(v)
}

export default function MaternalCare() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Stethoscope}
        title="Maternal Care — Antenatal, Screening & Delivery"
        subtitle="Indicators across 2023–2025 with 2019–2025 trends and 2025 detail by wilayat"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="ANC Bookings (2025)"
          value={int(anc2025)}
          icon={Stethoscope}
          accent="navy"
          delta={deltaPct(anc2025, prevV(mc.ancTrend))}
          hint="Registered pregnant women"
        />
        <KpiCard
          label="1st-Trimester Booking (2025)"
          value={pct(booking2025)}
          icon={Activity}
          accent="azure"
          delta={deltaPct(booking2025, prevV(mc.bookingTrend))}
          hint="Booked within first trimester"
        />
        <KpiCard
          label="Anaemia in Pregnancy (2025)"
          value={pct(anaemia2025)}
          icon={Droplets}
          accent="good"
          invertDelta
          delta={deltaPct(anaemia2025, prevV(mc.anaemiaTrend))}
          hint="Lower is better"
        />
        <KpiCard
          label="Gestational Diabetes (2025)"
          value={pct(gdm2025)}
          icon={Baby}
          accent="gold"
          invertDelta
          delta={deltaPct(gdm2025, prevV(mc.gdmTrend))}
          hint="GDM prevalence"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="ANC Booking Trend"
          subtitle="Registered pregnant women · 2019–2025"
        >
          <TrendChart
            data={mc.ancTrend}
            xKey="year"
            variant="area"
            unit=""
            series={[{ key: 'value', name: 'ANC bookings', color: C.navy }]}
          />
        </ChartCard>
        <ChartCard
          title="1st-Trimester Booking %"
          subtitle="Early antenatal registration · 2019–2025"
          footnote="Steady improvement from 81.2% (2019) to 96.0% (2025)."
        >
          <TrendChart
            data={mc.bookingTrend}
            xKey="year"
            variant="area"
            yDomain={[70, 100]}
            unit="%"
            series={[{ key: 'value', name: '1st trimester', color: C.azure }]}
          />
        </ChartCard>
        <ChartCard
          title="Anaemia & Gestational Diabetes"
          subtitle="% of pregnancies · 2022–2025"
        >
          <TrendChart
            data={riskTrend}
            xKey="year"
            yDomain={[0, 40]}
            unit="%"
            series={[
              { key: 'anaemia', name: 'Anaemia', color: C.alert },
              { key: 'gdm', name: 'GDM', color: C.gold },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Delivery Methods (2024)"
          subtitle="Normal vs cesarean"
          footnote="957 deliveries (11.2%) occurred outside a health facility."
        >
          <DonutChart data={deliveryDonut} />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={MapPin}
          title="2025 Maternal Care by Wilayat"
          subtitle="Jan–Dec totals summed across health centres"
        />
        <ChartCard
          title="ANC Registration & 1st-Trimester Booking by Wilayat (2025)"
          subtitle="New registrations vs first-trimester bookings"
        >
          <ComparisonBars
            data={w}
            xKey="wilayat"
            series={[
              { key: 'newAnc', name: 'New ANC reg.', color: C.navy },
              { key: 'firstTri', name: '1st trimester', color: C.teal },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="2025 Maternal Care Indicators by Wilayat" subtitle="">
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
            rows={w.map((r) => [
              r.wilayat,
              int(r.newAnc),
              int(r.firstTri),
              int(r.anaemia),
              int(r.pnc2),
              int(r.pnc6),
              int(r.pih),
              int(r.infertility),
              int(r.influenza),
            ])}
            total={[
              'GOVERNORATE',
              int(wTotals.newAnc),
              int(wTotals.firstTri),
              int(wTotals.anaemia),
              int(wTotals.pnc2),
              int(wTotals.pnc6),
              int(wTotals.pih),
              int(wTotals.infertility),
              int(wTotals.influenza),
            ]}
            dense
          />
        </ChartCard>

        <ChartCard title="Maternal Care Indicators (2023 / 2024 / 2025)" subtitle="Blank = not reported that year">
          <DataTable
            columns={[
              { label: 'Indicator' },
              { label: '2023', align: 'right' },
              { label: '2024', align: 'right' },
              { label: '2025', align: 'right' },
            ]}
            rows={mc.indicators.map((r) => [
              r.indicator,
              fmtCell(r.indicator, r.y2023),
              fmtCell(r.indicator, r.y2024),
              fmtCell(r.indicator, r.y2025),
            ])}
            dense
          />
          <div className="mt-3">
            <Note title="Source note:">
              2025 antenatal figures (1st-trimester bookings, total ANC visits,
              anaemia cases) are taken from the North Batinah MCH&nbsp;2025
              workbook — 28 health centres across the 6 wilayat — and reconcile
              with the by-wilayat table above. HIV &amp; syphilis &ldquo;tested&rdquo;
              2025 are derived from the 100% screening coverage recorded that year.
              2025 delivery, congenital-screening positives (HIV/syphilis),
              teenage-pregnancy and out-of-facility delivery figures are not in
              the antenatal workbook and remain blank pending the maternity/lab
              source. ANC 2025 is 12,433 (deck headline) vs 12,488 (sum of
              centres); ANC 2024 12,753 (web) / 12,754 (deck); anaemia 2024
              34.0% / 34.4%.
            </Note>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
