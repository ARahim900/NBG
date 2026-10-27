import { asd, ds, fp, mc, meta, mt, sumBy, type YearPoint } from '../nbg'
import mpdsr from '../mpdsr2025.json'
import ds2025 from '../downSyndrome2025.json'
import visits2025 from '../childVisits2025.json'
import mt2025 from '../maltreatment2025.json'
import type { ViewId } from '../../lib/dashboards'

/**
 * Three-year (2023 · 2024 · 2025) views of the governorate headline
 * indicators, read from the existing year series in nbg.json. A year the
 * source does not provide is null ("No data supplied") — never 0 and never
 * estimated.
 */

export const YEARS = ['2023', '2024', '2025'] as const
export type Year = (typeof YEARS)[number]
export type YearValues = Record<Year, number | null>

/** Value for one year of a year series, or null when the year is absent. */
const at = (points: YearPoint[], year: Year): number | null =>
  points.find((p) => p.year === year)?.value ?? null

const byYear = (points: YearPoint[]): YearValues => ({
  '2023': at(points, '2023'),
  '2024': at(points, '2024'),
  '2025': at(points, '2025'),
})

export interface HeadlineRow {
  label: string
  unit: 'count' | '%'
  values: YearValues
  /** Dashboard holding the detail. */
  view: ViewId
  /** Why a year is missing, shown beside the row. */
  gap?: string
}

/**
 * Down syndrome registered children: the sum of the six health-centre rows in
 * each year (2023 and 2024 "Total Cases" in nbg.json, column 1 of
 * ds.facilityHeaders; 2025 "registered" in the per-centre 2025 register).
 */
const dsRegistered: YearValues = {
  '2023': sumBy(ds.facilities2023, (r) => Number(r[1])),
  '2024': sumBy(ds.facilities2024, (r) => Number(r[1])),
  '2025': sumBy(ds2025.centres, (c) => c.registered),
}

export const HEADLINE: HeadlineRow[] = [
  { label: 'ANC bookings (registered)', unit: 'count', values: byYear(mc.ancTrend), view: 'mc' },
  { label: '1st-trimester booking', unit: '%', values: byYear(mc.bookingTrend), view: 'mc' },
  { label: 'Anaemia in pregnancy', unit: '%', values: byYear(mc.anaemiaTrend), view: 'mc' },
  { label: 'Gestational diabetes', unit: '%', values: byYear(mc.gdmTrend), view: 'mc' },
  { label: 'ASD 18-month coverage', unit: '%', values: byYear(asd.cov18Trend), view: 'asd' },
  {
    label: 'ASD 24-month coverage',
    unit: '%',
    values: byYear(asd.cov24Trend),
    view: 'asd',
    gap: '24-month screening began in 2024',
  },
  {
    label: 'Down syndrome registered children (sum of centres)',
    unit: 'count',
    values: dsRegistered,
    view: 'ds',
  },
  { label: 'Birth-spacing cases', unit: 'count', values: byYear(fp.birthSpacingTrend), view: 'fp' },
  { label: 'Premarital screening (couples)', unit: 'count', values: byYear(fp.premaritalTrend), view: 'fp' },
  { label: 'Child-maltreatment notifications', unit: 'count', values: byYear(mt.totalTrend), view: 'mt' },
  {
    label: 'Stillbirth & neonatal records',
    unit: 'count',
    values: { '2023': null, '2024': null, '2025': mpdsr.summary.records },
    view: 'sn',
    gap: '2025 is the provisional MPDSR workbook; no calendar-year totals for 2023 or 2024',
  },
]

/** Percentage indicators side by side, one bar per year (grouped-bar input). */
export const PERCENT_BY_YEAR = HEADLINE.filter((r) => r.unit === '%').map((r) => ({
  indicator: r.label,
  y2023: r.values['2023'],
  y2024: r.values['2024'],
  y2025: r.values['2025'],
}))

// ---- sources & notes ------------------------------------------------------
/**
 * nbg.json lists the sources it was built from; the three 2025 workbooks
 * added in this release carry their own file names in their JSON.
 */
export const SOURCES: [string, string][] = [
  ...meta.sources,
  ['2025 Down syndrome register by health centre with associated comorbidities', ds2025.source.filename],
  ['2025 3- and 4-year child-health visits by institution and month', visits2025.source.filename],
  ['2025 child-maltreatment notifications (wilayat, type, month, age, sex, institution)', mt2025.source.filename],
]

/**
 * Two nbg.json notes predate the 2025 Down syndrome register by health centre:
 * they are reworded here (British spelling kept) and nbg.json is left as is.
 */
const GRANULARITY_NOTE_PREFIX = 'Governorate granularity differs by indicator'
const COVERAGE_NOTE_PREFIX = '2025 now covers ASD'

export const NOTES: string[] = meta.notes.map((note) => {
  if (note.startsWith(GRANULARITY_NOTE_PREFIX))
    return 'Governorate granularity differs by indicator: 2023-2024 had per-health-centre detail for some dashboards; 2025 ASD is governorate-aggregate (per-centre 2025 not in the source files); 2025 Down syndrome is now reported by health centre (one centre per wilayat), 2025 3- and 4-year visits by institution, and 2025 maternal/contraceptive by wilayat.'
  if (note.startsWith(COVERAGE_NOTE_PREFIX))
    return note.replace(
      'Down Syndrome (governorate registry)',
      'Down syndrome (register by health centre with associated comorbidities)',
    )
  return note
})
