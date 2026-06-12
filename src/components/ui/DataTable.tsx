import type { ReactNode } from 'react'

export interface Column {
  label: string
  align?: 'left' | 'right' | 'center'
  className?: string
}

interface DataTableProps {
  columns: Column[]
  /** Already-formatted cells (numbers, pills, etc.). One inner array per row. */
  rows: ReactNode[][]
  /** Optional bold totals/summary row pinned to the bottom. */
  total?: ReactNode[]
  /** Highlight a row index (e.g. governorate total within the body). */
  highlightRows?: number[]
  dense?: boolean
}

const alignClass = (a: Column['align']): string =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

/** Presentation-only table: views pass pre-formatted cells. */
export default function DataTable({
  columns,
  rows,
  total,
  highlightRows = [],
  dense = false,
}: DataTableProps) {
  const pad = dense ? 'px-3 py-2' : 'px-3.5 py-2.5'
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-glow/20">
            {columns.map((c, i) => (
              <th
                key={i}
                className={`${pad} ${alignClass(c.align)} font-display text-xs font-bold uppercase tracking-[0.08em] text-heading/75 ${c.className ?? ''}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-b border-line/10 transition-colors duration-200 hover:bg-tint/[0.07] ${
                highlightRows.includes(ri) ? 'bg-azure/[0.08] font-semibold' : ''
              }`}
            >
              {row.map((cellValue, ci) => (
                <td
                  key={ci}
                  className={`${pad} ${alignClass(columns[ci]?.align)} ${
                    ci === 0 ? 'font-medium text-ink' : 'text-ink/80'
                  } ${columns[ci]?.className ?? ''}`}
                >
                  {cellValue}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {total && (
          <tfoot>
            <tr className="border-t-2 border-line/20 bg-tint/[0.04]">
              {total.map((cellValue, ci) => (
                <td
                  key={ci}
                  className={`${pad} ${alignClass(columns[ci]?.align)} text-[0.84rem] font-bold text-heading`}
                >
                  {cellValue}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
