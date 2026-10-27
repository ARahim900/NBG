import { asd, ds, fp, sumBy, type Cell, type YearPoint } from '../nbg'
import { MONTHS, ds2025, dsTotals, type VisitCentre, type VisitSheet } from '../wch2025'

/**
 * Year-by-year shapes for the Children A views (ASD early screening, Down
 * syndrome registry, Extra Child Health Register). Every figure comes from
 * nbg.json or the 2025 workbooks as reported; a year the source does not
 * provide is `null` ("Not reported"), never 0. Nothing here estimates a value.
 */

export type Year = '2023' | '2024' | '2025'
export const YEARS: Year[] = ['2023', '2024', '2025']
export const YEAR_OPTIONS: { value: Year; label: string }[] = YEARS.map((y) => ({ value: y, label: y }))

/** One value per reporting year, null where the source has no figure. */
export interface YearValues {
  y2023: number | null
  y2024: number | null
  y2025: number | null
}

export const NOT_REPORTED = 'Not reported'

/**
 * Display spelling only: align the source workbooks' place names with the
 * governorate gazetteer (population.json), e.g. "Suwaiq EHC" → "As Suwayq EHC".
 * Facility types (EHC, PC, Poly Clinic) are kept exactly as reported.
 */
export const placeName = (name: string): string =>
  name.replace(/^(Al )?Suwaiq\b/, 'As Suwayq').replace(/^Khaboura\b/, 'Al Khabourah')

const yearValue = (rows: YearPoint[], year: Year): number | null =>
  rows.find((r) => r.year === year)?.value ?? null

// =========================================================================
// Down syndrome registry
// =========================================================================
export interface DsRegistryRow {
  name: string
  registered: number
  newCases: number
  male: number
  female: number
  age0to5: number
  age6to12: number
  age13to18: number
}
export type DsRegistryField = keyof Omit<DsRegistryRow, 'name'>
export const DS_REGISTRY_FIELDS: DsRegistryField[] = [
  'registered',
  'newCases',
  'male',
  'female',
  'age0to5',
  'age6to12',
  'age13to18',
]

// 2023 and 2024 rows follow ds.facilityHeaders: centre, total, new, males,
// females, age 0–5, 6–12, 13–18.
const fromTuple = (r: (string | number)[]): DsRegistryRow => ({
  name: placeName(String(r[0])),
  registered: Number(r[1]),
  newCases: Number(r[2]),
  male: Number(r[3]),
  female: Number(r[4]),
  age0to5: Number(r[5]),
  age6to12: Number(r[6]),
  age13to18: Number(r[7]),
})

export const dsRegistry: Record<Year, DsRegistryRow[]> = {
  '2023': ds.facilities2023.map(fromTuple),
  '2024': ds.facilities2024.map(fromTuple),
  '2025': ds2025.centres.map((c) => ({
    name: placeName(c.name),
    registered: c.registered,
    newCases: c.newCases,
    male: c.male,
    female: c.female,
    age0to5: c.age0to5,
    age6to12: c.age6to12,
    age13to18: c.age13to18,
  })),
}

/** Governorate totals per year: the sum of the six clinics' rows. */
export const dsYearTotals = Object.fromEntries(
  YEARS.map((y) => [
    y,
    Object.fromEntries(
      DS_REGISTRY_FIELDS.map((f) => [f, sumBy(dsRegistry[y], (r) => r[f])]),
    ) as Record<DsRegistryField, number>,
  ]),
) as Record<Year, Record<DsRegistryField, number>>

/** Registered children per health centre, 2023–2025 (centre names match across years). */
export const dsRegisteredByCentre = dsRegistry['2024'].map((r) => {
  const of = (y: Year) => dsRegistry[y].find((c) => c.name === r.name)?.registered ?? null
  return { center: r.name, y2023: of('2023'), y2024: of('2024'), y2025: of('2025') }
})

/** Registry size and new diagnoses per year. */
export const dsRegistryTrend = YEARS.map((y) => ({
  year: y,
  registered: dsYearTotals[y].registered,
  newCases: dsYearTotals[y].newCases,
}))

/** Children per age band, one bar per year. */
export const dsAgeByYear = (
  [
    ['0–5 years', 'age0to5'],
    ['6–12 years', 'age6to12'],
    ['13–18 years', 'age13to18'],
  ] as const
).map(([band, key]) => ({
  band,
  y2023: dsYearTotals['2023'][key],
  y2024: dsYearTotals['2024'][key],
  y2025: dsYearTotals['2025'][key],
}))

const countOf = (rows: { label: string; count: number }[], label: string | null): number | null =>
  label === null ? null : (rows.find((r) => r.label === label)?.count ?? null)

