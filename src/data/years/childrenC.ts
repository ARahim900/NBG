import type { Series } from '../../components/charts/Charts'
import { YEAR_COLORS } from '../../lib/theme'
import { int, pct } from '../../lib/format'
import { mt } from '../nbg'
import { MONTHS, mt2025 } from '../wch2025'
import { anaemia, anaemiaFollowup, nutrition } from '../nutrition'

/**
 * 2023 / 2024 / 2025 views for the Children department pages (maltreatment,
 * nutrition, breastfeeding, anaemia). Every chart and table on those pages
 * shows all three years; a year the repository has no figure for is `null`
 * and is labelled "Not reported" — never 0, never estimated.
 *
 * What the repository holds:
 *   • Maltreatment — totals 2019–2025 and wilayat counts 2023–2025 (nbg.json +
 *     maltreatment2025.json); type split 2024 (% only, KPI deck) and 2025
 *     (counts); month, age, sex and institution 2025 only.
 *   • Nutrition, breastfeeding, child anaemia — 2025 only (nutrition.json).
 */

export const YEARS = ['2023', '2024', '2025'] as const
export type Year = (typeof YEARS)[number]
export type YearKey = `y${Year}`
export type ByYear = Record<YearKey, number | null>

export const NOT_REPORTED = 'Not reported'
export const YEAR_OPTIONS = YEARS.map((y) => ({ value: y, label: y }))

export const yearKey = (y: Year): YearKey => `y${y}`

/** A 2025-only figure laid out across the three years. */
const only2025 = (v: number | null): ByYear => ({ y2023: null, y2024: null, y2025: v })

/** a ÷ b as a percentage; null when there is nothing to divide by. */
export const ratio = (a: number, b: number): number | null => (b ? (a / b) * 100 : null)

/** Table cell for a possibly-missing figure. */
export const yearCell = (v: number | null, fmt: (n: number) => string = int): string =>
  v === null ? NOT_REPORTED : fmt(v)

/** Percentage cell with one decimal, or "Not reported". */
export const pctCell = (v: number | null): string => yearCell(v, (x) => pct(x))

/** Years that carry at least one figure in these rows. */
export const reportedYears = (rows: ByYear[]): Year[] =>
  YEARS.filter((y) => rows.some((r) => r[yearKey(y)] !== null))

/**
 * One grouped-bar / line series per year in YEAR_COLORS. A year with no figure
 * stays in the legend, named "… not reported", so the gap is visible.
 */
export function yearSeries(rows: ByYear[]): Series[] {
  const have = reportedYears(rows)
  return YEARS.map((y) => ({
    key: yearKey(y),
    name: have.includes(y) ? y : `${y} · ${NOT_REPORTED.toLowerCase()}`,
    color: YEAR_COLORS[y],
  }))
}

/** "2023 and 2024" style list of the years these rows do not provide. */
export function missingYears(rows: ByYear[]): string {
  const have = reportedYears(rows)
  const gap = YEARS.filter((y) => !have.includes(y))
  return gap.length <= 1 ? (gap[0] ?? '') : `${gap.slice(0, -1).join(', ')} and ${gap[gap.length - 1]}`
}

// ===========================================================================
// Child maltreatment
// ===========================================================================
const share2025 = (v: number): number => (v / mt2025.total) * 100
const typeKey = (t: string): string => t.toLowerCase().replace(/ abuse$/, '')

/** Totals 2023–2025 from the 2019–2025 trend. */
export const mtTotals: ByYear = {
  y2023: mt.totalTrend.find((r) => r.year === '2023')?.value ?? null,
  y2024: mt.totalTrend.find((r) => r.year === '2024')?.value ?? null,
  y2025: mt.totalTrend.find((r) => r.year === '2025')?.value ?? null,
}

/** Counts per wilayat; 2023–2024 from the KPI deck, 2025 from the notification register. */
export const mtByWilayat: ({ wilayat: string } & ByYear)[] = mt.byWilayat.map((r) => ({
  wilayat: r.wilayat,
  y2023: r.y2023,
  y2024: r.y2024,
  y2025: mt2025.byWilayat.find((w) => w.wilayat === r.wilayat)?.count ?? null,
}))

/**
 * Type split as % of each year's notifications. 2024 is the KPI deck's own
 * percentage; 2025 is each type's count over the 2025 total. The source has
 * no 2023 split. Names match one-to-one ("Physical Abuse" = "Physical abuse").
 */
export const mtTypePct: ({ type: string; count2025: number } & ByYear)[] = mt2025.byType.map((t) => ({
  type: t.type,
  count2025: t.count,
  y2023: null,
  y2024: mt.typePct2024.find((r) => typeKey(r.type) === typeKey(t.type))?.y2024 ?? null,
  y2025: Number(share2025(t.count).toFixed(1)),
}))

/** Largest type in each year that reports a split. */
export const mtTopType = (y: YearKey): { type: string; value: number } | null =>
  mtTypePct.reduce<{ type: string; value: number } | null>((best, r) => {
    const v = r[y]
    return v !== null && (best === null || v > best.value) ? { type: r.type, value: v } : best
  }, null)

/** Wilayat with the most notifications in a year. */
export const mtTopWilayat = (y: YearKey): { wilayat: string; value: number } | null =>
  mtByWilayat.reduce<{ wilayat: string; value: number } | null>((best, r) => {
    const v = r[y]
    return v !== null && (best === null || v > best.value) ? { wilayat: r.wilayat, value: v } : best
  }, null)

