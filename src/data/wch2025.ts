import visitsRaw from './childVisits2025.json'
import dsRaw from './downSyndrome2025.json'
import mtRaw from './maltreatment2025.json'

/**
 * Typed access for the 2025 department workbooks imported by
 * scripts/build_wch_2025.py (3 & 4-year visits, Down syndrome registry,
 * maltreatment notifications). Figures are exactly as reported; anything the
 * import found inconsistent is listed in each dataset's `flags`.
 */

interface Source {
  filename: string
  sha256: string
  sheets: string[]
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ---- 3 & 4-year visits -----------------------------------------------------
interface MonthFigures {
  target: number | null
  clerked: number | null
  referred: number | null
}

export interface VisitCentre {
  sourceRow: number
  sourceName: string
  name: string
  wilayat: string
  target: number
  clerked: number
  referred: number
  monthly: (MonthFigures | null)[]
}

export interface VisitSheet {
  centres: VisitCentre[]
  statedTotals: { target: number; clerked: number; referred: number }
  monthlyClerked: number[]
  flags: string[]
}

export const visits2025 = visitsRaw as {
  source: Source
  year: number
  months: string[]
  three: VisitSheet
  four: VisitSheet
}

/** Visits as a % of the target cohort; null when there is no target. */
export const coverage = (clerked: number, target: number): number | null =>
  target > 0 ? (clerked / target) * 100 : null

/** Target, visits and referrals summed per wilayat, in coastal order. */
export const visitsByWilayat = (sheet: VisitSheet) => {
  const rows: { wilayat: string; target: number; clerked: number; referred: number }[] = []
  for (const c of sheet.centres) {
    let row = rows.find((r) => r.wilayat === c.wilayat)
    if (!row) {
      row = { wilayat: c.wilayat, target: 0, clerked: 0, referred: 0 }
      rows.push(row)
    }
    row.target += c.target
    row.clerked += c.clerked
    row.referred += c.referred
  }
  return rows
}

// ---- Down syndrome registry ---------------------------------------------------
export interface DsComorbidities {
  cardiac: number
  earsHearing: number
  ophthalmic: number
  hypothyroidism: number
  hyperthyroidism: number
  diabetes: number
  haematological: number
  underweight: number
  normalWeight: number
  overweight: number
  developmentalDelay: number
  noDevelopmentalDelay: number
  gastrointestinal: number
}

export interface DsCentre {
  name: string
  wilayat: string
  newCases: number
  registered: number
  age0to5: number
  age6to12: number
  age13to18: number
  male: number
  female: number
  comorbidities: DsComorbidities
}

export const ds2025 = dsRaw as {
  source: Source
  year: number
  focalPoints: { doctors: number; nurses: number }
  centres: DsCentre[]
  flags: string[]
}

const sumCentres = (pick: (c: DsCentre) => number): number =>
  ds2025.centres.reduce((acc, c) => acc + pick(c), 0)

const COMORBIDITY_KEYS = Object.keys(ds2025.centres[0]?.comorbidities ?? {}) as (keyof DsComorbidities)[]

/** Governorate totals across the six clinics. */
export const dsTotals = {
  newCases: sumCentres((c) => c.newCases),
  registered: sumCentres((c) => c.registered),
  age0to5: sumCentres((c) => c.age0to5),
  age6to12: sumCentres((c) => c.age6to12),
  age13to18: sumCentres((c) => c.age13to18),
  male: sumCentres((c) => c.male),
  female: sumCentres((c) => c.female),
  comorbidities: Object.fromEntries(
    COMORBIDITY_KEYS.map((k) => [k, sumCentres((c) => c.comorbidities[k])]),
  ) as Record<keyof DsComorbidities, number>,
}

/** Associated conditions shown on the dashboard, in the workbook's order. */
export const DS_CONDITIONS: { key: keyof DsComorbidities; label: string }[] = [
  { key: 'cardiac', label: 'Cardiac' },
  { key: 'earsHearing', label: 'Ears & hearing' },
  { key: 'ophthalmic', label: 'Ophthalmic' },
  { key: 'hypothyroidism', label: 'Hypothyroidism' },
  { key: 'hyperthyroidism', label: 'Hyperthyroidism' },
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'haematological', label: 'Haematological' },
  { key: 'developmentalDelay', label: 'Developmental delay' },
  { key: 'gastrointestinal', label: 'Gastrointestinal' },
]

// ---- Child maltreatment notifications (aggregates only) -----------------------
export type MtType = 'Neglect' | 'Physical abuse' | 'Sexual abuse' | 'Emotional abuse' | 'Others'

export const mt2025 = mtRaw as {
  source: Source
  year: number
  total: number
  omani: number
  types: MtType[]
  byWilayat: ({ wilayat: string; count: number } & Record<MtType, number>)[]
  byType: { type: MtType; count: number }[]
  byMonth: number[]
  byAge: { band: string; count: number }[]
  bySex: { sex: string; count: number }[]
  byInstitution: { institution: string; wilayat: string; count: number }[]
}
