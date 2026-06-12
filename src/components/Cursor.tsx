import { useEffect, useRef } from 'react'
import { gsap, finePointer, motionOK } from '../lib/motion'

const INTERACTIVE = 'a, button, [role="button"], [role="switch"], [data-cursor]'

/**
 * Desktop-only custom cursor: a crisp dot with a lagging halo ring that
 * swells over interactive elements. Blend-mode difference keeps it visible
 * on both themes. No-op on touch devices & under reduced motion.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring || !finePointer() || !motionOK()) return

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 })
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.38, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.38, ease: 'power3.out' })

    let shown = false
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 })
      }
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE)
      ring.classList.toggle('is-active', Boolean(hit))
    }
    const leave = () => {
      shown = false
      gsap.to([dot, ring], { opacity: 0, duration: 0.25 })
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden lg:block" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring hidden lg:block" aria-hidden="true" />
    </>
  )
}
