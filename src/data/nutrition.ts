import raw from './nutrition.json'

/**
 * Typed access for the 2025 child-nutrition & anaemia datasets, aggregated to
 * governorate / wilayat level from the per-health-centre source workbooks:
 *   • child malnutrition.xlsx  • feeding pattern.xlsx  • Anemia screening.xlsx
 * Governorate anaemia totals were validated against each sheet's own TOTAL row.
 */

type Cell = string | number
type Row = Cell[]

const db = raw as unknown as {
  malnutrition: { by_criteria: Row[]; by_wilayat: Row[]; gov_total_cases: number }
  feeding: { eb_by_milestone: Row[] }
  feedingDetail: Row[]
  anaemia: { by_wilayat: Row[]; gov: number[] }
  anaemiaFollowup: { by_wilayat: Row[]; gov: number[]; monthly: Row[] }
}

const n = (v: Cell): number => (typeof v === 'number' ? v : Number(v) || 0)
const s = (v: Cell): string => (typeof v === 'string' ? v : String(v))

export const nutrition = {
  malnutritionByCriteria: db.malnutrition.by_criteria.map((r) => ({
    criteria: s(r[0]),
    total: n(r[1]),
    newCases: n(r[2]),
    improved: n(r[3]),
  })),
  malnutritionByWilayat: db.malnutrition.by_wilayat.map((r) => ({
    wilayat: s(r[0]),
    cases: n(r[1]),
  })),
  malnutritionTotal: db.malnutrition.gov_total_cases,
  ebByMilestone: db.feeding.eb_by_milestone.map((r) => ({
    milestone: s(r[0]),
    eb: n(r[1]),
    total: n(r[2]),
    pct: n(r[3]),
  })),
  feedingByMilestone: db.feedingDetail.map((r) => ({
    milestone: s(r[0]),
    eb: n(r[1]),
    pb: n(r[2]),
    formula: n(r[3]),
    mixed: n(r[4]),
    total: n(r[5]),
    bottle: n(r[6]),
  })),
}

export const anaemiaFollowup = {
  byWilayat: db.anaemiaFollowup.by_wilayat.map((r) => ({
    wilayat: s(r[0]),
    cases: n(r[1]),
    iron: n(r[2]),
    cont3: n(r[3]),
    improved: n(r[4]),
  })),
  gov: {
    cases: db.anaemiaFollowup.gov[0],
    iron: db.anaemiaFollowup.gov[1],
    cont3: db.anaemiaFollowup.gov[2],
    improved: db.anaemiaFollowup.gov[3],
  },
  monthly: db.anaemiaFollowup.monthly.map((r) => ({
    month: s(r[0]),
    cases: n(r[1]),
    improved: n(r[2]),
  })),
}

export const anaemia = {
  byWilayat: db.anaemia.by_wilayat.map((r) => ({
    wilayat: s(r[0]),
    t9: n(r[1]),
    s9: n(r[2]),
    a9: n(r[3]),
    t18: n(r[4]),
    s18: n(r[5]),
    a18: n(r[6]),
  })),
  gov: {
    t9: db.anaemia.gov[0],
    s9: db.anaemia.gov[1],
    a9: db.anaemia.gov[2],
    t18: db.anaemia.gov[3],
    s18: db.anaemia.gov[4],
    a18: db.anaemia.gov[5],
  },
}
