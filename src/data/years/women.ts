import { fp, mc, md, sn, type Cell, type YearPoint } from '../nbg'
import mpdsr from '../mpdsr2025.json'

/**
 * Three-year (2023 / 2024 / 2025) views of the Women's & Reproductive Health
 * data. Every figure here is read from nbg.json or mpdsr2025.json through the
 * typed accessors; nothing is estimated. A year the source does not provide is
 * `null` ("Not reported"), never 0.
 */

export const YEARS = ['2023', '2024', '2025'] as const
export type Year = (typeof YEARS)[number]

export const YEAR_OPTIONS: { value: Year; label: string }[] = YEARS.map((y) => ({
  value: y,
  label: y,
}))

/** One row of a 2023/2024/2025 comparison; null = not reported that year. */
export interface ThreeYearRow {
  label: string
  y2023: number | null
  y2024: number | null
  y2025: number | null
}

/** British spelling for labels that arrive from the source in US form. */
export const ukLabel = (label: string): string =>
  label
    .replace(/Cesarean/g, 'Caesarean')
    .replace(/cesarean/g, 'caesarean')
    .replace(/Hemorrhage/g, 'Haemorrhage')
    .replace(/Center/g, 'Centre')
    .replace(/center/g, 'centre')

/** Value of a year in a trend series, or null when the year is absent. */
export const trendValue = (trend: YearPoint[], year: Year): number | null =>
  trend.find((p) => p.year === year)?.value ?? null

/** "2023 12,549 · 2024 12,754" — earlier-year context for a 2025 KPI card. */
export const priorYearsHint = (trend: YearPoint[], fmt: (v: number) => string): string =>
  (['2023', '2024'] as const)
    .map((y) => {
      const v = trendValue(trend, y)
      return `${y} ${v == null ? 'not reported' : fmt(v)}`
    })
    .join(' · ')

// =========================================================================
// Maternal Care
// =========================================================================
const mcRow = (indicator: string) => mc.indicators.find((r) => r.indicator === indicator)

/**
 * Deliveries by method, 2023–2025, from the maternal-care indicator table
 * (the same figures as the 2024-only delivery-method table).
 */
export const mcDeliveries: ThreeYearRow[] = [
  { label: 'Total deliveries', indicator: 'Total Deliveries' },
  { label: 'Normal', indicator: 'Natural (Normal) Deliveries' },
  { label: 'Caesarean', indicator: 'Cesarean Deliveries' },
  { label: 'Outside a facility', indicator: 'Deliveries Outside Health Facility' },
].map(({ label, indicator }) => {
  const r = mcRow(indicator)
  return { label, y2023: r?.y2023 ?? null, y2024: r?.y2024 ?? null, y2025: r?.y2025 ?? null }
})

export interface McWilayatRow {
  wilayat: string
  newAnc: number | null
  firstTri: number | null
  anaemia: number | null
  pnc2: number | null
  pnc6: number | null
  pih: number | null
  infertility: number | null
  influenza: number | null
}

const MC_EMPTY = {
  newAnc: null,
  firstTri: null,
  anaemia: null,
  pnc2: null,
  pnc6: null,
  pih: null,
  infertility: null,
  influenza: null,
} as const

const sumOrNull = <T>(rows: T[], key: (r: T) => number | null): number | null =>
  rows.length === 0 ? null : rows.reduce((acc, r) => acc + (key(r) ?? 0), 0)

/**
 * Maternal care by wilayat for one year. Only 2025 is broken down by wilayat
 * in the source; 2023 and 2024 keep the wilayat rows as not reported and take
 * the governorate total from the indicator table where the indicator matches
 * exactly (registrations, 1st-trimester bookings, anaemia cases).
 */
export const mcByWilayat = (year: Year): { rows: McWilayatRow[]; total: McWilayatRow } => {
  if (year === '2025') {
    const rows: McWilayatRow[] = mc.byWilayat2025
    return {
      rows,
      total: {
        wilayat: 'GOVERNORATE',
        newAnc: sumOrNull(rows, (r) => r.newAnc),
        firstTri: sumOrNull(rows, (r) => r.firstTri),
        anaemia: sumOrNull(rows, (r) => r.anaemia),
        pnc2: sumOrNull(rows, (r) => r.pnc2),
        pnc6: sumOrNull(rows, (r) => r.pnc6),
        pih: sumOrNull(rows, (r) => r.pih),
        infertility: sumOrNull(rows, (r) => r.infertility),
        influenza: sumOrNull(rows, (r) => r.influenza),
      },
    }
  }
  const key = year === '2023' ? 'y2023' : 'y2024'
  const gov = (indicator: string): number | null => mcRow(indicator)?.[key] ?? null
  return {
    rows: mc.byWilayat2025.map((r) => ({ wilayat: r.wilayat, ...MC_EMPTY })),
    total: {
      wilayat: 'GOVERNORATE',
      ...MC_EMPTY,
      newAnc: gov('Registered Pregnant Women / ANC Booking'),
      firstTri: gov('First Trimester Booking (count)'),
      anaemia: gov('Anaemia in Pregnancy (cases)'),
    },
  }
}

// =========================================================================
// Maternal Deaths
// =========================================================================
/** Deaths by year with 2025 kept on the axis as not reported. */
export const mdByYear: { year: string; deaths: number | null }[] = [
  ...md.byYear,
  ...(md.byYear.some((r) => r.year === '2025') ? [] : [{ year: '2025', deaths: null }]),
]

export const mdDeaths = (year: Year): number | null =>
  mdByYear.find((r) => r.year === year)?.deaths ?? null

