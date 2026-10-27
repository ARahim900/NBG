import { AlertTriangle, Baby, MapPin, ShieldAlert, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { mt } from '../data/nbg'
import { MONTHS, mt2025 } from '../data/wch2025'
import { C, SERIES, YEAR_COLORS } from '../lib/theme'
import { deltaPct, int, pct } from '../lib/format'

const n2025 = mt.totalTrend.find((r) => r.year === '2025')?.value ?? 0
const n2024 = mt.totalTrend.find((r) => r.year === '2024')?.value ?? 0
const share2025 = (v: number) => (v / mt2025.total) * 100

/** 2023–2025 counts per wilayat; 2025 from the notification register. */
const byWilayat = mt.byWilayat.map((r) => ({
  wilayat: r.wilayat,
  y2023: r.y2023,
  y2024: r.y2024,
  y2025: mt2025.byWilayat.find((w) => w.wilayat === r.wilayat)?.count ?? 0,
}))
const topWilayat = byWilayat.reduce((a, b) => (b.y2025 > a.y2025 ? b : a))

/** Type shares: 2024 from the KPI deck, 2025 from the notification register. */
const typeKey = (t: string) => t.toLowerCase().replace(/ abuse$/, '')
const typePct = mt2025.byType.map((t) => ({
  type: t.type,
  y2024: mt.typePct2024.find((r) => typeKey(r.type) === typeKey(t.type))?.y2024 ?? 0,
  y2025: Number(share2025(t.count).toFixed(1)),
}))
const topType = mt2025.byType.reduce((a, b) => (b.count > a.count ? b : a))

const under5 = mt2025.byAge.filter((a) => a.band === 'Under 1' || a.band === '1–4').reduce((s, a) => s + a.count, 0)
const male = mt2025.bySex.find((s) => s.sex === 'Male')?.count ?? 0
const female = mt2025.bySex.find((s) => s.sex === 'Female')?.count ?? 0

const monthly = MONTHS.map((month, i) => ({ month, value: mt2025.byMonth[i] }))
const typeSeries = mt2025.types.map((t, i) => ({ key: t, name: t, color: SERIES[i] }))

const signedPct = (v: number | null) => (v === null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(0)}%`)

export default function ChildMaltreatment() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={ShieldAlert}
        title="Child Maltreatment Notifications"
        subtitle="2019–2025 trend; 2025 notifications by wilayat, type, month, age and reporting institution"
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
          delta={deltaPct(n2025, n2024)}
          deltaTone="neutral"
          hint={`vs ${int(n2024)} in 2024`}
        />
        <KpiCard
          label="Highest Wilayat (2025)"
          value={topWilayat.wilayat}
          icon={MapPin}
          accent="azure"
          hint={`${int(topWilayat.y2025)} notifications (${pct(share2025(topWilayat.y2025), 0)})`}
        />
        <KpiCard
          label="Top Type (2025)"
          value={topType.type}
          icon={AlertTriangle}
          accent="teal"
          hint={`${pct(share2025(topType.count))} of cases`}
        />
        <KpiCard
          label="Children Under 5 (2025)"
          value={pct(share2025(under5), 0)}
          icon={Baby}
          accent="gold"
          hint={`${int(under5)} of ${int(mt2025.total)} · ${male} boys, ${female} girls overall`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          title="Total Notifications Trend"
          subtitle="2019–2025"
          className="xl:col-span-3"
          footnote="The steep 2023→2024 rise (92→195) reflects strengthened reporting and case detection."
        >
          <TrendChart
            data={mt.totalTrend}
            xKey="year"
            variant="area"
            unit=""
            series={[{ key: 'value', name: 'Notifications', color: C.navy }]}
          />
        </ChartCard>
        <ChartCard title="Maltreatment Type" subtitle="% of cases · 2024 vs 2025" className="xl:col-span-2">
          <ComparisonBars
            data={typePct}
            xKey="type"
            layout="vertical"
            height={260}
            unit="%"
            categoryWidth={110}
            series={[
              { key: 'y2024', name: '2024', color: YEAR_COLORS['2024'] },
              { key: 'y2025', name: '2025', color: YEAR_COLORS['2025'] },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard title="Notifications by Wilayat" subtitle="Counts · 2023, 2024 & 2025">
        <ComparisonBars
          data={byWilayat}
          xKey="wilayat"
          series={[
            { key: 'y2023', name: '2023', color: YEAR_COLORS['2023'] },
            { key: 'y2024', name: '2024', color: YEAR_COLORS['2024'] },
            { key: 'y2025', name: '2025', color: YEAR_COLORS['2025'] },
          ]}
        />
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Notifications by Month (2025)" subtitle="By notification date">
          <TrendChart data={monthly} xKey="month" unit="" series={[{ key: 'value', name: 'Notifications', color: C.navy }]} />
        </ChartCard>
        <ChartCard title="Age of Child (2025)" subtitle="Years at notification">
          <ComparisonBars
            data={mt2025.byAge}
            xKey="band"
            series={[{ key: 'count', name: 'Notifications', color: C.azure }]}
            showLegend={false}
          />
        </ChartCard>
      </div>

      <ChartCard title="Maltreatment Type by Wilayat (2025)" subtitle="Counts">
        <ComparisonBars data={mt2025.byWilayat} xKey="wilayat" stacked series={typeSeries} />
      </ChartCard>

      <div>
        <SectionTitle icon={Table2} title="Detailed Tables" subtitle="By wilayat with year-on-year change, and by reporting institution" />
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
              rows={byWilayat.map((r) => [
                r.wilayat,
                int(r.y2023),
                int(r.y2024),
                int(r.y2025),
                pct(share2025(r.y2025)),
                signedPct(deltaPct(r.y2025, r.y2024)),
              ])}
              total={[
                'TOTAL',
                int(byWilayat.reduce((a, r) => a + r.y2023, 0)),
                int(byWilayat.reduce((a, r) => a + r.y2024, 0)),
                int(mt2025.total),
                '100.0%',
                signedPct(deltaPct(n2025, n2024)),
              ]}
            />
          </ChartCard>
          <ChartCard title="Notifications by Reporting Institution (2025)" subtitle="">
            <DataTable
              dense
              columns={[{ label: 'Institution' }, { label: 'Wilayat' }, { label: 'Notifications', align: 'right' }]}
              rows={mt2025.byInstitution.map((r) => [r.institution, r.wilayat, int(r.count)])}
              total={['TOTAL', '', int(mt2025.total)]}
            />
          </ChartCard>
        </div>
        <div className="mt-3">
          <Note title="Source:">
            {mt2025.source.filename} — {int(mt2025.total)} notifications dated January–December 2025
            ({int(mt2025.omani)} Omani children). Only totals are published here; no individual
            records are stored in the dashboard.
          </Note>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="maltreatment-challenges">
          <h3 id="maltreatment-challenges" className="text-title text-heading">Programme Challenges</h3>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-body text-ink/80 marker:text-teal">
            <li>Activating the regional hospital task force committee.</li>
            <li>Ensuring case follow-up by social affairs services.</li>
            <li>No paediatric psychologist is available for child abuse case follow-up.</li>
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
