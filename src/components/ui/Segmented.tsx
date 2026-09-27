interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
}

/**
 * Compact single-choice toggle (e.g. All / Omani / Expatriate). Built on
 * native radio inputs so arrow-key navigation and screen-reader announcements
 * work without extra code.
 */
export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/55">
        {label}
      </legend>
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line/15 bg-mist/60 p-1">
        {options.map((o) => {
          const on = o.value === value
          return (
            <label
              key={o.value}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-azure/60 ${
                on ? 'bg-navy text-white shadow-sm' : 'text-ink/70 hover:bg-tint/10'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name={label}
                value={o.value}
                checked={on}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
