import { useState } from 'react'
import { Droplets, Pill, ShieldCheck, Table2 } from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, TrendChart } from '../components/charts/Charts'
import { anaemia, anaemiaFollowup } from '../data/nutrition'
import {
  NOT_REPORTED,
  YEAR_OPTIONS,
  anaemiaCountsByYear,
  anaemiaGovByYear,
  anaemiaHeadline,
  anaemiaRateByWilayat,
  followupByYear,
  missingYears,
  pctCell,
  ratio,
  yearCell,
  yearSeries,
  type ScreenAge,
  type Year,
} from '../data/years/childrenC'
import { METRIC, STATUS } from '../lib/theme'
import { int, pct } from '../lib/format'

const g = anaemia.gov
const fu = anaemiaFollowup.gov
const gap = missingYears(anaemiaHeadline)
const gapHint = `${gap}: ${NOT_REPORTED.toLowerCase()}`

const AGE_OPTIONS: { value: ScreenAge; label: string }[] = [
  { value: '9', label: '9 months' },
  { value: '18', label: '18 months' },
]

const prev9 = ratio(g.a9, g.s9)
const prev18 = ratio(g.a18, g.s18)

const muted = (v: string) => (v === NOT_REPORTED ? <span className="text-ink/50">{v}</span> : v)

/** Placeholder for a year the source does not provide. */
function NotReported({ year, detail }: { year: Year; detail: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-body text-ink/65">
      <p>
        <span className="font-semibold text-heading">{year}: {NOT_REPORTED}.</span> {detail}
      </p>
    </div>
  )
}