/** Monthly notifications; the register gives months for 2025 only. */
export const mtMonthly: ({ month: string } & ByYear)[] = MONTHS.map((month, i) => ({
  month,
  ...only2025(mt2025.byMonth[i] ?? null),
}))

/** Age at notification; 2025 only. */
export const mtByAge: ({ band: string } & ByYear)[] = mt2025.byAge.map((a) => ({
  band: a.band,
  ...only2025(a.count),
}))

// ===========================================================================
// Child nutrition (malnutrition)
// ===========================================================================
/** Source spells some categories as two words or capitalises them; show them consistently. */
const CRITERIA_LABELS: Record<string, string> = {
  'Severe Wasting': 'Severe wasting',
  'Under weight': 'Underweight',
  'Over weight': 'Overweight',
}

export const malByCategory: ({ criteria: string; label: string; newCases: number; improved: number } & ByYear)[] =
  nutrition.malnutritionByCriteria.map((c) => ({
    criteria: c.criteria,
    label: CRITERIA_LABELS[c.criteria] ?? c.criteria,
    newCases: c.newCases,
    improved: c.improved,
    ...only2025(c.total),
  }))

export const malByWilayat: ({ wilayat: string } & ByYear)[] = nutrition.malnutritionByWilayat.map((w) => ({
  wilayat: w.wilayat,
  ...only2025(w.cases),
}))

export const malTotal: ByYear = only2025(nutrition.malnutritionTotal)

// ===========================================================================
// Breastfeeding
// ===========================================================================
/** Exclusive-breastfeeding rate (%) by child age. */
export const ebRateByAge: ({ milestone: string; eb: number; total: number } & ByYear)[] =
  nutrition.ebByMilestone.map((m) => ({
    milestone: m.milestone,
    eb: m.eb,
    total: m.total,
    ...only2025(m.pct),
  }))

/** Feeding composition by age, keyed by year; only 2025 is in the source. */
export const feedingByYear: Record<Year, typeof nutrition.feedingByMilestone | null> = {
  '2023': null,
  '2024': null,
  '2025': nutrition.feedingByMilestone,
}

// ===========================================================================
// Child anaemia
// ===========================================================================
export type ScreenAge = '9' | '18'

/**
 * Per-wilayat rate across the years: coverage = % of target screened,
 * prevalence = % of screened children found anaemic.
 */
export const anaemiaRateByWilayat = (
  age: ScreenAge,
  metric: 'coverage' | 'prevalence',
): ({ wilayat: string } & ByYear)[] =>
  anaemia.byWilayat.map((w) => {
    const [t, s, a] = age === '9' ? [w.t9, w.s9, w.a9] : [w.t18, w.s18, w.a18]
    return { wilayat: w.wilayat, ...only2025(metric === 'coverage' ? ratio(s, t) : ratio(a, s)) }
  })

/** Screened vs anaemic counts per wilayat, keyed by year; only 2025 is in the source. */
export const anaemiaCountsByYear = (age: ScreenAge, y: Year) =>
  y !== '2025'
    ? null
    : anaemia.byWilayat.map((w) => ({
        wilayat: w.wilayat,
        screened: age === '9' ? w.s9 : w.s18,
        anaemic: age === '9' ? w.a9 : w.a18,
      }))

const g = anaemia.gov
const fu = anaemiaFollowup.gov

/** Governorate indicators across the three years (the source covers 2025). */
export const anaemiaGovByYear: { indicator: string; unit: '%' | 'n'; v: ByYear }[] = [
  { indicator: '9-month target', unit: 'n', v: only2025(g.t9) },
  { indicator: '9-month screened', unit: 'n', v: only2025(g.s9) },
  { indicator: '9-month coverage', unit: '%', v: only2025(ratio(g.s9, g.t9)) },
  { indicator: '9-month anaemic', unit: 'n', v: only2025(g.a9) },
  { indicator: '9-month prevalence', unit: '%', v: only2025(ratio(g.a9, g.s9)) },
  { indicator: '18-month target', unit: 'n', v: only2025(g.t18) },
  { indicator: '18-month screened', unit: 'n', v: only2025(g.s18) },
  { indicator: '18-month coverage', unit: '%', v: only2025(ratio(g.s18, g.t18)) },
  { indicator: '18-month anaemic', unit: 'n', v: only2025(g.a18) },
  { indicator: '18-month prevalence', unit: '%', v: only2025(ratio(g.a18, g.s18)) },
  { indicator: 'Anaemic cases followed', unit: 'n', v: only2025(fu.cases) },
  { indicator: 'Received iron', unit: 'n', v: only2025(fu.iron) },
  { indicator: 'Continued iron 3 months', unit: 'n', v: only2025(fu.cont3) },
  { indicator: 'Improved', unit: 'n', v: only2025(fu.improved) },
]

/** Headline governorate rates for the grouped-bar comparison. */
export const anaemiaHeadline: ({ indicator: string } & ByYear)[] = [
  { indicator: '9m coverage', ...only2025(ratio(g.s9, g.t9)) },
  { indicator: '9m prevalence', ...only2025(ratio(g.a9, g.s9)) },
  { indicator: '18m coverage', ...only2025(ratio(g.s18, g.t18)) },
  { indicator: '18m prevalence', ...only2025(ratio(g.a18, g.s18)) },
]

/** Follow-up register views keyed by year; only 2025 is in the source. */
export const followupByYear: Record<Year, typeof anaemiaFollowup | null> = {
  '2023': null,
  '2024': null,
  '2025': anaemiaFollowup,
}
