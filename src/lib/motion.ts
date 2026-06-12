import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Central gate: every decorative animation respects the OS setting. */
export const motionOK = (): boolean =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Fine-pointer desktop check for hover-driven effects (tilt, cursor…). */
export const finePointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

/**
 * Cinematic view entrance: every `.card` / `[data-reveal]` inside `root`
 * rises out of a blur as it enters the viewport. Elements already on screen
 * stagger in immediately; the rest reveal on scroll (once).
 *
 * Returns a cleanup that reverts all tweens & ScrollTriggers it created —
 * safe under React StrictMode double-invocation.
 */
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

  const ctx = gsap.context(() => {
    gsap.set(targets, { opacity: 0, y: 30, scale: 0.985 })
    ScrollTrigger.batch(targets, {
      start: 'top 94%',
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: true,
          clearProps: 'transform',
        }),
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
