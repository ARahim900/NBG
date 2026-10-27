import { aggregate, institutionsIn, type Nationality, type Profile } from './population'

/**
 * Hospitals listed beside the health centres. Every hospital's catchment is
 * its whole wilayat (for the referral hospitals, confirmed by the department
 * on 2026-10-28). Hospital catchments overlap the health-centre catchments
 * in population.json and are never added to population totals (that would
 * double-count).
 */
export interface Hospital {
  en: string
  ar: string
  kind: 'wilayat' | 'referral'
  /** Wilayat key as used in population.json (e.g. "As Suwayq"). */
  wilayat: string
  /** The wilayat as written in the request, shown beside the population spelling. */
  wilayatAlt?: string
}

export const HOSPITALS: Hospital[] = [
  { en: 'Sohar Hospital', ar: 'مستشفى صحار', kind: 'referral', wilayat: 'Sohar' },
  { en: 'Saham Hospital', ar: 'مستشفى صحم', kind: 'referral', wilayat: 'Saham' },
  { en: 'Al Suwaiq Hospital', ar: 'مستشفى السويق', kind: 'wilayat', wilayat: 'As Suwayq', wilayatAlt: 'Al Suwaiq' },
]

export const REFERRAL_HOSPITALS = HOSPITALS.filter((h) => h.kind === 'referral')
/** Wilayat (non-referral) hospitals. */
export const WILAYAT_HOSPITALS = HOSPITALS.filter((h) => h.kind === 'wilayat')

export const hospitalsIn = (wilayat: string): Hospital[] =>
  HOSPITALS.filter((h) => h.wilayat === wilayat)

/** "As Suwayq (Al Suwaiq)" — both spellings, so the page reads consistently. */
export const wilayatName = (h: Hospital): string =>
  h.wilayatAlt ? `${h.wilayat} (${h.wilayatAlt})` : h.wilayat

/** A hospital's catchment: every health-centre catchment in its wilayat. */
export const hospitalCatchment = (h: Hospital, nat: Nationality): Profile =>
  aggregate(institutionsIn(h.wilayat), nat)
