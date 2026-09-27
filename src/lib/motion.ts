import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Central gate: every decorative animation respects the OS setting. */
export const motionOK = (): boolean =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * View entrance: every `.card` / `[data-reveal]` inside `root` rises gently
 * into place as it enters the viewport, and any chart inside it draws in from
 * left to right. Elements already on screen stagger in immediately; the rest
 * reveal on scroll (once). Calm easing, no overshoot.
 *
 * Returns a cleanup that reverts all tweens & ScrollTriggers it created —
 * safe under React StrictMode double-invocation.
 */
/** Chart containers rendered by Recharts (present before they measure). */
const CHART = '.recharts-responsive-container'

export function animateViewIn(root: HTMLElement): () => void {
  // Only top-level targets animate — a card nested inside another reveal
  // container rides its parent's tween instead of double-animating.
  const targets = Array.from(
    root.querySelectorAll<HTMLElement>('.card, [data-reveal]'),
  ).filter((el) => {
    const ancestor = el.parentElement?.closest('.card, [data-reveal]')
    return !ancestor || !root.contains(ancestor)
  })

  if (!motionOK() || targets.length === 0) return () => {}

  const chartsIn = (els: Element[]) =>
    els.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>(CHART)))

  const ctx = gsap.context(() => {
    gsap.set(targets, { opacity: 0, y: 16 })
    gsap.set(chartsIn(targets), { clipPath: 'inset(0% 100% 0% 0%)' })
    ScrollTrigger.batch(targets, {
      start: 'top 94%',
      once: true,
      onEnter: (els) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
          overwrite: true,
          clearProps: 'transform',
        })
        gsap.to(chartsIn(els), {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.9,
          ease: 'power2.inOut',
          delay: 0.12,
          stagger: 0.05,
          clearProps: 'clipPath',
        })
      },
    })
    // Recharts containers measure themselves async — refresh trigger
    // positions once layout has settled so below-fold reveals fire on time.
    gsap.delayedCall(0.4, () => ScrollTrigger.refresh())
  }, root)

  return () => ctx.revert()
}

/**
 * Staggered "rise" for hero internals (badge → headline → meta → CTAs).
 * Targets direct children carrying `data-hero`. Returns cleanup.
 */
export function animateHero(root: HTMLElement): () => void {
  const items = root.querySelectorAll<HTMLElement>('[data-hero]')
  if (!motionOK() || items.length === 0) return () => {}
  const ctx = gsap.context(() => {
    gsap.fromTo(
      items,
      { opacity: 0, y: 34 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.1,
        clearProps: 'transform',
      },
    )
  }, root)
  return () => ctx.revert()
}

/** Scroll progress beam: scaleX follows document scroll. Returns cleanup. */
export function attachScrollProgress(el: HTMLElement): () => void {
  const st = ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate: (self) => {
      el.style.transform = `scaleX(${self.progress})`
    },
  })
  return () => st.kill()
}

export { gsap, ScrollTrigger }
