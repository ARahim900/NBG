import { useMemo, useState } from 'react'
import {
  Baby,
  Download,
  Gauge,
  HeartHandshake,
  MapPin,
  Table2,
  UserRound,
  Users,
} from 'lucide-react'
import KpiCard from '../components/ui/KpiCard'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
import Segmented from '../components/ui/Segmented'
import { ComparisonBars, PyramidChart } from '../components/charts/Charts'
import {
  AGE_BANDS,
  INSTITUTIONS,
  WILAYATS,
  aggregate,
  byWilayat,
  govOmani,
  institutionsIn,
  notInSummary,
  popMeta,
  targetGroups,
  type Nationality,
} from '../data/population'
import { anaemia } from '../data/nutrition'
import {
  FLAG_BELOW,
  ancGov,
  ancRateGov,
  bsRateGov,
  cohortGov,
  flaggedNames,
  flaggedNew,
  services,
  share,
  targetPctGov,
} from '../data/services'
import { C } from '../lib/theme'
import { int, pct } from '../lib/format'
import { downloadCsv } from '../lib/csv'

const NAT_OPTIONS: { value: Nationality; label: string }[] = [
  { value: 'all', label: 'All residents' },
  { value: 'omani', label: 'Omani' },
  { value: 'expat', label: 'Expatriate' },
]

const r = Math.round

/**
 * The workbook's own target-group sheet applies this flat governorate share of
 * Omanis aged 0–4 to every catchment (source value, sheet "فئات", cell D6).
 */
const RATIO_SHEET_UNDER5 = 10.95

const opt = (v: number | null, f: (n: number) => string): string =>
  v === null ? '—' : f(v)
const one = (v: number): string => v.toFixed(1)

