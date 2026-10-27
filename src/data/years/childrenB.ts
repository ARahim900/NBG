import mpdsr from '../mpdsr2025.json'
import { ca, fp, sn, type Cell } from '../nbg'
import { ds2025 } from '../wch2025'

/**
 * 2023 / 2024 / 2025 views for the Children B dashboards (Newborn Screening,
 * Congenital Anomalies, Stillbirth & Neonatal). Every figure is read from
 * nbg.json or mpdsr2025.json; a year the sources do not provide stays `null`
 * ("No data supplied"), never 0. Views use these named rows and never index tuples.
 */

export type Year = '2023' | '2024' | '2025'
export const YEARS: Year[] = ['2023', '2024', '2025']
export const YEAR_OPTIONS = YEARS.map((y) => ({ value: y, label: y }))

/** One figure per year; null = no data supplied in any repo source. */
export interface ThreeYear {
  y2023: number | null
  y2024: number | null
  y2025: number | null
}

const num = (v: Cell | undefined): number | null => (typeof v === 'number' ? v : null)

// =========================================================================
// Newborn Screening
// =========================================================================
const nb2025 = (prefix: string): number | null =>
  fp.newborn2025.find((r) => r.metric.startsWith(prefix))?.value ?? null
const childInd = (name: string) => fp.childIndicators.find((r) => r.indicator === name)
const hearingIn = (y: Year) => fp.hearingTrend.find((r) => r.year === y)
const tshIn = (y: Year) => fp.tshTrend.find((r) => r.year === y)

/**
 * Screening coverage (%) 2019–2025. The trend tables store coverage, not
 * counts: hearing 2025 = 103 is the KPI-deck "103%" quoted in fp.note2025, and
 * TSH 2025 = 100 equals the 2025 "TSH Screening Coverage %" row.
 */
export const screeningCoverageTrend = fp.hearingTrend.map((h) => ({
  year: h.year,
  hearing: h.screened,
  tsh: fp.tshTrend.find((t) => t.year === h.year)?.screened ?? null,
}))

export interface ScreeningRow extends ThreeYear {
  metric: string
  isPct: boolean
}

const hearingCount = childInd('Newborns Screened for Hearing')
const thyroidCount = childInd('Newborns Screened for Thyroid')

/**
 * Newborn screening 2023–2025. 2023/2024 counts come from the 5-year-plan
 * indicators (same indicator as the 2025 "screened" counts); coverage and
 * referral / TSH-positive rows come from the 2019–2025 trend tables.
 */
export const screeningByYear: ScreeningRow[] = [
  {
    metric: 'Total live births (governorate)',
    isPct: false,
    y2023: null,
    y2024: null,
    y2025: nb2025('Total Live Births'),
  },
  {
    metric: 'Newborns screened for congenital hypothyroidism (TSH)',
    isPct: false,
    y2023: num(thyroidCount?.y2023),
    y2024: num(thyroidCount?.y2024),
    y2025: nb2025('Screened for Congenital'),
  },
  {
    metric: 'TSH screening coverage %',
    isPct: true,
    y2023: tshIn('2023')?.screened ?? null,
    y2024: tshIn('2024')?.screened ?? null,
    y2025: nb2025('TSH Screening Coverage'),
  },
  {
    metric: 'TSH-positive results',
    isPct: false,
    y2023: tshIn('2023')?.positive ?? null,
    y2024: tshIn('2024')?.positive ?? null,
    y2025: tshIn('2025')?.positive ?? null,
  },
  {
    metric: 'Initial cord TSH ≥ 40 mIU/L',
    isPct: false,
    y2023: null,
    y2024: null,
    y2025: nb2025('Initial cord'),
  },
  {
    metric: 'Confirmed congenital hypothyroidism cases',
    isPct: false,
    y2023: null,
    y2024: null,
    y2025: nb2025('Confirmed Congenital'),
  },
  {
    metric: 'Newborns screened for hearing',
    isPct: false,
    y2023: num(hearingCount?.y2023),
    y2024: num(hearingCount?.y2024),
    y2025: nb2025('Neonatal Hearing Screened'),
  },
  {
    metric: 'Hearing screening coverage %',
    isPct: true,
    y2023: hearingIn('2023')?.screened ?? null,
    y2024: hearingIn('2024')?.screened ?? null,
    y2025: nb2025('Hearing Screening Coverage'),
  },
  {
    metric: 'Hearing referrals',
    isPct: false,
    y2023: hearingIn('2023')?.referred ?? null,
    y2024: hearingIn('2024')?.referred ?? null,
    y2025: hearingIn('2025')?.referred ?? null,
  },
]

