/** Minimal CSV export — lets users take any table into Excel. */

type CsvCell = string | number | null | undefined

const escape = (v: CsvCell): string => {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = (header: string[], rows: CsvCell[][]): string =>
  [header, ...rows].map((r) => r.map(escape).join(',')).join('\r\n')

/**
 * Trigger a browser download. The leading byte-order mark makes Excel read the
 * file as UTF-8, so Arabic names are not garbled.
 */
export function downloadCsv(filename: string, header: string[], rows: CsvCell[][]): void {
  const blob = new Blob(['﻿' + toCsv(header, rows)], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser a moment to start the download before releasing the URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
