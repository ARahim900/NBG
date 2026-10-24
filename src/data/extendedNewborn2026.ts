import source from './extendedNewborn2026.json'

interface InstitutionReport {
  sourceRow: number
  sourceName: string
  name: string
  omaniDeliveries: number
  nonOmaniDeliveries: number
  deliveries: number
  omaniScreened: number
  nonOmaniScreened: number
  screened: number
  received: number
  rejected: number
  omaniScreeningRatio: number | null
}

interface ExtendedNewbornData {
  source: { filename: string; sha256: string; sheet: string; range: string; periodLabel: string }
  period: { start: string; end: string }
  institutions: InstitutionReport[]
}

export const extendedNewborn: ExtendedNewbornData = source
export const institutions = extendedNewborn.institutions
export const newbornTotals = institutions.reduce((totals, row) => ({
  deliveries: totals.deliveries + row.deliveries,
  screened: totals.screened + row.screened,
  received: totals.received + row.received,
  rejected: totals.rejected + row.rejected,
  omaniDeliveries: totals.omaniDeliveries + row.omaniDeliveries,
  nonOmaniDeliveries: totals.nonOmaniDeliveries + row.nonOmaniDeliveries,
  omaniScreened: totals.omaniScreened + row.omaniScreened,
  nonOmaniScreened: totals.nonOmaniScreened + row.nonOmaniScreened,
}), { deliveries: 0, screened: 0, received: 0, rejected: 0, omaniDeliveries: 0, nonOmaniDeliveries: 0, omaniScreened: 0, nonOmaniScreened: 0 })

export const rejectionRate = (received: number, rejected: number): number | null =>
  received > 0 ? rejected / received * 100 : null
