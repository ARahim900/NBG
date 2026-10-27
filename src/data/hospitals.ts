import { aggregate, institutionsIn, type Nationality, type Profile } from './population'

/**
 * Hospitals whose catchment is a whole wilayat. Their catchment overlaps the
 * health-centre catchments in population.json, so they are listed beside the
 * centres and never added to population totals (that would double-count).
 */
export interface Hospital {
  en: string
  ar: string
  /** Wilayat key as used in population.json (e.g. "As Suwayq"). */
  wilayat: string
  /** The wilayat as written in the request, shown beside the population spelling. */
  wilayatAlt?: string
}

export const HOSPITALS: Hospital[] = [
  { en: 'Al Suwaiq Hospital', ar: 'مستشفى السويق', wilayat: 'As Suwayq', wilayatAlt: 'Al Suwaiq' },
]

export const hospitalsIn = (wilayat: string): Hospital[] =>
  HOSPITALS.filter((h) => h.wilayat === wilayat)

/** "As Suwayq (Al Suwaiq)" — both spellings, so the page reads consistently. */
export const wilayatName = (h: Hospital): string =>
  h.wilayatAlt ? `${h.wilayat} (${h.wilayatAlt})` : h.wilayat

/** A wilayat hospital's catchment: every health-centre catchment in its wilayat. */
export const hospitalCatchment = (h: Hospital, nat: Nationality): Profile =>
  aggregate(institutionsIn(h.wilayat), nat)
