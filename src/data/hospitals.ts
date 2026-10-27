/**
 * Hospitals whose catchment is a whole wilayat. Their catchment overlaps the
 * health-centre catchments in population.json, so they are listed beside the
 * centres and never added to population totals (that would double-count).
 */
export interface Hospital {
  en: string
  ar: string
  wilayat: string
}

export const HOSPITALS: Hospital[] = [
  { en: 'Al Suwaiq Hospital', ar: 'مستشفى السويق', wilayat: 'As Suwayq' },
]

export const hospitalsIn = (wilayat: string): Hospital[] =>
  HOSPITALS.filter((h) => h.wilayat === wilayat)
