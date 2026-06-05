import { HeartHandshake, MapPin, Syringe, Table2, Users } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { fp, sumBy } from '../data/nbg'
import { C } from '../lib/theme'
import { cell, deltaPct, int, pct } from '../lib/format'

const lastV = (a: { value: number }[]): number => a[a.length - 1]?.value ?? 0
const prevV = (a: { value: number }[]): number => a[a.length - 2]?.value ?? 0

const birthSpacing2025 = lastV(fp.birthSpacingTrend)
const iucd2025 = lastV(fp.iucdTrend)
const implanon2025 = lastV(fp.implanonTrend)
const premarital2025 = lastV(fp.premaritalTrend)

// Merged contraceptive trends
const contraTrend = fp.iucdTrend.map((r) => ({
  year: r.year,
  iucd: r.value,
  implanon: fp.implanonTrend.find((i) => i.year === r.year)?.value ?? null,
}))

const cTot = {
  iucd: sumBy(fp.contraceptive2025, (r) => r.iucd),
  implanon: sumBy(fp.contraceptive2025, (r) => r.implanon),
  birthSpacing: sumBy(fp.contraceptive2025, (r) => r.birthSpacing),
}

export default function FamilyPlanning() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Users}
        title="Family Planning & 5-Year-Plan Indicators"
        subtitle="Contraceptive uptake & premarital screening — 2023/2024 indicators with 2018–2025 trends"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="Birth-Spacing Cases (2025)"
          value={int(birthSpacing2025)}
          icon={Users}
          accent="navy"
          delta={deltaPct(birthSpacing2025, prevV(fp.birthSpacingTrend))}
          hint="Registered birth-spacing users"
        />
        <KpiCard
          label="IUCD Users (2025)"
          value={pct(iucd2025)}
          icon={HeartHandshake}
          accent="azure"
          delta={deltaPct(iucd2025, prevV(fp.iucdTrend))}
          hint="Share choosing IUCD"
        />
        <KpiCard
          label="Implanon Users (2025)"
          value={pct(implanon2025)}
          icon={Syringe}
          accent="teal"
          delta={deltaPct(implanon2025, prevV(fp.implanonTrend))}
          hint="Share choosing the implant"
        />
        <KpiCard
          label="Premarital Screening (2025)"
          value={int(premarital2025)}
          icon={HeartHandshake}
          accent="gold"
          delta={deltaPct(premarital2025, prevV(fp.premaritalTrend))}
          hint="Couples screened"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Birth-Spacing Registered Cases"
          subtitle="2019–2025"
        >
          <TrendChart
            data={fp.birthSpacingTrend}
            xKey="year"
            variant="area"
            unit=""
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
            series={[{ key: 'value', name: 'Screened', color: C.azure }]}
            showLegend={false}
          />
        </ChartCard>
      </div>

      <div>
        <SectionTitle
          icon={MapPin}
          title="2025 Contraceptive Uptake by Wilayat"
          subtitle="IUCD, Implanon & birth-spacing first visits"
        />
        <ChartCard
          title="Contraceptive Method Uptake by Wilayat (2025)"
          subtitle="Counts per method"
        >
          <ComparisonBars
            data={fp.contraceptive2025}
            xKey="wilayat"
            series={[
              { key: 'birthSpacing', name: 'Birth spacing', color: C.navy },
              { key: 'implanon', name: 'Implanon', color: C.azure },
              { key: 'iucd', name: 'IUCD', color: C.teal },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard title="Contraceptive Uptake by Wilayat (2025)" subtitle="">
        <DataTable
          columns={[
            { label: 'Wilayat' },
            { label: 'IUCD', align: 'right' },
            { label: 'Implanon', align: 'right' },
            { label: 'Birth Spacing', align: 'right' },
          ]}
          rows={fp.contraceptive2025.map((r) => [
            r.wilayat,
            int(r.iucd),
            int(r.implanon),
            int(r.birthSpacing),
          ])}
          total={[
            'GOVERNORATE',
            int(cTot.iucd),
            int(cTot.implanon),
            int(cTot.birthSpacing),
          ]}
          dense
        />
      </ChartCard>

      <div>
        <SectionTitle
          icon={Table2}
          title="Five-Year-Plan Indicators"
          subtitle="Service readiness & screening · 2023 vs 2024"
        />
        <ChartCard title="Family Planning / 5-Year-Plan Indicators (2023 / 2024)" subtitle="">
          <DataTable
            columns={[
              { label: 'Indicator' },
              { label: '2023', align: 'right' },
              { label: '2024', align: 'right' },
            ]}
            rows={fp.indicators.map((r) => [
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
