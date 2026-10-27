import { Activity, Apple, Baby, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import { ComparisonBars } from '../components/charts/Charts'
import { nutrition } from '../data/nutrition'
import {
  NOT_REPORTED,
  malByCategory,
  malByWilayat,
  malTotal,
  missingYears,
  pctCell,
  ratio,
  yearCell,
  yearSeries,
} from '../data/years/childrenC'
import { int, pct } from '../lib/format'

const total2025 = malTotal.y2025 ?? 0
const topCrit = malByCategory.reduce((a, b) => ((b.y2025 ?? 0) > (a.y2025 ?? 0) ? b : a))
const underweight = malByCategory.find((c) => c.criteria === 'Under weight')?.y2025 ?? null
const wasting = malByCategory.find((c) => c.criteria === 'Moderate wasting')?.y2025 ?? null
const gap = missingYears([malTotal])

const muted = (v: string) => (v === NOT_REPORTED ? <span className="text-ink/50">{v}</span> : v)
/** Sum of a year column; null when no row reports that year. */
const colTotal = (rows: { y2023: number | null; y2024: number | null; y2025: number | null }[], k: 'y2023' | 'y2024' | 'y2025') =>
  rows.some((r) => r[k] !== null) ? rows.reduce((a, r) => a + (r[k] ?? 0), 0) : null

export default function ChildNutrition() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Apple}
        title="Child Nutrition"
        subtitle="Malnutrition categories across North Batinah · 2023, 2024 and 2025 (no data supplied for 2023 and 2024)"
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <KpiCard
          label="Malnutrition Cases (2025)"
          value={int(total2025)}
          icon={Activity}
          accent="navy"
          hint={`All categories, all centres · ${gap}: ${NOT_REPORTED.toLowerCase()}`}
        />
        <KpiCard
          label="Largest Category (2025)"
          value={topCrit.label}
          icon={Activity}
          accent="azure"
          hint={`${yearCell(topCrit.y2025)} cases · ${gap}: ${NOT_REPORTED.toLowerCase()}`}
        />
        <KpiCard
          label="Underweight Children (2025)"
          value={yearCell(underweight)}
          icon={Baby}
          accent="teal"
          hint={`Weight-for-age below normal · ${gap}: ${NOT_REPORTED.toLowerCase()}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Malnutrition by Category"
          subtitle="Count of cases · 2023, 2024 and 2025"
          footnote={
            wasting !== null && underweight !== null
              ? `In 2025 moderate wasting and underweight together account for ${pct(ratio(wasting + underweight, total2025) ?? 0)} of cases. ${gap}: no data supplied.`
              : undefined
          }
        >
          <ComparisonBars
            data={malByCategory}
            xKey="label"
            layout="vertical"
            height={Math.max(260, 44 * malByCategory.length)}
            categoryWidth={124}
            series={yearSeries(malByCategory)}
          />
        </ChartCard>
        <ChartCard
          title="Malnutrition Cases by Wilayat"
          subtitle="Count of cases, all categories combined · 2023, 2024 and 2025"
          footnote={`${gap}: no data supplied.`}
        >
          <ComparisonBars data={malByWilayat} xKey="wilayat" height={300} series={yearSeries(malByWilayat)} />
        </ChartCard>
      </div>

      <div>
        <SectionTitle icon={Table2} title="Detailed Tables" subtitle="Malnutrition by category and by wilayat · 2023, 2024 and 2025" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Malnutrition by Category (2023–2025)" subtitle="Total cases per year; new and improved for 2025">
            <DataTable
              columns={[
                { label: 'Category' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
                { label: 'New 2025', align: 'right' },
                { label: 'Improved 2025', align: 'right' },
              ]}
              rows={malByCategory.map((c) => [
                c.label,
                muted(yearCell(c.y2023)),
                muted(yearCell(c.y2024)),
                muted(yearCell(c.y2025)),
                int(c.newCases),
                int(c.improved),
              ])}
              total={[
                'TOTAL',
                yearCell(colTotal(malByCategory, 'y2023')),
                yearCell(colTotal(malByCategory, 'y2024')),
                yearCell(colTotal(malByCategory, 'y2025')),
                int(malByCategory.reduce((a, b) => a + b.newCases, 0)),
                int(malByCategory.reduce((a, b) => a + b.improved, 0)),
              ]}
              dense
            />
          </ChartCard>
          <ChartCard title="Malnutrition Cases by Wilayat (2023–2025)" subtitle="All categories combined">
            <DataTable
              columns={[
                { label: 'Wilayat' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
                { label: '% of 2025', align: 'right' },
              ]}
              rows={malByWilayat.map((w) => [
                w.wilayat,
                muted(yearCell(w.y2023)),
                muted(yearCell(w.y2024)),
                muted(yearCell(w.y2025)),
                pctCell(w.y2025 === null ? null : ratio(w.y2025, total2025)),
              ])}
              total={[
                'TOTAL',
                yearCell(colTotal(malByWilayat, 'y2023')),
                yearCell(colTotal(malByWilayat, 'y2024')),
                yearCell(colTotal(malByWilayat, 'y2025')),
                '100.0%',
              ]}
              dense
            />
          </ChartCard>
        </div>
        <div className="mt-3 space-y-3">
          <Note title="Source:">
            2025 figures are summed from the per-health-centre child malnutrition returns for the
            six wilayat ({int(nutrition.malnutritionTotal)} cases in all).
          </Note>
          <Note title="No data supplied:" tone="warn">
            The source data hold no child malnutrition figures for {gap}. Those years are shown as
            “No data supplied” rather than zero; they will fill in once the returns are supplied.
          </Note>
        </div>
      </div>
    </div>
  )
}