/**
 * 2025 values for the child 5-year-plan indicators. The two screening counts
 * map onto the 2025 newborn-screening rows; Down syndrome follow-up centres =
 * the clinics in the 2025 Down syndrome report; Safe Transport workshops = 1,
 * confirmed by the department (the update's 3 is the 2023–2025 total). Trained staff for Down syndrome = 6, confirmed by the department.
 */
const CHILD_INDICATOR_2025: Record<string, number | null> = {
  'Newborns Screened for Hearing': nb2025('Neonatal Hearing Screened'),
  'Newborns Screened for Thyroid': nb2025('Screened for Congenital'),
  'Health Centers for Down Syndrome Follow-up': ds2025.centres.length,
  // Confirmed by the department: all 6 clinics have trained staff in 2025.
  'Health Centers with Trained Staff for Down Syndrome': 6,
  'Safe Transport for Children Workshops': 1,
}
/** Qualifier shown after a 2025 value, e.g. "3 (department update)". */
const CHILD_INDICATOR_2025_SOURCE: Record<string, string> = {
}
/** Display label in British English; the JSON indicator names are unchanged. */
const ukIndicator = (label: string): string => label.replace(/\bCenters\b/g, 'Centres').replace(/\bCenter\b/g, 'Centre')

export const childIndicators3y = fp.childIndicators.map((r) => ({
  indicator: ukIndicator(r.indicator),
  y2023: r.y2023,
  y2024: r.y2024,
  y2025: CHILD_INDICATOR_2025[r.indicator] ?? null,
  y2025Source: CHILD_INDICATOR_2025_SOURCE[r.indicator] ?? null,
}))

// =========================================================================
// Congenital Anomalies
// =========================================================================
const caTotal = (y: Year): number | null =>
  ca.totalTrend.find((r) => r.year === y)?.value ?? null
const caSector = (y: Year) => ca.sectorPct.find((r) => r.year === y)

export const caTotals: ThreeYear = {
  y2023: caTotal('2023'),
  y2024: caTotal('2024'),
  y2025: caTotal('2025'),
}
export const caPublicShare: ThreeYear = {
  y2023: caSector('2023')?.moh ?? null,
  y2024: caSector('2024')?.moh ?? null,
  y2025: caSector('2025')?.moh ?? null,
}

/** Facility notifications; the source has no 2025 facility breakdown. */
export const caFacility3y = ca.byFacility.map((r) => ({
  facility: r.facility,
  y2023: r.y2023,
  y2024: r.y2024,
  y2025: null as number | null,
}))

/** Wilayat notifications; the source has no 2025 wilayat breakdown. */
export const caWilayat3y = ca.byWilayat.map((r) => ({
  wilayat: r.wilayat,
  y2023: r.y2023,
  y2024: r.y2024,
  y2025: null as number | null,
  change: r.change,
}))

/** Sector counts; 2025 is published only as a percentage split. */
export const caSector3y = ca.bySector
  .filter((r) => r.sector !== 'Total')
  .map((r) => ({
    sector: r.sector === 'Public' ? 'Public (MOH)' : r.sector,
    y2023: r.y2023,
    y2024: r.y2024,
    y2025: null as number | null,
  }))

// =========================================================================
// Stillbirth & Neonatal
// =========================================================================
export interface PerinatalMonth {
  month: string
  stillbirth: number
  end: number
  lnd: number
  total: number
}

/** 2025 MPDSR workbook records by reporting month (provisional). */
const mpdsrMonthly: PerinatalMonth[] = mpdsr.monthly.map((r) => ({
  month: r.month,
  stillbirth: r.stillbirth,
  end: r.earlyNeonatal,
  lnd: r.lateNeonatal,
  total: r.total,
}))

/** Monthly perinatal deaths per year; null = no monthly source for that year. */
export const perinatalMonthlyByYear: Record<Year, PerinatalMonth[] | null> = {
  '2023': null,
  '2024': sn.deckMonthly,
  '2025': mpdsrMonthly,
}