const m23 = ds.morbidities('2023')
const m24 = ds.morbidities('2024')
const c25 = dsTotals.comorbidities

export interface DsYearRow extends YearValues {
  label: string
}

/**
 * Associated conditions, 2023–2025. The 2023/2024 summary and the 2025
 * workbook use different category lists: a category missing from a year is
 * null ("Not recorded"). The only combination is Thyroid: 2025 records
 * hypothyroidism and hyperthyroidism separately; their sum is shown against
 * the earlier "Thyroid problems" count.
 */
export const dsConditionsByYear: DsYearRow[] = (
  [
    ['Cardiac', 'Cardiac Issues', c25.cardiac],
    ['Ophthalmic', 'Ophthalmic', c25.ophthalmic],
    ['Ears & hearing', 'Ears & Hearing', c25.earsHearing],
    ['Thyroid', 'Thyroid Problems', c25.hypothyroidism + c25.hyperthyroidism],
    ['Growth issues', 'Growth Issues', null],
    ['Developmental delay', 'Developmental Delay', c25.developmentalDelay],
    ['Gastrointestinal', 'Gastrointestinal', c25.gastrointestinal],
    ['Asthma', 'Asthma', null],
    ['Diabetes', null, c25.diabetes],
    ['Haematological', null, c25.haematological],
  ] as const
).map(([label, source, v2025]) => ({
  label,
  y2023: countOf(m23, source),
  y2024: countOf(m24, source),
  y2025: v2025,
}))

const n23 = ds.nutrition('2023')
const n24 = ds.nutrition('2024')

/** Weight categories, 2023–2025 (same three categories in every year). */
export const dsNutritionByYear: DsYearRow[] = (
  [
    ['Underweight', 'Underweight', c25.underweight],
    ['Normal weight', 'Normal Weight', c25.normalWeight],
    ['Overweight / obese', 'Overweight/Obese', c25.overweight],
  ] as const
).map(([label, source, v2025]) => ({
  label,
  y2023: countOf(n23, source),
  y2024: countOf(n24, source),
  y2025: v2025,
}))

export type DsMonthlyMetric = 'newCases' | 'assessments'
export const DS_MONTHLY_OPTIONS: { value: DsMonthlyMetric; label: string }[] = [
  { value: 'newCases', label: 'New cases' },
  { value: 'assessments', label: 'Assessments' },
]

/** Monthly registry activity, one series per year. Only 2024 has monthly figures. */
export const dsMonthlyByYear = (metric: DsMonthlyMetric) =>
  MONTHS.map((month) => ({
    month,
    y2023: null,
    y2024: ds.monthly2024.find((r) => r.month === month)?.[metric] ?? null,
    y2025: null,
  }))

// =========================================================================
// ASD early screening (18 & 24 months)
// =========================================================================
export type AsdAge = 'm18' | 'm24'
export const ASD_AGE_OPTIONS: { value: AsdAge; label: string }[] = [
  { value: 'm18', label: '18 months' },
  { value: 'm24', label: '24 months' },
]

const month24 = (m: string) => asd.monthly2024.find((r) => r.month === m)
const month25 = (m: string) => asd.monthly2025.find((r) => r.month === m)

/** Monthly % screened, one line per year. No monthly data exists for 2023. */
export const asdMonthlyCoverage = (age: AsdAge) =>
  MONTHS.map((month) => ({
    month,
    y2023: null,
    y2024: (age === 'm18' ? month24(month)?.cov18 : month24(month)?.cov24) ?? null,
    y2025: (age === 'm18' ? month25(month)?.cov18 : month25(month)?.cov24) ?? null,
  }))

/** Monthly children screened, one bar per year. No monthly data exists for 2023. */
export const asdMonthlyScreened = (age: AsdAge) =>
  MONTHS.map((month) => ({
    month,
    y2023: null,
    y2024: (age === 'm18' ? month24(month)?.screened18 : month24(month)?.screened24) ?? null,
    y2025: (age === 'm18' ? month25(month)?.screened18 : month25(month)?.screened24) ?? null,
  }))

/** Annual coverage series: 18 months from 2019, 24 months from 2024 only. */
export const asdCoverageTrend = asd.cov18Trend.map((r) => ({
  year: r.year,
  cov18: r.value,
  cov24: asd.cov24Trend.find((t) => t.year === r.year)?.value ?? null,
}))