/** Recorded cause(s) for a year from the recent-records table, if any. */
export const mdCause = (year: Year): string | null => {
  const causes = md.recent.filter((r) => r.year === year).map((r) => r.cause)
  return causes.length ? causes.join('; ') : null
}

// =========================================================================
// Family Planning
// =========================================================================
/** Women's 5-year-plan indicators with a 2025 column (not in any source). */
export const fpIndicators: {
  indicator: string
  y2023: Cell
  y2024: Cell
  y2025: Cell | null
}[] = fp.indicators.map((r) => ({
  indicator: r.indicator,
  y2023: r.y2023,
  y2024: r.y2024,
  y2025: null,
}))

export interface FpWilayatRow {
  wilayat: string
  iucd: number | null
  implanon: number | null
  birthSpacing: number | null
}

/**
 * Contraceptive uptake by wilayat for one year. Only 2025 is broken down by
 * wilayat. For 2023 and 2024 the governorate birth-spacing total comes from the
 * birth-spacing trend (its 2025 value equals the 2025 wilayat sum, 2,953);
 * IUCD and Implanon counts are not reported for those years.
 */
export const fpByWilayat = (year: Year): { rows: FpWilayatRow[]; total: FpWilayatRow } => {
  if (year === '2025') {
    const rows: FpWilayatRow[] = fp.contraceptive2025
    return {
      rows,
      total: {
        wilayat: 'GOVERNORATE',
        iucd: sumOrNull(rows, (r) => r.iucd),
        implanon: sumOrNull(rows, (r) => r.implanon),
        birthSpacing: sumOrNull(rows, (r) => r.birthSpacing),
      },
    }
  }
  return {
    rows: fp.contraceptive2025.map((r) => ({
      wilayat: r.wilayat,
      iucd: null,
      implanon: null,
      birthSpacing: null,
    })),
    total: {
      wilayat: 'GOVERNORATE',
      iucd: null,
      implanon: null,
      birthSpacing: trendValue(fp.birthSpacingTrend, year),
    },
  }
}

// =========================================================================
// Stillbirth & neonatal (MPDSR report)
// =========================================================================
export interface PerinatalMonth {
  month: string
  stillbirth: number
  early: number
  late: number
  total: number
}

/**
 * Monthly perinatal deaths for one year: 2025 = provisional MPDSR workbook
 * records; 2024 = KPI-deck final surveillance series; 2023 = not in the repo.
 */
export const perinatalMonthly = (year: Year): PerinatalMonth[] | null => {
  if (year === '2025')
    return mpdsr.monthly.map((r) => ({
      month: r.month,
      stillbirth: r.stillbirth,
      early: r.earlyNeonatal,
      late: r.lateNeonatal,
      total: r.total,
    }))
  if (year === '2024')
    return sn.deckMonthly.map((r) => ({
      month: r.month,
      stillbirth: r.stillbirth,
      early: r.end,
      late: r.lnd,
      total: r.total,
    }))
  return null
}

const ICD_2024: Record<string, { code: string; count: number; description: string }[]> = {
  M: sn.icdMaternal,
  A: sn.icdAntepartum,
  I: sn.icdIntrapartum,
  N: sn.icdNeonatal,
}

/** 2024 ICD-PM row for an exact code (e.g. "A3"); null when not in the 2024 table. */
export const icd2024 = (
  prefix: string,
  code: string,
): { count: number; description: string } | null => {
  const r = ICD_2024[prefix]?.find((row) => row.code === code)
  return r ? { count: r.count, description: r.description } : null
}

/** Compare ICD-PM definitions loosely: "&" vs "and", case, punctuation, trailing digits. */
const normDef = (d: string): string =>
  d
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s*\d+\s*$/, '')
    .replace(/[^a-z]+/g, ' ')
    .trim()

/**
 * How a 2024 ICD-PM count lines up with a 2025 code definition.
 * - `match`: same code, same definition in both dictionaries.
 * - `unstated`: same code, but the 2024 table gives no definition for it.
 * - `conflict`: same code, different definition — the 2024 count is withheld.
 * - `absent`: code not in the 2024 table.
 */
export type IcdMatch =
  | { kind: 'match' | 'unstated'; count: number }
  | { kind: 'conflict'; count: number; description2024: string }
  | { kind: 'absent' }

export const icd2024Against = (prefix: string, code: string, description2025: string): IcdMatch => {
  const r = icd2024(prefix, code)
  if (!r) return { kind: 'absent' }
  const d = r.description.trim()
  if (d === '') return { kind: 'unstated', count: r.count }
  // A 2024 label that is a shortened form of the 2025 one (A1 "Congenital
  // malformations, deformations") is the same category; anything else — including
  // the 2024 sheet's "(none)" for M2 — is treated as a different definition.
  const a = normDef(d)
  const b = normDef(description2025)
  return a === b || b.startsWith(`${a} `)
    ? { kind: 'match', count: r.count }
    : { kind: 'conflict', count: r.count, description2024: d }
}

/** The 2024 table's own total for a prefix (sum of every 2024 code row; excludes the "Total" row). */
export const icd2024Total = (prefix: string): number | null => {
  const rows = ICD_2024[prefix]?.filter((r) => r.code !== 'Total')
  return rows && rows.length ? rows.reduce((acc, r) => acc + r.count, 0) : null
}

/** 2024 KPI-deck perinatal totals (sum of the deck monthly series), for 2025 tile context. */
export const perinatal2024Totals = (() => {
  const rows = perinatalMonthly('2024') ?? []
  const sum = (key: 'stillbirth' | 'early' | 'late' | 'total'): number =>
    rows.reduce((acc, r) => acc + r[key], 0)
  return { total: sum('total'), stillbirth: sum('stillbirth'), early: sum('early'), late: sum('late') }
})()
