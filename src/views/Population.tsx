import { useMemo, useState } from 'react'
import {
  Download,
  Gauge,
  MapPin,
  Table2,
} from 'lucide-react'
import ChartCard from '../components/ui/ChartCard'
import SectionTitle from '../components/ui/SectionTitle'
import DataTable from '../components/ui/DataTable'
import Note from '../components/ui/Note'
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
import { WILAYAT_HOSPITALS, hospitalCatchment, wilayatHospitalsIn, wilayatName } from '../data/hospitals'
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
import { METRIC } from '../lib/theme'
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

/** Wilayat with no 2025 figure: their bars are left blank, never drawn as 0. */
const noTarget9 = services.filter((s) => s.target9 === null).map((s) => s.wilayat)
const noAncRate = services.filter((s) => s.ancRate === null).map((s) => s.wilayat)

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

  // Wilayat-wide hospitals (Al Suwaiq Hospital): catchment = the whole wilayat.
  // Listed beside the health centres, never added to any total.
  const hospitals = wilayat === 'all' ? WILAYAT_HOSPITALS : wilayatHospitalsIn(wilayat)
  const hospitalRows = hospitals.map((h) => {
    const o = targetGroups(hospitalCatchment(h, 'omani'))
    const e = targetGroups(hospitalCatchment(h, 'expat'))
    const t = targetGroups(hospitalCatchment(h, nat))
    return { h, omani: o.total, expat: e.total, total: o.total + e.total, t }
  })
  const catchmentCount = `${list.length} health-centre catchments${
    hospitals.length ? ` + ${hospitals.length} wilayat hospital${hospitals.length > 1 ? 's' : ''}` : ''
  }`

  // Pyramid: stack Omani + expatriate on each side when showing everyone.
  const pyramid = AGE_BANDS.map((band, i) => ({
    band,
    omM: om.male[i],
    exM: ex.male[i],
    omF: om.female[i],
    exF: ex.female[i],
  }))
  const maleSeries = [
    ...(nat !== 'expat' ? [{ key: 'omM', name: 'Omani male', color: METRIC[0] }] : []),
    ...(nat !== 'omani' ? [{ key: 'exM', name: 'Expatriate male', color: METRIC[1] }] : []),
  ]
  const femaleSeries = [
    ...(nat !== 'expat' ? [{ key: 'omF', name: 'Omani female', color: METRIC[0] }] : []),
    ...(nat !== 'omani' ? [{ key: 'exF', name: 'Expatriate female', color: METRIC[1] }] : []),
  ]

  // Composition: wilayat across the governorate, or institutions within one.
  const composition =
    wilayat === 'all'
      ? byWilayat.map((w) => ({ name: w.wilayat, omani: r(w.omani), expat: r(w.expat) }))
      : [
          ...hospitalRows.map((x) => ({
            name: `${x.h.en} (whole wilayat)`,
            omani: r(x.omani),
            expat: r(x.expat),
          })),
          ...list.map((inst) => ({
            name: inst.en,
            omani: r(targetGroups(aggregate([inst], 'omani')).total),
            expat: r(targetGroups(aggregate([inst], 'expat')).total),
          })),
        ]

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
        'Catchment',
        'Omani',
        'Expatriate',
        'Total',
        `Under 5 (${natLabel})`,
        `Women 15-49 (${natLabel})`,
        `Aged 60+ (${natLabel})`,
      ],
      [
        // Hospital rows overlap the centres below them: never sum this column.
        ...hospitalRows.map((x) => [
          x.h.en,
          x.h.ar,
          x.h.wilayat,
          'Whole wilayat - not added to totals',
          r(x.omani),
          r(x.expat),
          r(x.total),
          r(x.t.under5),
          r(x.t.women15to49),
          r(x.t.adults60plus),
        ]),
        ...tableRows.map((x) => [
          x.inst.en,
          x.inst.ar,
          x.inst.wilayat,
          'Health-centre catchment',
          r(x.omani),
          r(x.expat),
          r(x.total),
          r(x.t.under5),
          r(x.t.women15to49),
          r(x.t.adults60plus),
        ]),
      ],
    )

  const detailTotal = govOmani.total + targetGroups(aggregate(INSTITUTIONS, 'expat')).total
  const summaryTotal = popMeta.summarySheet.omani + popMeta.summarySheet.expatriate

  return (
    <div className="space-y-8">
      <section aria-labelledby="population-title" className="space-y-4">
        <div>
          <h2 id="population-title" className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            Population estimates
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/80">
            End-year 2025 · {INSTITUTIONS.length} health-centre catchments across North Batinah, plus{' '}
            {WILAYAT_HOSPITALS.map((h) => `${h.en} (catchment: all of ${wilayatName(h)})`).join(', ')}.
          </p>
          <p lang="ar" dir="rtl" className="mt-1 text-left font-ar text-sm text-ink/80">
            {popMeta.titleAr}
          </p>
        </div>
        {notInSummary.length > 0 && (
          <details className="card px-4">
            <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-heading">
              Population totals need reconciliation
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-ink/80">
              {notInSummary.map((i) => i.en).join(', ')} appears in the wilayat sheets but
              not in the workbook’s summary. The governorate totals are {int(r(detailTotal))}
              {' '}and {int(summaryTotal)} respectively. Confirm whether the new catchment
              overlaps an existing one before using these figures to set targets.
            </p>
          </details>
        )}
      </section>

      <section aria-label="Population filters" className="card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="block min-w-0 sm:flex-1">
            <span className="mb-2 block text-sm font-medium text-heading">Wilayat</span>
            <select
              value={wilayat}
              onChange={(e) => setWilayat(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-line/20 bg-surface px-3 text-sm text-heading"
            >
              <option value="all">All wilayat</option>
              {WILAYATS.map((w) => (
                <option key={w.en} value={w.en}>{w.en} · {w.ar}</option>
              ))}
            </select>
          </label>
          <fieldset className="min-w-0 sm:flex-1">
            <legend className="mb-2 text-sm font-medium text-heading">Nationality</legend>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-line/20 p-1">
              {NAT_OPTIONS.map((option) => (
                <label key={option.value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md px-2 text-center text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${nat === option.value ? 'bg-ink text-surface' : 'text-ink hover:bg-mist'}`}>
                  <input type="radio" name="population-nationality" value={option.value}
                    checked={nat === option.value} onChange={() => setNat(option.value)} className="sr-only" />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/10 pt-3">
          <p role="status" className="text-sm text-ink/80">{place} · {natLabel} · {catchmentCount}</p>
          {(wilayat !== 'all' || nat !== 'all') && (
            <button type="button" onClick={() => { setWilayat('all'); setNat('all') }}
              className="min-h-11 rounded-lg px-3 text-sm font-medium text-heading underline underline-offset-4 hover:bg-mist">
              Reset filters
            </button>
          )}
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { label: `Population · ${place}`, value: int(r(tg.total)), hint: nat === 'all'
            ? `${pct(share(omTotal, omTotal + exTotal))} Omani · ${pct(share(exTotal, omTotal + exTotal))} expatriate`
            : `${pct(share(tg.total, omTotal + exTotal))} of all residents` },
          { label: 'Children under 5', value: int(r(tg.under5)), hint: `≈ ${int(r(tg.under5 / 5))} per annual birth cohort` },
          { label: 'Women aged 15–49', value: int(r(tg.women15to49)), hint: `${pct(share(tg.women15to49, tg.total))} of population · reproductive age` },
          { label: 'Aged 60 and over', value: int(r(tg.adults60plus)), hint: `${pct(share(tg.adults60plus, tg.total))} of population` },
        ].map((metric) => (
          <div key={metric.label} className="card p-4 sm:p-6">
            <dt className="text-sm font-medium leading-5 text-ink/80">{metric.label}</dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-heading sm:text-3xl">{metric.value}</dd>
            <dd className="mt-2 text-xs leading-5 text-ink/80">{metric.hint}</dd>
          </div>
        ))}
      </dl>

      {/* Pyramid full width; the composition bars follow full width too, since the
          two service charts below already make the natural by-wilayat pair. */}
      <div className="space-y-4">
        <ChartCard
          title={`Age & Sex Structure · ${place}`}
          subtitle={`Residents · 2025 · ${natLabel} · five-year age bands, males left and females right`}
          footnote="The expatriate population is concentrated in working-age men (25–49), so the combined pyramid is heavily male in the middle bands. Maternal and child indicators should use the Omani pyramid."
        >
          <PyramidChart data={pyramid} bandKey="band" male={maleSeries} female={femaleSeries} />
        </ChartCard>
        <ChartCard
          title={wilayat === 'all' ? 'Population by Wilayat' : `Catchments in ${wilayat}`}
          subtitle="Residents · 2025 · Omani and expatriate"
          footnote={
            hospitalRows.length > 0 && wilayat !== 'all'
              ? `${hospitalRows.map((x) => x.h.en).join(', ')} covers the whole wilayat, so its bar equals the sum of the health-centre bars below it.`
              : undefined
          }
        >
          <ComparisonBars
            data={composition}
            xKey="name"
            layout="vertical"
            stacked
            categoryWidth={wilayat === 'all' ? 92 : 150}
            height={Math.max(260, composition.length * 44)}
            series={[
              { key: 'omani', name: 'Omani', color: METRIC[0] },
              { key: 'expat', name: 'Expatriate', color: METRIC[1] },
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
        <div className="space-y-4">
          {/* Paired: the child-side and the maternal-side denominator check, both by wilayat. */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard
              title="Birth Cohort vs 9-Month Screening Target (2025)"
              subtitle="Count · 2025 · estimated Omani births per year (under-5 ÷ 5) and the anaemia-screening target"
              footnote={`Governorate: target ${int(anaemia.gov.t9)} against an estimated cohort of ${int(r(cohortGov))} (${pct(targetPctGov)}). A target well below the cohort means coverage percentages look better than reality.`}
            >
              <ComparisonBars
                data={services.map((s) => ({
                  wilayat: s.wilayat,
                  cohort: r(s.cohort),
                  target: s.target9,
                }))}
                xKey="wilayat"
                height={300}
                series={[
                  { key: 'cohort', name: 'Estimated cohort', color: METRIC[0] },
                  { key: 'target', name: '9-month target', color: METRIC[1] },
                ]}
              />
              {noTarget9.length > 0 && (
                <div className="mt-3">
                  <Note title="No data supplied:">
                    2025 9-month target for {noTarget9.join(', ')}; the bar is left blank, not
                    shown as zero.
                  </Note>
                </div>
              )}
            </ChartCard>
            <ChartCard
              title="New Antenatal Registrations per 1,000 Women (2025)"
              subtitle="Rate per 1,000 Omani women aged 15–49 · 2025"
              footnote={`Governorate rate: ${one(ancRateGov)} per 1,000 (${int(ancGov)} registrations). Broadly tracks the fertility rate, so large gaps between wilayat point to denominator or reporting issues.`}
            >
              <ComparisonBars
                data={services.map((s) => ({ wilayat: s.wilayat, rate: s.ancRate }))}
                xKey="wilayat"
                height={300}
                showLegend={false}
                series={[{ key: 'rate', name: 'Per 1,000 women', color: METRIC[0] }]}
              />
              {noAncRate.length > 0 && (
                <div className="mt-3">
                  <Note title="No data supplied:">
                    2025 ANC registrations for {noAncRate.join(', ')}; the bar is left blank, not
                    shown as zero.
                  </Note>
                </div>
              )}
            </ChartCard>
          </div>

          <ChartCard
            title="Service Ratios by Wilayat (2025)"
            subtitle={`Ratios · 2025 · "Check" marks a ratio more than ${r((1 - FLAG_BELOW) * 100)}% below the benchmark`}
          >
            <p className="mb-3 text-xs text-ink/80 sm:hidden">Swipe the table sideways to see more columns.</p>
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
                  <span className="chip bg-warn/15 text-heading">Check</span>
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
          subtitle={hospitalRows.length > 0 ? 'Residents · 2025 · wilayat hospital first (not added to the total), then health centres by size' : 'Residents · 2025 · largest catchment first'}
          action={
            <button
              type="button"
              onClick={exportTable}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line/20 px-4 text-sm font-medium text-heading transition-colors hover:bg-mist"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          }
        >
          <p className="mb-3 text-xs text-ink/80 sm:hidden">Swipe the table sideways to see more columns.</p>
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
            rows={[
              ...hospitalRows.map((x) => [
                <span className="block">
                  {x.h.en}
                  <span className="ml-1.5 rounded-control border border-line/20 px-1.5 text-eyebrow uppercase text-heading/75">
                    Whole wilayat
                  </span>
                  <span lang="ar" dir="rtl" className="block font-ar text-[0.72rem] font-normal text-ink/50">
                    {x.h.ar}
                  </span>
                </span>,
                <span className="inline-flex items-center gap-1 text-ink/70">
                  <MapPin className="h-3 w-3 text-ink/50" aria-hidden="true" />
                  {x.h.wilayat}
                </span>,
                int(r(x.omani)),
                int(r(x.expat)),
                int(r(x.total)),
                int(r(x.t.under5)),
                int(r(x.t.women15to49)),
                int(r(x.t.adults60plus)),
              ]),
              ...tableRows.map((x) => [
              <span className="block">
                {x.inst.en}
                <span lang="ar" dir="rtl" className="block font-ar text-[0.72rem] font-normal text-ink/50">
                  {x.inst.ar}
                </span>
              </span>,
              <span className="inline-flex items-center gap-1 text-ink/70">
                <MapPin className="h-3 w-3 text-ink/50" aria-hidden="true" />
                {x.inst.wilayat}
              </span>,
              int(r(x.omani)),
              int(r(x.expat)),
              int(r(x.total)),
              int(r(x.t.under5)),
              int(r(x.t.women15to49)),
              int(r(x.t.adults60plus)),
              ]),
            ]}
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
      <ChartCard title="About These Estimates" subtitle="Source and method">
        <div className="space-y-2">
          <Note title="Years:">
            The source workbook gives end-year 2025 estimates only; 2023 and 2024 population
            estimates are not in the source files, so this page shows 2025. The service ratios
            use 2025 volumes by wilayat; no data supplied for 2023 and 2024 volumes by wilayat.
            Governorate totals for 2023, 2024 and 2025 are on the Overview and each dashboard.
          </Note>
          {WILAYAT_HOSPITALS.map((h) => (
            <Note key={h.en} title="Wilayat hospital:">
              {h.en} serves the whole wilayat of {wilayatName(h)}, so its catchment is the
              wilayat&rsquo;s total population. It is listed alongside {h.wilayat} EHC and the
              other health centres but never added again to the totals.
            </Note>
          ))}
          <Note title="Source:">
            {popMeta.source}. {popMeta.reference}. Figures are modelled estimates with
            decimals; they are rounded for display, so a column may differ from its total
            by 1.
          </Note>
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
