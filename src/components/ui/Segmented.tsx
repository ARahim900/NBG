import { useLayoutEffect, useRef, useState } from 'react'

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

interface Thumb {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Compact single-choice toggle (e.g. All / Omani / Expatriate). Built on
 * native radio inputs so arrow keys and screen readers work without extra
 * code; the highlight glides to the chosen option.
 */
export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const wrap = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<Thumb | null>(null)

  // Measure the chosen option; re-measure when the control reflows (it wraps
  // onto two rows on narrow phones).
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => {
      const on = el.querySelector<HTMLElement>('[data-on="true"]')
      if (on) setThumb({ x: on.offsetLeft, y: on.offsetTop, w: on.offsetWidth, h: on.offsetHeight })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [value])

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-eyebrow uppercase text-ink/60">{label}</legend>
      <div
        ref={wrap}
        className="relative inline-flex flex-wrap gap-1 rounded-control border border-line/15 bg-mist/60 p-1"
      >
        {thumb && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 rounded-[4px] bg-navy shadow-sm transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              transform: `translate(${thumb.x}px, ${thumb.y}px)`,
              width: thumb.w,
              height: thumb.h,
            }}
          />
        )}
        {options.map((o) => {
          const on = o.value === value
          return (
            <label
              key={o.value}
              data-on={on}
              className={`relative z-[1] cursor-pointer rounded-[4px] px-3 py-1.5 text-label transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-azure/60 ${
                on ? `text-white ${thumb ? '' : 'bg-navy'}` : 'text-ink/70 hover:text-heading'
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
