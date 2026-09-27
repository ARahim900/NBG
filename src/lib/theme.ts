/**
 * Chart palette from the Ministry of Health Oman branded template
 * (DS Conf – MOH Branded): navy #144066, MOH blue #0089DD, teal #4FA8B2,
 * body text #36465A, muted #7C8BA0, MOH red #D91C45. Flat colours only.
 */

export const C = {
  navy: '#144066',
  azure: '#0089dd',
  blue: '#0a6aa8',
  teal: '#4fa8b2',
  tealDeep: '#2d7f88',
  gold: '#c08a1e',
  good: '#26ad9e',
  alert: '#d91c45',
  ink: '#36465a',
  grid: '#d7eaf9',
  muted: '#7c8ba0',
} as const

/**
 * Ordered palette for categorical series (pies, multi-series bars). The first
 * four are the template's main colours; neighbours are chosen so similar
 * blues and teals never sit side by side.
 */
export const SERIES = [
  C.navy,
  C.azure,
  C.gold,
  C.teal,
  C.alert,
  C.tealDeep,
  C.blue,
  C.good,
] as const

/** Per-year colour mapping used wherever 2023/2024/2025 appear together. */
export const YEAR_COLORS: Record<string, string> = {
  '2023': C.teal,
  '2024': C.azure,
  '2025': C.navy,
}