export default function Population() {
  const [wilayat, setWilayat] = useState<string>('all')
  const [nat, setNat] = useState<Nationality>('all')

  const list = useMemo(() => institutionsIn(wilayat), [wilayat])
  const om = useMemo(() => aggregate(list, 'omani'), [list])
  const ex = useMemo(() => aggregate(list, 'expat'), [list])
  const tg = useMemo(() => targetGroups(aggregate(list, nat)), [list, nat])
  const omTotal = targetGroups(om).total
  const exTotal = targetGroups(ex).total

  const place = wilayat === 'all' ? 'North Batinah' : wilayat
  const natLabel = NAT_OPTIONS.find((o) => o.value === nat)?.label ?? ''

  // Pyramid: stack Omani + expatriate on each side when showing everyone.
  const pyramid = AGE_BANDS.map((band, i) => ({
    band,
    omM: om.male[i],
    exM: ex.male[i],
    omF: om.female[i],
    exF: ex.female[i],
  }))
  const maleSeries = [
    ...(nat !== 'expat' ? [{ key: 'omM', name: 'Omani male', color: C.navy }] : []),
    ...(nat !== 'omani' ? [{ key: 'exM', name: 'Expatriate male', color: C.azure }] : []),
  ]
  const femaleSeries = [
    ...(nat !== 'expat' ? [{ key: 'omF', name: 'Omani female', color: C.tealDeep }] : []),
    ...(nat !== 'omani' ? [{ key: 'exF', name: 'Expatriate female', color: C.teal }] : []),
  ]

  // Composition: wilayat across the governorate, or institutions within one.
  const composition =
    wilayat === 'all'
      ? byWilayat.map((w) => ({ name: w.wilayat, omani: r(w.omani), expat: r(w.expat) }))
      : list.map((inst) => ({
          name: inst.en,
          omani: r(targetGroups(aggregate([inst], 'omani')).total),
          expat: r(targetGroups(aggregate([inst], 'expat')).total),
        }))

  // Institution table follows both filters; target groups follow nationality.
  const tableRows = list
    .map((inst) => {
      const o = targetGroups(aggregate([inst], 'omani'))
      const e = targetGroups(aggregate([inst], 'expat'))
      const t = targetGroups(aggregate([inst], nat))
      return { inst, omani: o.total, expat: e.total, total: o.total + e.total, t }
    })
    .sort((a, b) => b.total - a.total)

  const exportTable = () =>
    downloadCsv(
      `nbg-population-2025-${wilayat === 'all' ? 'governorate' : wilayat}-${nat}.csv`
        .toLowerCase()
        .replace(/\s+/g, '-'),
      [
        'Institution',
        'Institution (Arabic)',
        'Wilayat',
        'Omani',
        'Expatriate',
        'Total',
        `Under 5 (${natLabel})`,
        `Women 15-49 (${natLabel})`,
        `Aged 60+ (${natLabel})`,
      ],
      tableRows.map((x) => [
        x.inst.en,
        x.inst.ar,
        x.inst.wilayat,
        r(x.omani),
        r(x.expat),
        r(x.total),
        r(x.t.under5),
        r(x.t.women15to49),
        r(x.t.adults60plus),
      ]),
    )

  const detailTotal = govOmani.total + targetGroups(aggregate(INSTITUTIONS, 'expat')).total
  const summaryTotal = popMeta.summarySheet.omani + popMeta.summarySheet.expatriate

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Users}
        title="Population Estimates 2025"
        subtitle={`End-year 2025 catchment populations for ${INSTITUTIONS.length} health institutions — the denominators behind coverage indicators`}
      />

      {/* Filters */}
      <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-eyebrow uppercase text-ink/60">
              Wilayat
            </span>
            <select
              value={wilayat}
              onChange={(e) => setWilayat(e.target.value)}
              className="w-full rounded-control border border-line/15 bg-mist/60 px-3 py-2 text-label text-heading sm:w-56"
            >
              <option value="all">All wilayat</option>
              {WILAYATS.map((w) => (
                <option key={w.en} value={w.en}>
                  {w.en} · {w.ar}
                </option>
              ))}
            </select>
          </label>
          <Segmented label="Nationality" options={NAT_OPTIONS} value={nat} onChange={setNat} />
        </div>
        <p className="text-xs text-ink/55">
          <span lang="ar" dir="rtl" className="font-ar text-sm text-heading/80">
            {popMeta.titleAr}
          </span>
          <span className="mx-2 text-ink/25">·</span>
          {list.length} catchments shown
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label={`Population · ${place}`}
          value={int(r(tg.total))}
          icon={Users}
          accent="navy"
          hint={
            nat === 'all'
              ? `${pct(share(omTotal, omTotal + exTotal))} Omani · ${pct(share(exTotal, omTotal + exTotal))} expatriate`
              : `${pct(share(tg.total, omTotal + exTotal))} of all residents`
          }
        />
        <KpiCard
          label="Children under 5"
          value={int(r(tg.under5))}
          icon={Baby}
          accent="azure"
          hint={`≈ ${int(r(tg.under5 / 5))} per annual birth cohort`}
        />
        <KpiCard
          label="Women aged 15–49"
          value={int(r(tg.women15to49))}
          icon={HeartHandshake}
          accent="teal"
          hint={`${pct(share(tg.women15to49, tg.total))} of population · reproductive age`}
        />
        <KpiCard
          label="Aged 60 and over"
          value={int(r(tg.adults60plus))}
          icon={UserRound}
          accent="gold"
          hint={`${pct(share(tg.adults60plus, tg.total))} of population`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          className="xl:col-span-3"
          title={`Age & Sex Structure · ${place}`}
          subtitle={`${natLabel} · five-year age bands · males left, females right`}
          footnote="The expatriate population is concentrated in working-age men (25–49), so the combined pyramid is heavily male in the middle bands. Maternal and child indicators should use the Omani pyramid."
        >
          <PyramidChart data={pyramid} bandKey="band" male={maleSeries} female={femaleSeries} />
        </ChartCard>
        <ChartCard
          className="xl:col-span-2"
          title={wilayat === 'all' ? 'Population by Wilayat' : `Catchments in ${wilayat}`}
          subtitle="Omani and expatriate residents"
        >
          <ComparisonBars
            data={composition}
            xKey="name"
            layout="vertical"
            stacked
            categoryWidth={wilayat === 'all' ? 92 : 150}
            height={Math.max(280, composition.length * 44)}
            series={[
              { key: 'omani', name: 'Omani', color: C.navy },
              { key: 'expat', name: 'Expatriate', color: C.teal },
            ]}
          />
        </ChartCard>
      </div>

      {/* ===== Services against population ===== */}
      <div>
        <SectionTitle
          icon={Gauge}
          title="Services Relative to Population"
          subtitle="2025 service volumes by wilayat against Omani denominators from these estimates"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="Birth Cohort vs 9-Month Screening Target"
            subtitle="Estimated Omani births per year (under-5 ÷ 5) vs anaemia-screening target"
            footnote={`Governorate: target ${int(anaemia.gov.t9)} against an estimated cohort of ${int(r(cohortGov))} (${pct(targetPctGov)}). A target well below the cohort means coverage percentages look better than reality.`}
          >
            <ComparisonBars
              data={services.map((s) => ({
                wilayat: s.wilayat,
                cohort: r(s.cohort),
                target: s.target9 ?? 0,
              }))}
              xKey="wilayat"
              layout="vertical"
              series={[
                { key: 'cohort', name: 'Estimated cohort', color: C.teal },
                { key: 'target', name: '9-month target', color: C.navy },
              ]}
            />
          </ChartCard>
          <ChartCard
            title="New Antenatal Registrations per 1,000 Women"
            subtitle="New ANC registrations 2025 per 1,000 Omani women aged 15–49"
            footnote={`Governorate rate: ${one(ancRateGov)} per 1,000 (${int(ancGov)} registrations). Broadly tracks the fertility rate, so large gaps between wilayat point to denominator or reporting issues.`}
          >
            <ComparisonBars
              data={services.map((s) => ({ wilayat: s.wilayat, rate: s.ancRate ?? 0 }))}
              xKey="wilayat"
              showLegend={false}
              series={[{ key: 'rate', name: 'Per 1,000 women', color: C.azure }]}
            />
          </ChartCard>
        </div>

        <div className="mt-4">
          <ChartCard
            title="Service Ratios by Wilayat (2025)"
            subtitle={`"Check" marks a ratio more than ${r((1 - FLAG_BELOW) * 100)}% below the benchmark`}
          >
            <DataTable
              dense
              columns={[
                { label: 'Wilayat' },
                { label: 'Omani 0–4', align: 'right' },
                { label: 'Est. cohort', align: 'right' },
                { label: '9m target', align: 'right' },
                { label: 'Target / cohort', align: 'right' },
                { label: 'Omani women 15–49', align: 'right' },
                { label: 'New ANC', align: 'right' },
                { label: 'ANC /1,000', align: 'right' },
                { label: 'Birth spacing /1,000', align: 'right' },
                { label: 'Status', align: 'center' },
              ]}
              rows={services.map((s) => [
                s.wilayat,
                int(r(s.under5)),
                int(r(s.cohort)),
                opt(s.target9, int),
                opt(s.targetPct, (v) => pct(v)),
                int(r(s.wra)),
                opt(s.anc, int),
                opt(s.ancRate, one),
                opt(s.bsRate, one),
                s.flagged ? (
                  <span className="chip bg-warn/15 text-[#7a5a12] dark:text-warn">Check</span>
                ) : (
                  <span className="chip bg-good/10 text-good">OK</span>
                ),
              ])}
              total={[
                'GOVERNORATE',
                int(r(govOmani.under5)),
                int(r(cohortGov)),
                int(anaemia.gov.t9),
                pct(targetPctGov),
                int(r(govOmani.women15to49)),
                int(ancGov),
                one(ancRateGov),
                one(bsRateGov),
                '',
              ]}
            />
            <div className="mt-3 space-y-2">
              {flaggedNames.length > 0 && (
                <Note tone="warn" title={`Check ${flaggedNames.join(', ')}:`}>
                  service volumes are well below what the estimated population implies. Either
                  the catchment population is over-estimated
                  {flaggedNew.length > 0 &&
                    ` (for example, the new ${flaggedNew.map((i) => i.en).join(', ')} catchment may overlap existing ones)`}{' '}
                  or residents use services outside their wilayat. Confirm with the wilayat
                  team before using these denominators to set targets.
                </Note>
              )}
              <Note title="Method:">
                Denominators are Omani residents only, following the department's own
                target-group sheet. If service counts include expatriate women or children,
                these rates are over-stated. "Est. cohort" = Omani under-5 ÷ 5, an approximation
                of births per year.
              </Note>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ===== Institution table ===== */}
      <div>
        <SectionTitle
          icon={Table2}
          title="Catchment Populations"
          subtitle={`By health institution · ${place} · target groups show ${natLabel.toLowerCase()}`}
        />
        <ChartCard
          title="Population by Health Institution (2025)"
          subtitle="Largest catchment first"
          action={
            <button
              type="button"
              onClick={exportTable}
              className="inline-flex items-center gap-1.5 rounded-control border border-line/15 px-2.5 py-1.5 text-label text-heading transition-colors hover:bg-tint/10"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          }
        >
          <DataTable
            dense
            columns={[
              { label: 'Institution' },
              { label: 'Wilayat' },
              { label: 'Omani', align: 'right' },
              { label: 'Expatriate', align: 'right' },
              { label: 'Total', align: 'right' },
              { label: 'Under 5', align: 'right' },
              { label: 'Women 15–49', align: 'right' },
              { label: '60+', align: 'right' },
            ]}
            rows={tableRows.map((x) => [
              <span className="block">
                {x.inst.en}
                <span lang="ar" dir="rtl" className="block font-ar text-[0.72rem] font-normal text-ink/50">
                  {x.inst.ar}
                </span>
              </span>,
              <span className="inline-flex items-center gap-1 text-ink/70">
                <MapPin className="h-3 w-3 text-teal-600" />
                {x.inst.wilayat}
              </span>,
              int(r(x.omani)),
              int(r(x.expat)),
              int(r(x.total)),
              int(r(x.t.under5)),
              int(r(x.t.women15to49)),
              int(r(x.t.adults60plus)),
            ])}
            total={[
              wilayat === 'all' ? 'GOVERNORATE' : wilayat.toUpperCase(),
              '',
              int(r(omTotal)),
              int(r(exTotal)),
              int(r(omTotal + exTotal)),
              int(r(tg.under5)),
              int(r(tg.women15to49)),
              int(r(tg.adults60plus)),
            ]}
          />
        </ChartCard>
      </div>

      {/* ===== Data notes ===== */}
      <ChartCard title="About These Estimates" subtitle="Source, method and reconciliation">
        <div className="space-y-2">
          <Note title="Source:">
            {popMeta.source}. {popMeta.reference}. Figures are modelled estimates with
            decimals; they are rounded for display, so a column may differ from its total
            by 1.
          </Note>
          {notInSummary.length > 0 && (
            <Note tone="warn" title="Reconciliation:">
              {notInSummary.map((i) => i.en).join(', ')} appears in the wilayat sheets but
              not in the workbook's summary sheet. This dashboard uses the wilayat sheets, so
              the governorate total is {int(r(detailTotal))} against {int(summaryTotal)} in
              the summary ({popMeta.summarySheet.institutions} institutions). Confirm whether
              the new catchment was carved out of an existing one; if it was, that population
              is counted twice.
            </Note>
          )}
          <Note title="Target groups:">
            The workbook's ratio sheet applies one governorate share to every catchment
            ({RATIO_SHEET_UNDER5}% of Omanis aged 0–4) and its total row does not add up. This
            dashboard uses the detailed age tables instead, where under-5s are{' '}
            {pct(share(govOmani.under5, govOmani.total), 2)} of Omanis — about{' '}
            {r(share(govOmani.under5, govOmani.total) / RATIO_SHEET_UNDER5 * 100 - 100)}% more
            children than the ratio sheet implies.
          </Note>
        </div>
      </ChartCard>
    </div>
  )
}
