import { fp, mc, sumBy } from './nbg'
import { anaemia } from './nutrition'
import { byWilayat, govOmani, notInSummary } from './population'

/**
 * 2025 service volumes by wilayat set against Omani denominators from the
 * 2025 population estimates. Shared by the Population view and the map.
 */

export const share = (part: number, whole: number): number =>
  whole ? (part / whole) * 100 : 0

/** A wilayat is flagged when a ratio falls this far below its benchmark. */
export const FLAG_BELOW = 0.75

export const ancGov = sumBy(mc.byWilayat2025, (w) => w.newAnc)
export const bsGov = sumBy(fp.contraceptive2025, (w) => w.birthSpacing)
/** Omani under-5 ÷ 5 — an approximation of births per year. */
export const cohortGov = govOmani.under5 / 5
export const ancRateGov = (ancGov / govOmani.women15to49) * 1000
export const bsRateGov = (bsGov / govOmani.women15to49) * 1000
export const targetPctGov = share(anaemia.gov.t9, cohortGov)

export interface ServiceRow {
  wilayat: string
  under5: number
  cohort: number
  target9: number | null
  targetPct: number | null
  wra: number
  anc: number | null
  ancRate: number | null
  bsRate: number | null
  flagged: boolean
}

export const services: ServiceRow[] = byWilayat.map((w) => {
  const anc = mc.byWilayat2025.find((x) => x.wilayat === w.wilayat)
  const bs = fp.contraceptive2025.find((x) => x.wilayat === w.wilayat)
  const an = anaemia.byWilayat.find((x) => x.wilayat === w.wilayat)
  const cohort = w.om.under5 / 5
  const wra = w.om.women15to49
  const targetPct = an ? share(an.t9, cohort) : null
  const ancRate = anc ? (anc.newAnc / wra) * 1000 : null
  const flagged =
    (targetPct !== null && targetPct < 100 * FLAG_BELOW) ||
    (ancRate !== null && ancRate < ancRateGov * FLAG_BELOW)
  return {
    wilayat: w.wilayat,
    under5: w.om.under5,
    cohort,
    target9: an?.t9 ?? null,
    targetPct,
    wra,
    anc: anc?.newAnc ?? null,
    ancRate,
    bsRate: bs ? (bs.birthSpacing / wra) * 1000 : null,
    flagged,
  }
})

export const flaggedNames = services.filter((s) => s.flagged).map((s) => s.wilayat)
/** New catchments inside a flagged wilayat — a likely cause of an inflated denominator. */
export const flaggedNew = notInSummary.filter((i) => flaggedNames.includes(i.wilayat))
