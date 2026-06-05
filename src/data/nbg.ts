import raw from './nbg.json'

/**
 * Typed access layer for the NBG Women & Child Health database.
 *
 * The underlying JSON stores each table as an array of tuples (the same shape
 * the Excel/JSON generator produced). This module is the SINGLE place where the
 * positional tuples are mapped onto named, strongly-typed objects, using the
 * exact column headers defined in build_nbg_db.py. Views never touch raw indices.
 */

export type Cell = string | number
type Row = Cell[]

const db = raw as unknown as {
  meta: RawMeta
  asd: Record<string, Row[]> & { y2025_note: string }
  ds: {
    facilities: { headers: string[]; '2023': Row[]; '2024': Row[] }
    morbidities: { '2023': Row[]; '2024': Row[] }
    nutritional_status: { '2023': Row[]; '2024': Row[] }
    monthly_2024: Row[]
    year_comparison: Row[]
    gov_2025: Row[]
    y2025_note: string
  }
  md: Record<string, Row[]> & { y2025_note: string }
  mt: Record<string, Row[]>
  ca: Record<string, Row[]> & { y2025_note: string }
  sn: Record<string, Row[]>
  mc: Record<string, Row[]>
  fp: Record<string, Row[]> & { y2025_note: string }
}

interface RawMeta {
  title: string
  full_title_en: string
  governorate: string
  years: string
  created_by: string
  source_authority: string
  source_url: string
  extracted_on: string
  wilayats: string[]
  dashboards: { id: string; code: string; name: string; route: string }[]
  sources: [string, string][]
  notes: string[]
}

// ---- helpers -------------------------------------------------------------
const n = (v: Cell): number => (typeof v === 'number' ? v : Number(v) || 0)
const s = (v: Cell): string => (typeof v === 'string' ? v : String(v))
/** Treat empty string / "N/A" as a real gap (null) rather than zero. */
const opt = (v: Cell): number | null =>
  v === '' || v === 'N/A' || v == null ? null : n(v)

export const meta = db.meta

export interface YearPoint {
  year: string
  value: number
}
export const xy = (rows: Row[]): YearPoint[] =>
  rows.map((r) => ({ year: s(r[0]), value: n(r[1]) }))

// =========================================================================
// ASD — Early Screening (18 & 24 month)
// =========================================================================
export const asd = {
  monthly2024: db.asd.monthly_2024.map((r) => ({
    month: s(r[0]),
    screened18: n(r[1]),
    screened24: n(r[2]),
    cov18: n(r[3]),
    cov24: n(r[4]),
    med18: n(r[5]),
    high18: n(r[6]),
    med24: n(r[7]),
    high24: n(r[8]),
  })),
  monthly2025: db.asd.monthly_2025.map((r) => ({
    month: s(r[0]),
    visits18: n(r[1]),
    screened18: n(r[2]),
    cov18: n(r[3]),
    visits24: n(r[4]),
    screened24: n(r[5]),
    cov24: n(r[6]),
  })),
  byWilayat2024: db.asd.by_wilayat_2024.map((r) => ({
    wilayat: s(r[0]),
    screened18: n(r[1]),
    screened24: n(r[2]),
    cov18: n(r[3]),
    cov24: n(r[4]),
  })),
  byCenter2024: db.asd.by_health_center_2024.map((r) => ({
    center: s(r[0]),
    screened18: n(r[1]),
    screened24: n(r[2]),
    wilayat: s(r[3]),
    medium: n(r[4]),
    high: n(r[5]),
  })),
  riskDist2024: db.asd.risk_distribution_2024.map((r) => ({
    band: s(r[0]),
    children: n(r[1]),
  })),
  cov18Trend: xy(db.asd.coverage18_trend),
  cov24Trend: xy(db.asd.coverage24_trend),
  positiveTrend: xy(db.asd.positive_trend),
  risk18Trend: db.asd.risk18_trend.map((r) => ({
    year: s(r[0]),
    medium: n(r[1]),
    high: n(r[2]),
  })),
  risk24Trend: db.asd.risk24_trend.map((r) => ({
    year: s(r[0]),
    medium: n(r[1]),
    high: n(r[2]),
  })),
  summary2025: db.asd.summary_2025.map((r) => ({
    metric: s(r[0]),
    m18: n(r[1]),
    m24: n(r[2]),
  })),
  note2025: db.asd.y2025_note,
}

