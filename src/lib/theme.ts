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

/**
 * Years are ordered, so they use one MOH-blue ramp, light → dark: older years
 * lighter, 2025 darkest. Validated as an ordinal ramp (monotone lightness,
 * visible steps, light end clears the surface). Teal and azure were too close
 * to tell apart, so teal is no longer a year colour.
 */
export const YEAR_COLORS: Record<string, string> = {
  '2023': '#7fb3e0',
  '2024': C.azure,
  '2025': C.navy,
}

/** The same ramp re-stepped for the dark surface: brightest = most recent. */
export const YEAR_COLORS_DARK: Record<string, string> = {
  '2023': '#2f6fa8',
  '2024': '#4aa3e6',
  '2025': '#9bbfe8',
}

/**
 * Series that are NOT years, in this fixed order (never cycled). The year
 * blues are kept out so a series is never mistaken for a year. The last slot
 * is a light grey for "other" or a remainder.
 */
export const METRIC = [C.navy, C.gold, C.tealDeep, '#b9c4d0'] as const

/** Status colours — only for states (medium/high risk, improved), never as series 4. */
export const STATUS = { medium: C.gold, high: C.alert, good: C.good } as const