/** Monthly totals side by side (2023: no data supplied). */
export const perinatalMonthly3y = sn.deckMonthly.map((r) => ({
  month: r.month,
  y2023: null as number | null,
  y2024: r.total,
  y2025: mpdsrMonthly.find((m) => m.month === r.month)?.total ?? null,
}))

/**
 * "Cohort A" of year_totals equals the KPI-deck 2024 monthly table exactly
 * (stillbirth 67, early neonatal 39, late neonatal 7, total 113), so it is the
 * 2024 figure. The year of "Cohort B" (117) is not stated in any repo source.
 */
const cohortA = (cat: string): number | null =>
  sn.yearTotals.find((r) => r.category === cat)?.cohortA ?? null

export const perinatalTotals: ThreeYear = {
  y2023: null,
  y2024: cohortA('TOTAL'),
  y2025: mpdsr.summary.records,
}

/** Deaths by category, 2023–2025 (2025 = provisional workbook records). */
export const perinatalByCategory3y = [
  { category: 'Stillbirth', y2023: null, y2024: cohortA('Stillbirth'), y2025: mpdsr.summary.stillbirth },
  { category: 'Early neonatal', y2023: null, y2024: cohortA('Early Neonatal Death'), y2025: mpdsr.summary.earlyNeonatal },
  { category: 'Late neonatal', y2023: null, y2024: cohortA('Late Neonatal Death'), y2025: mpdsr.summary.lateNeonatal },
] satisfies ({ category: string } & ThreeYear)[]

/** 2025 headline from the WCH KPI presentation (differs from the 119 workbook rows). */
export const perinatalHeadline2025: number | null =
  sn.summary2025.find((r) => r.metric.startsWith('Total perinatal'))?.value ?? null

// -------------------------------------------------------------------------
// ICD-PM: 2024 codes matched to 2025 codes by DEFINITION, not by code.
// The 2025 workbook numbers some codes differently (2024 M1 = placenta, cord
// and membranes = 2025 M2; 2024 N6 = respiratory & cardiovascular = 2025 N7).
// A 2024 code with no definition, or "(none)", is not matched.
// -------------------------------------------------------------------------

/** Same loose comparison as the 2025 review: "&" = "and", case, punctuation, trailing digits. */
const normIcd = (d: string): string =>
  d
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s*\d+\s*$/, '')
    .replace(/[^a-z]+/g, ' ')
    .trim()

export interface IcdRow3y {
  code2024: string
  description: string
  y2023: null
  y2024: number
  /** 2025 final-code count for the code with the same definition; null = no matching definition. */
  y2025: number | null
  /** The 2025 code carrying that definition (may differ from the 2024 code). */
  code2025: string | null
}

const icd3y = (
  prefix: 'M' | 'A' | 'I' | 'N',
  rows2024: { code: string; count: number; description: string }[],
): IcdRow3y[] => {
  const table2025 = mpdsr.codeTables.find((t) => t.prefix === prefix)?.rows ?? []
  return rows2024.map((r) => {
    const def = normIcd(r.description)
    const usable = def !== '' && def !== 'none'
    const m = usable
      ? table2025.find((t) => {
          const d25 = normIcd(t.description)
          return d25 === def || d25.startsWith(`${def} `)
        })
      : undefined
    return {
      code2024: r.code,
      description: r.description,
      y2023: null,
      y2024: r.count,
      y2025: m ? m.finalCount : null,
      code2025: m ? m.code : null,
    }
  })
}

/** 2024 ICD-PM tables with the 2025 count of the same definition (2023: no data supplied). */
export const icdTables3y = [
  { title: 'Maternal Condition (M)', rows: icd3y('M', sn.icdMaternal.filter((r) => r.code !== 'Total')) },
  { title: 'Antepartum — Foetal (A)', rows: icd3y('A', sn.icdAntepartum.filter((r) => r.count > 0)) },
  { title: 'Intrapartum — Foetal (I)', rows: icd3y('I', sn.icdIntrapartum.filter((r) => r.count > 0)) },
  { title: 'Neonatal Death (N)', rows: icd3y('N', sn.icdNeonatal.filter((r) => r.count > 0)) },
]

/** "Cohort B" of year_totals, for the decision note (year not confirmed). */
export const cohortB = (cat: string): number | null =>
  sn.yearTotals.find((r) => r.category === cat)?.cohortB ?? null
