import { useEffect, useRef, type RefObject } from 'react'
import { gsap, finePointer, motionOK } from './motion'

/**
 * Magnetic pull: the element drifts a fraction of the cursor offset while
 * hovered and eases back on leave (no overshoot). Use on CTAs.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.32): RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !finePointer() || !motionOK()) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' })
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.set(el, { clearProps: 'x,y' })
    }
  }, [strength])

  return ref
}
