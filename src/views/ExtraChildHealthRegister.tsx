import { useState } from 'react'
import { CalendarCheck, ClipboardList, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { MONTHS, coverage, visits2025, visitsByWilayat, type VisitSheet } from '../data/wch2025'
import { C } from '../lib/theme'
import { int, pct } from '../lib/format'

const { three, four } = visits2025

/** Safe Transport of the Critically Ill Child — programme figures supplied by the department. */
const SAFE_TRANSPORT = [
  { label: 'Workshops conducted', value: 3 },
  { label: 'Master trainers in North Al Batinah Governorate', value: 2 },
]

const cov = (s: VisitSheet['statedTotals']) => coverage(s.clerked, s.target) ?? 0
const fmtCov = (v: number | null) => (v === null ? '—' : pct(v))

const monthly = MONTHS.map((month, i) => ({
  month,
  three: three.monthlyClerked[i],
  four: four.monthlyClerked[i],
}))

const w3 = visitsByWilayat(three)
const w4 = visitsByWilayat(four)
const byWilayat = w3.map((r) => {
  const f = w4.find((x) => x.wilayat === r.wilayat)
  return {
    wilayat: r.wilayat,
    three: Number((coverage(r.clerked, r.target) ?? 0).toFixed(1)),
    four: Number((coverage(f?.clerked ?? 0, f?.target ?? 0) ?? 0).toFixed(1)),
  }
})

type VisitAge = 'three' | 'four'
const AGE_OPTIONS: { value: VisitAge; label: string }[] = [
  { value: 'three', label: '3-year visit' },
  { value: 'four', label: '4-year visit' },
]

export default function ExtraChildHealthRegister() {
  const [age, setAge] = useState<VisitAge>('three')
  const sheet = visits2025[age]

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={ClipboardList}
        title="Extra Child Health Register"
        subtitle="3 & 4-year developmental visits in primary health care and child-health programme activity — North Batinah, 2025"
      />

      <section aria-labelledby="safe-transport-title" className="card p-5">
        <h3 id="safe-transport-title" className="text-title text-heading">
          Safe Transport of the Critically Ill Child
        </h3>
        <dl className="mt-4 grid grid-cols-2 gap-3.5">
          {SAFE_TRANSPORT.map(({ label, value }) => (
            <div key={label} className="rounded-card border border-[rgb(var(--card-border))] p-4">
              <dt className="text-caption font-medium text-ink/75">{label}</dt>
              <dd className="mt-3 text-3xl font-medium tabular-nums text-heading">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="3-Year Visit Coverage"
          value={pct(cov(three.statedTotals))}
          icon={CalendarCheck}
          accent="navy"
          hint={`${int(three.statedTotals.clerked)} of ${int(three.statedTotals.target)} children`}
        />
        <KpiCard
          label="4-Year Visit Coverage"
          value={pct(cov(four.statedTotals))}
          icon={CalendarCheck}
          accent="azure"
          hint={`${int(four.statedTotals.clerked)} of ${int(four.statedTotals.target)} children`}
        />
        <KpiCard
          label="Referred at 3 Years"
          value={int(three.statedTotals.referred)}
          icon={ClipboardList}
          accent="teal"
          hint="As reported — see data notes"
        />
        <KpiCard
          label="Referred at 4 Years"
          value={int(four.statedTotals.referred)}
          icon={ClipboardList}
          accent="gold"
          hint="As reported — see data notes"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Visits by Month (2025)" subtitle="Children seen at the 3 and 4-year visits, all institutions">
          <TrendChart
            data={monthly}
            xKey="month"
            unit=""
            series={[
              { key: 'three', name: '3-year visit', color: C.navy },
              { key: 'four', name: '4-year visit', color: C.azure },
            ]}
          />
        </ChartCard>
        <ChartCard title="Coverage by Wilayat (2025)" subtitle="Visits as % of the target cohort">
          <ComparisonBars
            data={byWilayat}
            xKey="wilayat"
            unit="%"
            series={[
              { key: 'three', name: '3-year visit', color: C.navy },
              { key: 'four', name: '4-year visit', color: C.azure },
            ]}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle icon={Table2} title="Visits by Health Institution (2025)" subtitle="Target cohort, children seen and referrals" />
        <ChartCard
          title={`${age === 'three' ? '3' : '4'}-Year Developmental Visit by Institution`}
          subtitle="Grouped by wilayat, north to south"
          action={<Segmented label="Visit" options={AGE_OPTIONS} value={age} onChange={setAge} />}
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
              fmtCov(coverage(sheet.statedTotals.clerked, sheet.statedTotals.target)),
              int(sheet.statedTotals.referred),
            ]}
          />
          <div className="mt-3 space-y-3">
            <Note title="Source:">
              {visits2025.source.filename}. Figures are the institution totals reported in the
              workbook; coverage above 100% and the items below are shown as reported, not corrected.
            </Note>
            {sheet.flags.length > 0 && (
              <details className="rounded-xl border border-warn/30 bg-warn/[0.08] px-3.5 py-3 text-xs leading-relaxed text-[#7a5a12] dark:text-warn">
                <summary className="cursor-pointer font-bold">
                  Data notes for the {age === 'three' ? '3' : '4'}-year sheet ({sheet.flags.length}) — to verify with the source
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {sheet.flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