/** Medium / high-risk detections per year; 24-month figures start in 2024. */
export const asdRiskByYear: Record<AsdAge, { year: string; medium: number | null; high: number | null }[]> = {
  m18: asd.risk18Trend,
  m24: YEARS.map((y) => {
    const r = asd.risk24Trend.find((t) => t.year === y)
    return { year: y, medium: r?.medium ?? null, high: r?.high ?? null }
  }),
}

/** One row of the monthly screening table, 2024 or 2025. */
export interface AsdMonthRecord {
  month: string
  visits18: number | null
  screened18: number
  cov18: number
  visits24: number | null
  screened24: number
  cov24: number
  med18: number | null
  high18: number | null
  med24: number | null
  high24: number | null
}
/** 2024 has no visit counts; 2025 has no monthly risk counts. */
export const asdMonthlyRecords: Record<'2024' | '2025', AsdMonthRecord[]> = {
  '2024': asd.monthly2024.map((r) => ({ ...r, visits18: null, visits24: null })),
  '2025': asd.monthly2025.map((r) => ({ ...r, med18: null, high18: null, med24: null, high24: null })),
}

const summary = (starts: string, key: 'm18' | 'm24'): number | null =>
  asd.summary2025.find((r) => r.metric.startsWith(starts))?.[key] ?? null

/** 18-month plus 24-month figure from the 2025 summary; null if either is missing. */
const bothAges = (starts: string): number | null => {
  const a = summary(starts, 'm18')
  const b = summary(starts, 'm24')
  return a === null || b === null ? null : a + b
}

const risk18 = (y: Year) => asd.risk18Trend.find((r) => r.year === y)
const risk24 = (y: Year) => asd.risk24Trend.find((r) => r.year === y)

export interface AsdIndicatorRow extends YearValues {
  metric: string
  kind: 'pct' | 'int'
}

/** Headline indicators side by side for 2023, 2024 and 2025, as reported. */
export const asdIndicatorsByYear: AsdIndicatorRow[] = [
  {
    metric: '18-month coverage (annual series)',
    kind: 'pct',
    y2023: yearValue(asd.cov18Trend, '2023'),
    y2024: yearValue(asd.cov18Trend, '2024'),
    y2025: yearValue(asd.cov18Trend, '2025'),
  },
  {
    metric: '24-month coverage (annual series)',
    kind: 'pct',
    y2023: yearValue(asd.cov24Trend, '2023'),
    y2024: yearValue(asd.cov24Trend, '2024'),
    y2025: yearValue(asd.cov24Trend, '2025'),
  },
  {
    metric: 'Children screened at 18 months',
    kind: 'int',
    y2023: null,
    y2024: sumBy(asd.monthly2024, (r) => r.screened18),
    y2025: summary('Screened', 'm18'),
  },
  {
    metric: 'Children screened at 24 months',
    kind: 'int',
    y2023: null,
    y2024: sumBy(asd.monthly2024, (r) => r.screened24),
    y2025: summary('Screened', 'm24'),
  },
  {
    metric: '18 months — medium risk (3–7)',
    kind: 'int',
    y2023: risk18('2023')?.medium ?? null,
    y2024: risk18('2024')?.medium ?? null,
    y2025: risk18('2025')?.medium ?? null,
  },
  {
    metric: '18 months — high risk (8–20)',
    kind: 'int',
    y2023: risk18('2023')?.high ?? null,
    y2024: risk18('2024')?.high ?? null,
    y2025: risk18('2025')?.high ?? null,
  },
  {
    metric: '24 months — medium risk (3–7)',
    kind: 'int',
    y2023: risk24('2023')?.medium ?? null,
    y2024: risk24('2024')?.medium ?? null,
    y2025: risk24('2025')?.medium ?? null,
  },
  {
    metric: '24 months — high risk (8–20)',
    kind: 'int',
    y2023: risk24('2023')?.high ?? null,
    y2024: risk24('2024')?.high ?? null,
    y2025: risk24('2025')?.high ?? null,
  },
  {
    metric: 'Positive screens (annual series)',
    kind: 'int',
    y2023: yearValue(asd.positiveTrend, '2023'),
    y2024: yearValue(asd.positiveTrend, '2024'),
    y2025: yearValue(asd.positiveTrend, '2025'),
  },
  // The 2025 summary's M-CHAT positive count is a separate figure, not a
  // continuation of the annual positive-screen series, so it has its own rows.
  {
    metric: 'M-CHAT positive (≥2) at 18 months, 2025 summary',
    kind: 'int',
    y2023: null,
    y2024: null,
    y2025: summary('M-CHAT positive', 'm18'),
  },
  {
    metric: 'M-CHAT positive (≥2) at 24 months, 2025 summary',
    kind: 'int',
    y2023: null,
    y2024: null,
    y2025: summary('M-CHAT positive', 'm24'),
  },
  {
    metric: 'Referred to rehabilitation (18 + 24 months)',
    kind: 'int',
    y2023: null,
    y2024: null,
    y2025: bothAges('Referred'),
  },
]

