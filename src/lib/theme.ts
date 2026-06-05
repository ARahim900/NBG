/** Chart palette derived from the Ministry of Health Oman eHealth portal. */

export const C = {
  navy: '#144066',
  azure: '#2884c6',
  blue: '#0f6faf',
  teal: '#7cb6bc',
  tealDeep: '#3a7a82',
  gold: '#c08a1e',
  good: '#2e8b6f',
  alert: '#bf4d4a',
  ink: '#1a2733',
  grid: '#e2e9f0',
  muted: '#6b7a88',
} as const

/** Ordered palette for categorical series (pies, multi-series bars). */
export const SERIES = [
  C.navy,
  C.azure,
  C.teal,
  C.gold,
  C.tealDeep,
  C.good,
  C.blue,
  C.alert,
] as const

/** Per-year colour mapping used wherever 2023/2024/2025 appear together. */
export const YEAR_COLORS: Record<string, string> = {
  '2023': C.teal,
  '2024': C.azure,
  '2025': C.navy,
}
