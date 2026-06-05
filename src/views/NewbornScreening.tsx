import {
  Baby,
  CalendarCheck,
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
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { fp } from '../data/nbg'
import { C } from '../lib/theme'
import { cell, int, pct } from '../lib/format'

/** Governorate newborn-screening figure by metric name (2025). */
const nb = (prefix: string): number =>
  fp.newborn2025.find((r) => r.metric.startsWith(prefix))?.value ?? 0

const liveBirths = nb('Total Live Births')
const tshScreened = nb('Screened for Congenital')
const tshCoverage = nb('TSH Screening Coverage')
const cordHigh = nb('Initial cord')
const confirmedCH = nb('Confirmed Congenital')
const hearingScreened = nb('Neonatal Hearing Screened')
const hearingCoverage = nb('Hearing Screening Coverage')

const v3 = fp.visitCoverage2025.find((r) => r.visit.startsWith('Three'))
const v4 = fp.visitCoverage2025.find((r) => r.visit.startsWith('Four'))

// Hearing referrals & TSH-positive counts over time.
const referralsTrend = fp.hearingTrend.map((h) => ({
  year: h.year,
  hearing: h.referred,
  tsh: fp.tshTrend.find((t) => t.year === h.year)?.positive ?? null,
}))

export default function NewbornScreening() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Stethoscope}
        title="Newborn & Developmental Screening"
        subtitle="Congenital hypothyroidism (TSH), neonatal hearing & 3–4-year developmental visits — North Batinah, 2025"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="TSH Screening Coverage (2025)"
          value={pct(tshCoverage)}
          icon={Baby}
          accent="navy"
          hint={`${int(tshScreened)} of ${int(liveBirths)} live births`}
        />
        <KpiCard
          label="Confirmed Congenital Hypothyroidism"
          value={int(confirmedCH)}
          icon={TestTubes}
          accent="azure"
          hint={`From ${int(cordHigh)} cord TSH ≥ 40 mIU/L`}
        />
        <KpiCard
          label="Neonatal Hearing Coverage (2025)"
          value={pct(hearingCoverage)}
          icon={Ear}
          accent="teal"
          hint={`${int(hearingScreened)} newborns screened`}
        />
        <KpiCard
          label="3-Year Developmental Visit"
          value={pct(v3?.coverage ?? 0)}
          icon={CalendarCheck}
          accent="gold"
          hint={`${int(v3?.screened ?? 0)} of ${int(v3?.due ?? 0)} due`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Newborn Screening Referrals"
          subtitle="Hearing referrals & TSH-positive results · 2019–2025 (count)"
          footnote="Confirmed congenital hypothyroidism remains rare; rising hearing referrals reflect wider, more sensitive screening."
        >
          <TrendChart
            data={referralsTrend}
            xKey="year"
            unit=""
            series={[
              { key: 'hearing', name: 'Hearing referred', color: C.teal },
              { key: 'tsh', name: 'TSH positive', color: C.gold },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="3 & 4-Year Developmental Visit Coverage (2025)"
          subtitle="Children due vs screened in primary health care"
        >
          <ComparisonBars
            data={fp.visitCoverage2025}
            xKey="visit"
            series={[
              { key: 'due', name: 'Due', color: C.navy },
              { key: 'screened', name: 'Screened', color: C.azure },
            ]}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={Table2}
          title="Screening Records (2025)"
          subtitle="Governorate totals"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Newborn Screening (2025)" subtitle="Governorate totals">
            <DataTable
              columns={[{ label: 'Metric' }, { label: 'Value', align: 'right' }]}
              rows={fp.newborn2025.map((r) => [
                r.metric,
                r.metric.includes('%') ? pct(r.value) : int(r.value),
              ])}
              dense
            />
          </ChartCard>
          <ChartCard title="3 & 4-Year Visit Coverage (2025)" subtitle="">
            <DataTable
              columns={[
                { label: 'Visit' },
                { label: 'Due', align: 'right' },
                { label: 'Screened', align: 'right' },
                { label: 'Coverage', align: 'right' },
              ]}
              rows={fp.visitCoverage2025.map((r) => [
                r.visit,
                int(r.due),
                int(r.screened),
                pct(r.coverage),
              ])}
              total={[
                'TOTAL',
                int((v3?.due ?? 0) + (v4?.due ?? 0)),
                int((v3?.screened ?? 0) + (v4?.screened ?? 0)),
                pct(
                  v3 && v4
                    ? ((v3.screened + v4.screened) / (v3.due + v4.due)) * 100
                    : 0,
                ),
              ]}
              dense
            />
            <div className="mt-3">
              <Note title="2025:">{fp.note2025}</Note>
            </div>
          </ChartCard>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={ClipboardList}
          title="Children's Health — Service Readiness"
          subtitle="Five-year-plan newborn, Down-syndrome & autism indicators · 2023 vs 2024"
        />
        <ChartCard title="Child-Health 5-Year-Plan Indicators (2023 / 2024)" subtitle="">
          <DataTable
            columns={[
              { label: 'Indicator' },
              { label: '2023', align: 'right' },
              { label: '2024', align: 'right' },
            ]}
            rows={fp.childIndicators.map((r) => [
              r.indicator,
              cell(r.y2023),
              cell(r.y2024),
            ])}
            dense
          />
        </ChartCard>
      </div>
    </div>
  )
}
