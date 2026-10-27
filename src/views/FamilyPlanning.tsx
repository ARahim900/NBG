import { HeartHandshake, MapPin, Syringe, Table2, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { fp } from '../data/nbg'
import {
  YEAR_OPTIONS,
  fpByWilayat,
  fpIndicators,
  ukLabel,
  priorYearsHint,
  type Year,
} from '../data/years/women'
import { C } from '../lib/theme'
import { cell, deltaPct, int, pct } from '../lib/format'

const lastV = (a: { value: number }[]): number => a[a.length - 1]?.value ?? 0
const prevV = (a: { value: number }[]): number => a[a.length - 2]?.value ?? 0

const birthSpacing2025 = lastV(fp.birthSpacingTrend)
const iucd2025 = lastV(fp.iucdTrend)
const implanon2025 = lastV(fp.implanonTrend)
const premarital2025 = lastV(fp.premaritalTrend)

const pct1 = (v: number): string => pct(v)

// Merged contraceptive trends
const contraTrend = fp.iucdTrend.map((r) => ({
  year: r.year,
  iucd: r.value,
  implanon: fp.implanonTrend.find((i) => i.year === r.year)?.value ?? null,
}))

/** Blank cells read as "not reported", never as zero. */
const dash = <span className="text-ink/35">—</span>
const intCell = (v: number | null): ReactNode => (v == null ? dash : int(v))

export default function FamilyPlanning() {
  const [year, setYear] = useState<Year>('2025')
  const c = fpByWilayat(year)
  const byWilayat = year === '2025'

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Users}
        title="Family Planning & 5-Year-Plan Indicators"
        subtitle="Contraceptive uptake & premarital screening — 2023, 2024 and 2025 indicators with 2018–2025 trends"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Birth-Spacing Cases (2025)"
          value={int(birthSpacing2025)}
          icon={Users}
          accent="navy"
          delta={deltaPct(birthSpacing2025, prevV(fp.birthSpacingTrend))}
          hint={priorYearsHint(fp.birthSpacingTrend, int)}
        />
        <KpiCard
          label="IUCD Users (2025)"
          value={pct(iucd2025)}
          icon={HeartHandshake}
          accent="azure"
          delta={deltaPct(iucd2025, prevV(fp.iucdTrend))}
          hint={priorYearsHint(fp.iucdTrend, pct1)}
        />
        <KpiCard
          label="Implanon Users (2025)"
          value={pct(implanon2025)}
          icon={Syringe}
          accent="teal"
          delta={deltaPct(implanon2025, prevV(fp.implanonTrend))}
          hint={priorYearsHint(fp.implanonTrend, pct1)}
        />
        <KpiCard
          label="Premarital Screening (2025)"
          value={int(premarital2025)}
          icon={HeartHandshake}
          accent="gold"
          delta={deltaPct(premarital2025, prevV(fp.premaritalTrend))}
          hint={`Couples screened · ${priorYearsHint(fp.premaritalTrend, int)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Birth-Spacing Registered Cases"
          subtitle="2019–2025"
        >
          <TrendChart
            data={fp.birthSpacingTrend}
            xKey="year"
            variant="area"
            unit=""
            height={260}
            series={[{ key: 'value', name: 'Cases', color: C.teal }]}
          />
        </ChartCard>
        <ChartCard
          title="IUCD vs Implanon Uptake"
          subtitle="% of contraceptive users · 2018–2025"
        >
          <TrendChart
            data={contraTrend}
            xKey="year"
            unit="%"
            height={260}
            series={[
              { key: 'iucd', name: 'IUCD', color: C.navy },
              { key: 'implanon', name: 'Implanon', color: C.azure },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Premarital Screening"
          subtitle="Couples screened · 2019–2025"
        >
          <ComparisonBars
            data={fp.premaritalTrend}
            xKey="year"
            unit=""
            height={260}
            series={[{ key: 'value', name: 'Screened', color: C.azure }]}
            showLegend={false}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={MapPin}
          title={`${year} Contraceptive Uptake by Wilayat`}
          subtitle="IUCD, Implanon & birth-spacing first visits · wilayat breakdown reported for 2025 only"
        />
        <ChartCard
          title={`Contraceptive Method Uptake by Wilayat (${year})`}
          subtitle="Counts per method"
          action={
            <Segmented
              label="Contraceptive detail year"
              options={YEAR_OPTIONS}
              value={year}
              onChange={setYear}
            />
          }
        >
          {byWilayat ? (
            <ComparisonBars
              data={c.rows}
              xKey="wilayat"
              series={[
                { key: 'birthSpacing', name: 'Birth spacing', color: C.navy },
                { key: 'implanon', name: 'Implanon', color: C.azure },
                { key: 'iucd', name: 'IUCD', color: C.teal },
              ]}
            />
          ) : (
            <Note title={`${year} not reported by wilayat.`}>
              The {year} source gives a governorate birth-spacing total only (
              {c.total.birthSpacing == null ? 'not reported' : int(c.total.birthSpacing)}{' '}
              cases). IUCD and Implanon counts are not reported for {year}; the
              table below keeps every wilayat row as not reported.
            </Note>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title={`Contraceptive Uptake by Wilayat (${year})`}
        subtitle={
          byWilayat
            ? 'Sum of health-centre returns'
            : '— = not reported · governorate birth spacing from the 2019–2025 trend'
        }
        footnote={
          byWilayat
            ? 'The 2025 birth-spacing total equals the 2025 value of the birth-spacing trend above.'
            : undefined
        }
      >
        <DataTable
          columns={[
            { label: 'Wilayat' },
            { label: 'IUCD', align: 'right' },
            { label: 'Implanon', align: 'right' },
            { label: 'Birth Spacing', align: 'right' },
          ]}
          rows={c.rows.map((r) => [
            r.wilayat,
            intCell(r.iucd),
            intCell(r.implanon),
            intCell(r.birthSpacing),
          ])}
          total={[
            c.total.wilayat,
            intCell(c.total.iucd),
            intCell(c.total.implanon),
            intCell(c.total.birthSpacing),
          ]}
          dense
        />
      </ChartCard>

      <div>
        <SectionTitle
          icon={Table2}
          title="Five-Year-Plan Indicators"
          subtitle="Service readiness & screening · 2023, 2024 and 2025"
        />
        <ChartCard
          title="Family Planning / 5-Year-Plan Indicators (2023 / 2024 / 2025)"
          subtitle="— = not reported that year"
        >
          <DataTable
            columns={[
              { label: 'Indicator' },
              { label: '2023', align: 'right' },
              { label: '2024', align: 'right' },
              { label: '2025', align: 'right' },
            ]}
            rows={fpIndicators.map((r) => [
              ukLabel(r.indicator),
              cell(r.y2023),
              cell(r.y2024),
              r.y2025 == null ? dash : cell(r.y2025),
            ])}
            dense
          />
          <div className="mt-3">
            <Note title="Not reported:">
              None of the 2025 source files gives these five-year-plan
              indicators, so the 2025 column is blank. &ldquo;N/A&rdquo; is the
              source&rsquo;s own entry for 2023 and 2024. HIV and syphilis
              positives match the Maternal Care table. Teenage births appear here
              as 125 in 2024, while the Maternal Care table lists teenage
              pregnancy as 125 in 2023; both are kept as the sources give them.
            </Note>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
