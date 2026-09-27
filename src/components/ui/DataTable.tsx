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
  /** Pointer or keyboard focus entering (index) / leaving (null) a body row —
   *  lets a view link the table to a chart or map. */
  onRowHover?: (index: number | null) => void
  dense?: boolean
}

const alignClass = (a: Column['align']): string =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

/** On phones the row label stays pinned while the figures scroll sideways. */
const STICKY_FIRST =
  'max-sm:sticky max-sm:left-0 max-sm:z-[1] max-sm:bg-surface max-sm:shadow-[6px_0_8px_-6px_rgb(var(--shadow)/0.3)]'

/** Presentation-only table: views pass pre-formatted cells. */
export default function DataTable({
  columns,
  rows,
  total,
  highlightRows = [],
  onRowHover,
  dense = false,
}: DataTableProps) {
  const pad = dense ? 'px-3 py-2' : 'px-3.5 py-2.5'
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-glow/20">
            {columns.map((c, i) => (
              <th
                key={i}
                className={`${pad} ${alignClass(c.align)} text-eyebrow uppercase text-heading/75 ${i === 0 ? STICKY_FIRST : ''} ${c.className ?? ''}`}
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
              onMouseEnter={onRowHover && (() => onRowHover(ri))}
              onMouseLeave={onRowHover && (() => onRowHover(null))}
              className={`border-b border-line/10 transition-colors duration-200 hover:bg-tint/[0.07] ${
                highlightRows.includes(ri) ? 'bg-azure/[0.08] font-semibold' : ''
              }`}
            >
              {row.map((cellValue, ci) => (
                <td
                  key={ci}
                  className={`${pad} ${alignClass(columns[ci]?.align)} ${
                    ci === 0 ? `font-medium text-ink ${STICKY_FIRST}` : 'text-ink/80'
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
                  className={`${pad} ${alignClass(columns[ci]?.align)} text-[0.84rem] font-bold text-heading ${
                    ci === 0 ? STICKY_FIRST : ''
                  }`}
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
