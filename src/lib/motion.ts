/**
 * Motion policy for an official dashboard: data is never hidden or animated.
 * Numbers render at their final value, charts draw without an entrance, and
 * the only movement is a short fade when the page changes. Everything is
 * instant when the OS asks for reduced motion.
 *
 * Fades use the browser's built-in Web Animations API, so no animation
 * library is downloaded.
 */

/** Central gate: every animation respects the OS setting. */
export const motionOK = (): boolean =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Page-change fade length (150–250 ms keeps changes traceable). */
export const FADE_MS = 200

const canAnimate = (el: HTMLElement): boolean =>
  motionOK() && typeof el.animate === 'function'

/** Fade an element in (opacity only). Returns a cleanup that cancels it. */
export function fadeIn(el: HTMLElement, ms = FADE_MS): () => void {
  if (!canAnimate(el)) return () => {}
  const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-out' })
  return () => anim.cancel()
}

/**
 * Fade an element out and keep it hidden. Resolves once the fade finishes
 * with a `release` function that makes the element visible again.
 */
export async function fadeOut(el: HTMLElement, ms = 150): Promise<() => void> {
  if (!canAnimate(el)) return () => {}
  const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: ms,
    easing: 'ease-in',
    fill: 'forwards',
  })
  try {
    await anim.finished
  } catch {
    /* cancelled — nothing to wait for */
  }
  return () => anim.cancel()
}

/** Scroll progress bar: scaleX follows document scroll. Returns cleanup. */
export function attachScrollProgress(el: HTMLElement): () => void {
  let frame = 0
  const update = () => {
    frame = 0
    const doc = document.documentElement
    const range = doc.scrollHeight - window.innerHeight
    el.style.transform = `scaleX(${range > 0 ? Math.min(window.scrollY / range, 1) : 0})`
  }
  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(update)
  }
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  return () => {
    if (frame) window.cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}
