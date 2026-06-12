import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, motionOK } from '../../lib/motion'

interface AnimatedNumberProps {
  /** A number, or an already-formatted string like "12,433" / "96.0%" / "19.3". */
  value: ReactNode
  className?: string
  /** Seconds. */
  duration?: number
}

interface Parsed {
  prefix: string
  target: number
  suffix: string
  decimals: number
  grouped: boolean
}

/** Pull the numeric core out of a formatted value, keeping its dressing. */
function parse(value: ReactNode): Parsed | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { prefix: '', target: value, suffix: '', decimals: 0, grouped: false }
  }
  if (typeof value !== 'string') return null
  const m = value.match(/^([^0-9-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/)
  if (!m) return null
  const raw = m[2]
  const target = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(target)) return null
  const dot = raw.indexOf('.')
  return {
    prefix: m[1],
    target,
    suffix: m[3],
    decimals: dot === -1 ? 0 : raw.length - dot - 1,
    grouped: raw.includes(','),
  }
}

/**
 * Counts a KPI value up from zero the first time it scrolls into view,
 * preserving the exact formatting it was given (separators, decimals, %…).
 * Falls back to a static render for non-numeric values or reduced motion.
 */
export default function AnimatedNumber({
  value,
  className,
  duration = 1.4,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const parsed = parse(value)

  useEffect(() => {
    const el = ref.current
    if (!el || !parsed || !motionOK()) return
    const { prefix, target, suffix, decimals, grouped } = parsed
    const fmt = (n: number) =>
      prefix +
      n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: grouped,
      }) +
      suffix

    const proxy = { v: 0 }
    el.textContent = fmt(0)
    const tween = gsap.to(proxy, {
      v: target,
      duration,
      ease: 'power3.out',
      paused: true,
      onUpdate: () => {
        el.textContent = fmt(proxy.v)
      },
    })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 96%',
      once: true,
      onEnter: () => tween.play(),
    })
    return () => {
      st.kill()
      tween.kill()
      el.textContent = fmt(target)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof value === 'object' ? null : value, duration])

  if (!parsed) return <span className={className}>{value}</span>
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
