import { useState } from 'react'
import { Milk } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import {
  NOT_REPORTED,
  YEAR_OPTIONS,
  ebRateByAge,
  feedingByYear,
  missingYears,
  pctCell,
  ratio,
  yearCell,
  yearSeries,
  type Year,
} from '../data/years/childrenC'
import { C } from '../lib/theme'
import { pct } from '../lib/format'

const ebBirth = ebRateByAge[0]
const eb6 = ebRateByAge.find((m) => m.milestone === '6 months')
const gap = missingYears(ebRateByAge)

/** Bottle use at the first and last age in a year's feeding returns. */
function bottleRange(y: Year): string | null {
  const rows = feedingByYear[y]
  const first = rows?.[0]
  const last = rows?.[rows.length - 1]
  if (!first || !last) return null
  const a = ratio(first.bottle, first.total)
  const b = ratio(last.bottle, last.total)
  return a === null || b === null ? null : `Bottle use rises from ${pct(a, 0)} at ${first.milestone.toLowerCase()} to ${pct(b, 0)} by ${last.milestone}.`
}

const muted = (v: string) => (v === NOT_REPORTED ? <span className="text-ink/50">{v}</span> : v)

/** Placeholder for a year the source does not provide. */
function NotReported({ year, detail }: { year: Year; detail: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-line/20 px-6 text-center text-body text-ink/65">
      <p>
        <span className="font-semibold text-heading">{year}: {NOT_REPORTED}.</span> {detail}
      </p>
    </div>
  )
}

export default function BreastFeedingBfhi() {
  const [feedYear, setFeedYear] = useState<Year>('2025')
  const feeding = feedingByYear[feedYear]

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionTitle
        icon={Milk}
        title="Breast Feeding & BFHI"
        subtitle="Programme capacity and training · infant-feeding indicators for 2023, 2024 & 2025 (2023 and 2024 not reported in the source)"
      />

      <section aria-label="Breastfeeding programme capacity and training">
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-3.5">
          {[
            { label: 'Breastfeeding specialists', value: 7, detail: '3 at governorate level · 4 at Sohar Hospital' },
            { label: 'Nurse-led courses conducted', value: 6, detail: '3 by Sohar Hospital · 3 by Saham Hospital' },
            { label: 'WHO national assessors', value: 3, detail: null },
          ].map(({ label, value, detail }) => (
            <div key={label} className="card min-w-0 p-4 sm:p-5">
              <dt className="text-caption font-medium text-ink/75">{label}</dt>
              <dd className="mt-3 text-3xl font-medium tabular-nums text-heading dark:text-glow">{value}</dd>
              {detail && <dd className="mt-2 text-caption text-ink/65">{detail}</dd>}
            </div>
          ))}
        </dl>
      </section>

      <div className="max-w-sm">
        <KpiCard
          label="Exclusive Breastfeeding @ Birth (2025)"
          value={pctCell(ebBirth?.y2025 ?? null)}
          icon={Milk}
          accent="gold"
          hint={`${pctCell(eb6?.y2025 ?? null)} at 6 months · ${gap}: ${NOT_REPORTED.toLowerCase()}`}
        />
      </div>

      <div>
        <SectionTitle
          icon={Milk}
          title="Infant Feeding Pattern"
          subtitle="Breastfeeding, formula & complementary feeding by child age · 2023, 2024 & 2025"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="Exclusive Breastfeeding Rate by Age"
            subtitle="% exclusively breastfed · birth → 18 months · 2023, 2024 & 2025"
            footnote={
              ebBirth?.y2025 != null && eb6?.y2025 != null
                ? `2025 shows the classic decline: ${pct(ebBirth.y2025)} at birth, ${pct(eb6.y2025)} by 6 months as complementary foods begin. ${gap}: not reported in the source.`
                : undefined
            }
          >
            <TrendChart
              data={ebRateByAge}
              xKey="milestone"
              yDomain={[0, 100]}
              unit="%"
              series={yearSeries(ebRateByAge)}
            />
          </ChartCard>
          <ChartCard
            title={`Feeding Composition by Age (${feedYear})`}
            subtitle="Children by feeding type (count)"
            action={<Segmented label="Year" options={YEAR_OPTIONS} value={feedYear} onChange={setFeedYear} />}
            footnote={
              feeding
                ? `Mixed = breast + formula + complementary foods. ${bottleRange(feedYear) ?? ''}`.trim()
                : undefined
            }
          >
            {feeding ? (
              <ComparisonBars
                data={feeding}
                xKey="milestone"
                stacked
                series={[
                  { key: 'eb', name: 'Exclusive BF', color: C.teal },
                  { key: 'pb', name: 'Predominant BF', color: C.azure },
                  { key: 'formula', name: 'Formula only', color: C.gold },
                  { key: 'mixed', name: 'Mixed / complementary', color: C.navy },
                ]}
              />
            ) : (
              <NotReported year={feedYear} detail="The source gives feeding returns by child age for 2025 only." />
            )}
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Exclusive Breastfeeding by Age (2023–2025)" subtitle="Rate per year; counts for 2025">
        <DataTable
          columns={[
            { label: 'Child Age' },
            { label: '2023 Rate', align: 'right' },
            { label: '2024 Rate', align: 'right' },
            { label: '2025 Rate', align: 'right' },
            { label: 'Exclusively BF 2025', align: 'right' },
            { label: 'Total Infants 2025', align: 'right' },
          ]}
          rows={ebRateByAge.map((m) => [
            m.milestone,
            muted(pctCell(m.y2023)),
            muted(pctCell(m.y2024)),
            muted(pctCell(m.y2025)),
            yearCell(m.eb),
            yearCell(m.total),
          ])}
          dense
        />
        <div className="mt-3 space-y-3">
          <Note title="2025:">
            Figures are summed across all health-centre returns in the six wilayat. EB = exclusively
            breastfed; BF = breastfed.
          </Note>
          <Note title="Not reported:" tone="warn">
            The source data hold no infant-feeding figures for {gap}. Those years are shown as “Not
            reported” rather than zero.
          </Note>
        </div>
      </ChartCard>
    </div>
  )
}