/**
 * All children screened (18 + 24 months) by risk band. 2024 is the source's
 * own distribution; 2025 is the 18-month plus 24-month figures from the 2025
 * governorate summary (the same basis: 2024's medium 30 = 18 + 12). 2023 has
 * no 24-month or low-risk figures, so it is not reported.
 */
export const asdRiskBandsByYear: { band: string; y2023: null; y2024: number | null; y2025: number | null }[] = (
  [
    ['Low risk (0–2)', 'Low Risk', 'Low risk'],
    ['Medium risk (3–7)', 'Medium Risk', 'Moderate risk'],
    ['High risk (8–20)', 'High Risk', 'High risk'],
  ] as const
).map(([band, src24, src25]) => ({
  band,
  y2023: null,
  y2024: asd.riskDist2024.find((r) => r.band.startsWith(src24))?.children ?? null,
  y2025: bothAges(src25),
}))

/** ASD place names in the by-wilayat / by-centre tables (2024 only). */
export const asdByWilayat2024 = asd.byWilayat2024.map((r) => ({ ...r, wilayat: placeName(r.wilayat) }))
export const asdByCenter2024 = asd.byCenter2024.map((r) => ({
  ...r,
  center: placeName(r.center),
  wilayat: placeName(r.wilayat),
}))

// =========================================================================
// Extra Child Health Register — 3 & 4-year visits (2025 workbook only)
// =========================================================================
export type VisitMetric = 'clerked' | 'target' | 'referred'
export const VISIT_METRIC_OPTIONS: { value: VisitMetric; label: string }[] = [
  { value: 'clerked', label: 'Seen' },
  { value: 'target', label: 'Target' },
  { value: 'referred', label: 'Referred' },
]

/** A centre's monthly figure for one metric; null when the month is blank. */
export const monthFigure = (c: VisitCentre, i: number, metric: VisitMetric): number | null =>
  c.monthly[i]?.[metric] ?? null

/** Long-form rows for the CSV: one per institution per month, both visits. */
export const visitCsv = (sheets: { label: string; sheet: VisitSheet }[]) => ({
  header: ['Visit', 'Institution', 'Wilayat', 'Name in workbook', 'Month', 'Target', 'Seen', 'Referred'],
  rows: sheets.flatMap(({ label, sheet }) =>
    sheet.centres.flatMap((c) => [
      ...MONTHS.map((month, i) => [
        label,
        c.name,
        c.wilayat,
        c.sourceName,
        month,
        monthFigure(c, i, 'target'),
        monthFigure(c, i, 'clerked'),
        monthFigure(c, i, 'referred'),
      ]),
      // The workbook's own annual columns: target is the annual cohort, not a sum of the months.
      [label, c.name, c.wilayat, c.sourceName, 'Workbook annual figures', c.target, c.clerked, c.referred],
    ]),
  ),
})

/**
 * 5-year-plan child indicators in nbg.json, for 2023 and 2024 only (null if
 * not a number there). The 5-year-plan table has no 2025 column.
 */
const fpChildValue = (indicator: string, key: 'y2023' | 'y2024'): number | null => {
  const v: Cell | undefined = fp.childIndicators.find((r) => r.indicator === indicator)?.[key]
  return typeof v === 'number' ? v : null
}

/** Safe Transport of the Critically Ill Child workshops, 2023 and 2024. */
export const safeTransportWorkshops = {
  y2023: fpChildValue('Safe Transport for Children Workshops', 'y2023'),
  y2024: fpChildValue('Safe Transport for Children Workshops', 'y2024'),
}

/** Programme capacity rows: 2023 and 2024 from the 5-year plan; 2025 not reported. */
const capacityRows = (rows: [label: string, indicator: string][]): DsYearRow[] =>
  rows.map(([label, indicator]) => ({
    label,
    y2023: fpChildValue(indicator, 'y2023'),
    y2024: fpChildValue(indicator, 'y2024'),
    y2025: null,
  }))

export const asdCapacityByYear = capacityRows([
  ['Health centres with staff trained in autism screening', 'Health Centers with Trained Staff for Autism Screening'],
])

export const dsCapacityByYear = capacityRows([
  ['Health centres providing Down syndrome follow-up', 'Health Centers for Down Syndrome Follow-up'],
  ['Health centres with staff trained for Down syndrome', 'Health Centers with Trained Staff for Down Syndrome'],
])
