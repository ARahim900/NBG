import { useEffect, useRef, type RefObject } from 'react'
import { gsap, finePointer, motionOK } from './motion'

/**
 * Pointer-tracked 3D tilt: the element leans toward the cursor (max `range`
 * degrees) and eases back on leave. Desktop fine-pointers only.
 */
export function useTilt<T extends HTMLElement>(range = 7): RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !finePointer() || !motionOK()) return

    const xTo = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
    gsap.set(el, { transformPerspective: 700 })

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      xTo(px * range)
      yTo(-py * range)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [range])

  return ref
}

/**
 * Magnetic pull: the element drifts a fraction of the cursor offset while
 * hovered and springs back on leave. Use on CTAs & icon buttons.
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
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)' })
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