// =========================================================================
// Down Syndrome
// =========================================================================
export const ds = {
  facilityHeaders: db.ds.facilities.headers,
  facilities2023: db.ds.facilities['2023'],
  facilities2024: db.ds.facilities['2024'],
  yearComparison: db.ds.year_comparison.map((r) => ({
    center: s(r[0]),
    y2023: n(r[1]),
    y2024: n(r[2]),
  })),
  morbidities: (year: '2023' | '2024') =>
    db.ds.morbidities[year].map((r) => ({
      label: s(r[0]),
      count: n(r[1]),
      pct: n(r[2]),
    })),
  nutrition: (year: '2023' | '2024') =>
    db.ds.nutritional_status[year].map((r) => ({
      label: s(r[0]),
      count: n(r[1]),
      pct: n(r[2]),
    })),
  monthly2024: db.ds.monthly_2024.map((r) => ({
    month: s(r[0]),
    newCases: n(r[1]),
    assessments: n(r[2]),
  })),
  gov2025: db.ds.gov_2025.map((r) => ({ metric: s(r[0]), value: n(r[1]) })),
  note2025: db.ds.y2025_note,
}

// =========================================================================
// Maternal Deaths
// =========================================================================
export const md = {
  byYear: db.md.by_year.map((r) => ({ year: s(r[0]), deaths: n(r[1]) })),
  causesCount: db.md.causes_count.map((r) => ({
    cause: s(r[0]),
    deaths: n(r[1]),
  })),
  causesPct: db.md.causes_pct.map((r) => ({ cause: s(r[0]), pct: n(r[1]) })),
  recent: db.md.recent_records.map((r) => ({
    year: s(r[0]),
    date: s(r[1]),
    cause: s(r[2]),
    facility: s(r[3]),
  })),
  note2025: db.md.y2025_note,
}

// =========================================================================
// Child Maltreatment
// =========================================================================
export const mt = {
  byWilayat: db.mt.notifications_by_wilayat.map((r) => ({
    wilayat: s(r[0]),
    y2023: n(r[1]),
    y2024: n(r[2]),
    pct2023: n(r[3]),
    pct2024: n(r[4]),
    change: n(r[5]),
  })),
  totalTrend: xy(db.mt.total_trend),
  wilayatPct: db.mt.wilayat_pct.map((r) => ({
    wilayat: s(r[0]),
    y2023: n(r[1]),
    y2024: n(r[2]),
    y2025: n(r[3]),
  })),
  typePct: db.mt.type_pct.map((r) => ({
    type: s(r[0]),
    y2024: n(r[1]),
    y2025: n(r[2]),
  })),
}

// =========================================================================
// Congenital Anomalies
// =========================================================================
export const ca = {
  byWilayat: db.ca.by_wilayat.map((r) => ({
    wilayat: s(r[0]),
    y2023: n(r[1]),
    y2024: n(r[2]),
    pct2023: n(r[3]),
    pct2024: n(r[4]),
    change: n(r[5]),
  })),
  byFacility: db.ca.by_facility.map((r) => ({
    facility: s(r[0]),
    y2023: n(r[1]),
    y2024: n(r[2]),
    pct2023: n(r[3]),
    pct2024: n(r[4]),
    change: n(r[5]),
  })),
  bySector: db.ca.by_sector.map((r) => ({
    sector: s(r[0]),
    y2023: n(r[1]),
    y2024: n(r[2]),
  })),
  totalTrend: xy(db.ca.total_trend),
  sectorPct: db.ca.sector_pct.map((r) => ({
    year: s(r[0]),
    moh: n(r[1]),
    private: n(r[2]),
  })),
  note2025: db.ca.y2025_note,
}