export default function ChildAnaemia() {
  const [age, setAge] = useState<ScreenAge>('9')
  const [countYear, setCountYear] = useState<Year>('2025')
  const [fuYear, setFuYear] = useState<Year>('2025')
  const [tableYear, setTableYear] = useState<Year>('2025')

  const prevalence = anaemiaRateByWilayat(age, 'prevalence')
  const coverage = anaemiaRateByWilayat(age, 'coverage')
  const counts = anaemiaCountsByYear(age, countYear)
  const followup = followupByYear[fuYear]
  const ageLabel = `${age} months`

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Droplets}
        title="Child Anaemia Screening"
        subtitle="Haemoglobin screening at 9 and 18 months across North Batinah · 2023, 2024 and 2025 (no data supplied for 2023 and 2024)"
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label="9-Month Screening Coverage (2025)"
          value={pctCell(ratio(g.s9, g.t9))}
          icon={ShieldCheck}
          accent="navy"
          hint={`${int(g.s9)} of ${int(g.t9)} target · ${gapHint}`}
        />
        <KpiCard
          label="9-Month Anaemia Prevalence (2025)"
          value={pctCell(prev9)}
          icon={Droplets}
          accent="gold"
          hint={`${int(g.a9)} children anaemic · ${gapHint}`}
        />
        <KpiCard
          label="18-Month Screening Coverage (2025)"
          value={pctCell(ratio(g.s18, g.t18))}
          icon={ShieldCheck}
          accent="azure"
          hint={`${int(g.s18)} of ${int(g.t18)} target · ${gapHint}`}
        />
        <KpiCard
          label="18-Month Anaemia Prevalence (2025)"
          value={pctCell(prev18)}
          icon={Droplets}
          accent="teal"
          hint={`${int(g.a18)} children anaemic · ${gapHint}`}
        />
      </div>

      <ChartCard
        title="Governorate Screening Indicators"
        subtitle="Coverage (% of target screened) and prevalence (% of screened anaemic) · 2023, 2024 and 2025"
        footnote={`${gap}: no data supplied; the bars show 2025 only.`}
      >
        <ComparisonBars data={anaemiaHeadline} xKey="indicator" height={300} unit="%" series={yearSeries(anaemiaHeadline)} />
      </ChartCard>

      <div className="flex flex-wrap items-end gap-4">
        <Segmented label="Screening age" options={AGE_OPTIONS} value={age} onChange={setAge} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title={`Anaemia Prevalence by Wilayat (${ageLabel})`}
          subtitle="% of screened children · 2023, 2024 and 2025"
          footnote={
            prev9 !== null && prev18 !== null
              ? `Governorate 2025: ${pct(prev9)} at 9 months and ${pct(prev18)} at 18 months — prevalence eases as iron-rich complementary feeding is established.`
              : undefined
          }
        >
          <ComparisonBars data={prevalence} xKey="wilayat" height={300} unit="%" series={yearSeries(prevalence)} />
        </ChartCard>
        <ChartCard
          title={`Screening Coverage by Wilayat (${ageLabel})`}
          subtitle="% of target screened · 2023, 2024 and 2025"
          footnote={`${gap}: no data supplied.`}
        >
          <ComparisonBars data={coverage} xKey="wilayat" height={300} unit="%" series={yearSeries(coverage)} />
        </ChartCard>
      </div>

      <ChartCard
        title={`Screened vs Anaemic Children (${ageLabel}, ${countYear})`}
        subtitle={counts ? `Count by wilayat · ${countYear}` : 'Count by wilayat'}
        action={<Segmented label="Year" options={YEAR_OPTIONS} value={countYear} onChange={setCountYear} />}
      >
        {counts ? (
          <ComparisonBars
            data={counts}
            xKey="wilayat"
            height={300}
            series={[
              { key: 'screened', name: 'Screened', color: METRIC[0] },
              { key: 'anaemic', name: 'Anaemic', color: METRIC[1] },
            ]}
          />
        ) : (
          <NotReported year={countYear} detail="The source gives screening counts by wilayat for 2025 only." />
        )}
      </ChartCard>

      <div>
        <SectionTitle
          icon={Table2}
          title="Detailed Tables"
          subtitle="Governorate indicators 2023, 2024 and 2025 · 2025 by wilayat, 9 and 18-month screening"
        />
        <div className="space-y-4">
          <ChartCard title="Governorate Anaemia Indicators (2023–2025)" subtitle="">
            <DataTable
              columns={[
                { label: 'Indicator' },
                { label: '2023', align: 'right' },
                { label: '2024', align: 'right' },
                { label: '2025', align: 'right' },
              ]}
              rows={anaemiaGovByYear.map((r) => {
                const fmt = r.unit === '%' ? pctCell : (v: number | null) => yearCell(v)
                return [r.indicator, muted(fmt(r.v.y2023)), muted(fmt(r.v.y2024)), muted(fmt(r.v.y2025))]
              })}
              dense
            />
          </ChartCard>
          <ChartCard
            title={`Anaemia Screening by Wilayat (${tableYear})`}
            subtitle=""
            action={<Segmented label="Table year" options={YEAR_OPTIONS} value={tableYear} onChange={setTableYear} />}
          >
            {tableYear === '2025' ? (
              <DataTable
                columns={[
                  { label: 'Wilayat' },
                  { label: '9m Target', align: 'right' },
                  { label: '9m Screened', align: 'right' },
                  { label: '9m Anaemic', align: 'right' },
                  { label: '9m %', align: 'right' },
                  { label: '18m Target', align: 'right' },
                  { label: '18m Screened', align: 'right' },
                  { label: '18m Anaemic', align: 'right' },
                  { label: '18m %', align: 'right' },
                ]}
                rows={anaemia.byWilayat.map((w) => [
                  w.wilayat,
                  int(w.t9),
                  int(w.s9),
                  int(w.a9),
                  pctCell(ratio(w.a9, w.s9)),
                  int(w.t18),
                  int(w.s18),
                  int(w.a18),
                  pctCell(ratio(w.a18, w.s18)),
                ])}
                total={[
                  'GOVERNORATE',
                  int(g.t9),
                  int(g.s9),
                  int(g.a9),
                  pctCell(prev9),
                  int(g.t18),
                  int(g.s18),
                  int(g.a18),
                  pctCell(prev18),
                ]}
                dense
              />
            ) : (
              <NotReported year={tableYear} detail="The source gives screening by wilayat for 2025 only." />
            )}
            <div className="mt-3 space-y-3">
              <Note title="Validated:">
                Governorate totals reconcile exactly to the source workbook's own TOTAL row
                (9-month: {int(g.s9)} screened / {int(g.a9)} anaemic; 18-month: {int(g.s18)} /{' '}
                {int(g.a18)}). "%" = anaemic among those screened.
              </Note>
              <Note title="No data supplied:" tone="warn">
                The source data hold no child anaemia screening or follow-up figures for {gap}. Those
                years are shown as “No data supplied” rather than zero. Anaemia in pregnancy (2019–2025)
                is a separate maternal indicator on the Maternal Care page.
              </Note>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ===== Treatment follow-up ===== */}
      <div>
        <SectionTitle
          icon={Pill}
          title="Anaemia Treatment Follow-up"
          subtitle="Iron treatment, 3-month continuation and improvement among anaemic children (9-month cohort) · 2023, 2024 and 2025"
        />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiCard
            label="Anaemic Cases Followed (2025)"
            value={int(fu.cases)}
            icon={Pill}
            accent="navy"
            hint={`On the follow-up register · ${gapHint}`}
          />
          <KpiCard
            label="Received Iron (2025)"
            value={pctCell(ratio(fu.iron, fu.cases))}
            icon={Pill}
            accent="azure"
            hint={`${int(fu.iron)} children treated · ${gapHint}`}
          />
          <KpiCard
            label="Continued Iron 3 Months (2025)"
            value={pctCell(ratio(fu.cont3, fu.iron))}
            icon={Pill}
            accent="teal"
            hint={`${int(fu.cont3)} of those treated · ${gapHint}`}
          />
          <KpiCard
            label="Improved (2025)"
            value={pctCell(ratio(fu.improved, fu.cases))}
            icon={Pill}
            accent="good"
            hint={`${int(fu.improved)} children · ${gapHint}`}
          />
        </div>

        <div className="mt-4">
          <Segmented label="Follow-up year" options={YEAR_OPTIONS} value={fuYear} onChange={setFuYear} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title={`Treatment Cascade by Wilayat (${fuYear})`} subtitle={followup ? `Count of children: cases, on iron and improved · ${fuYear}` : 'Count of children: cases, on iron and improved'}>
            {followup ? (
              <ComparisonBars
                data={followup.byWilayat}
                xKey="wilayat"
                height={300}
                series={[
                  { key: 'cases', name: 'Cases', color: METRIC[0] },
                  { key: 'iron', name: 'On iron', color: METRIC[1] },
                  { key: 'improved', name: 'Improved', color: STATUS.good },
                ]}
              />
            ) : (
              <NotReported year={fuYear} detail="The follow-up register covers 2025 only." />
            )}
          </ChartCard>
          <ChartCard title={`Monthly Cases vs Improved (${fuYear})`} subtitle={followup ? `Count of children by month · ${fuYear}` : 'Count of children by month'}>
            {followup ? (
              <TrendChart
                data={followup.monthly}
                xKey="month"
                height={300}
                series={[
                  { key: 'cases', name: 'New cases', color: METRIC[0] },
                  { key: 'improved', name: 'Improved', color: STATUS.good },
                ]}
              />
            ) : (
              <NotReported year={fuYear} detail="The follow-up register covers 2025 only." />
            )}
          </ChartCard>
        </div>

        <div className="mt-4">
          <ChartCard title={`Treatment Follow-up by Wilayat (${fuYear})`} subtitle="">
            {followup ? (
              <DataTable
                columns={[
                  { label: 'Wilayat' },
                  { label: 'Cases', align: 'right' },
                  { label: 'On Iron', align: 'right' },
                  { label: 'Iron %', align: 'right' },
                  { label: 'Continued 3mo', align: 'right' },
                  { label: 'Improved', align: 'right' },
                  { label: 'Improved %', align: 'right' },
                ]}
                rows={followup.byWilayat.map((w) => [
                  w.wilayat,
                  int(w.cases),
                  int(w.iron),
                  pctCell(ratio(w.iron, w.cases)),
                  int(w.cont3),
                  int(w.improved),
                  pctCell(ratio(w.improved, w.cases)),
                ])}
                total={[
                  'GOVERNORATE',
                  int(followup.gov.cases),
                  int(followup.gov.iron),
                  pctCell(ratio(followup.gov.iron, followup.gov.cases)),
                  int(followup.gov.cont3),
                  int(followup.gov.improved),
                  pctCell(ratio(followup.gov.improved, followup.gov.cases)),
                ]}
                dense
              />
            ) : (
              <NotReported year={fuYear} detail="The follow-up register covers 2025 only." />
            )}
            <div className="mt-3">
              <Note title="Source:">
                Anaemia follow-up register (9-month cohort), 2025. Governorate totals reconcile to the
                workbook's TOTAL ({int(fu.cases)} cases). "Improved %" is among all followed cases.
              </Note>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