// =========================================================================
// Stillbirth & Neonatal
// =========================================================================
const mapPerinatal = (rows: Row[]) =>
  rows.map((r) => ({
    month: s(r[0]),
    stillbirth: n(r[1]),
    end: n(r[2]),
    lnd: n(r[3]),
    total: n(r[4]),
  }))
const mapIcd = (rows: Row[]) =>
  rows.map((r) => ({ code: s(r[0]), count: n(r[1]), description: s(r[2]) }))

export const sn = {
  webMonthly: mapPerinatal(db.sn.web_monthly_detail),
  deckMonthly: mapPerinatal(db.sn.deck_monthly_2024),
  yearTotals: db.sn.year_totals.map((r) => ({
    category: s(r[0]),
    cohortA: n(r[1]),
    cohortB: n(r[2]),
  })),
  icdMaternal: mapIcd(db.sn.icd_maternal_2024),
  icdAntepartum: mapIcd(db.sn.icd_antepartum_2024),
  icdIntrapartum: mapIcd(db.sn.icd_intrapartum_2024),
  icdNeonatal: mapIcd(db.sn.icd_neonatal_2024),
  summary2025: db.sn.y2025_summary.map((r) => ({
    metric: s(r[0]),
    value: n(r[1]),
  })),
}

// =========================================================================
// Maternal Care
// =========================================================================
export const mc = {
  indicators: db.mc.indicators.map((r) => ({
    indicator: s(r[0]),
    y2023: opt(r[1]),
    y2024: opt(r[2]),
    y2025: opt(r[3]),
  })),
  deliveryMethods2024: db.mc.delivery_methods_2024.map((r) => ({
    method: s(r[0]),
    count: n(r[1]),
    pct: n(r[2]),
  })),
  ancTrend: xy(db.mc.anc_trend),
  bookingTrend: xy(db.mc.booking_trend),
  anaemiaTrend: xy(db.mc.anaemia_trend),
  gdmTrend: xy(db.mc.gdm_trend),
  byWilayat2025: db.mc.by_wilayat_2025.map((r) => ({
    wilayat: s(r[0]),
    newAnc: n(r[1]),
    firstTri: n(r[2]),
    anaemia: n(r[3]),
    pnc2: n(r[4]),
    pnc6: n(r[5]),
    pih: n(r[6]),
    infertility: n(r[7]),
    influenza: n(r[8]),
  })),
}

// =========================================================================
// Family Planning / 5-Year Plan Indicators
// =========================================================================
export const fp = {
  indicators: db.fp.indicators.map((r) => ({
    indicator: s(r[0]),
    y2023: r[1],
    y2024: r[2],
  })),
  birthSpacingTrend: xy(db.fp.birth_spacing_trend),
  iucdTrend: xy(db.fp.iucd_trend),
  implanonTrend: xy(db.fp.implanon_trend),
  premaritalTrend: xy(db.fp.premarital_trend),
  hearingTrend: db.fp.hearing_trend.map((r) => ({
    year: s(r[0]),
    screened: n(r[1]),
    referred: n(r[2]),
  })),
  tshTrend: db.fp.tsh_trend.map((r) => ({
    year: s(r[0]),
    screened: n(r[1]),
    positive: n(r[2]),
  })),
  contraceptive2025: db.fp.contraceptive_2025.map((r) => ({
    wilayat: s(r[0]),
    iucd: n(r[1]),
    implanon: n(r[2]),
    birthSpacing: n(r[3]),
  })),
  newborn2025: db.fp.newborn_2025.map((r) => ({
    metric: s(r[0]),
    value: n(r[1]),
  })),
  visitCoverage2025: db.fp.visit_coverage_2025.map((r) => ({
    visit: s(r[0]),
    due: n(r[1]),
    screened: n(r[2]),
    coverage: n(r[3]),
  })),
  note2025: db.fp.y2025_note,
}

// ---- shared sum helper for table totals ---------------------------------
export const sumBy = <T>(rows: T[], key: (r: T) => number): number =>
  rows.reduce((acc, r) => acc + key(r), 0)
