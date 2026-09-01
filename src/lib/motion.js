import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registered once, here, so every consumer can just `import { gsap }` without
// worrying about plugin setup order.
gsap.registerPlugin(ScrollTrigger)

// Read once at module load, not per-call — cheap, and consistent with how the
// rest of the site (see universe/core/engine.js) treats reduced-motion as a
// boot-time decision rather than something to poll continuously.
export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Cursor-following pull on a single focal element. Clamped and eased so it
// never fully leaves its hit box — a hover cue, not a drag toy. Skipped on
// touch/coarse pointers (mousemove never fires meaningfully there) and for
// reduced-motion visitors. Returns a cleanup function.
export function magneticHover(el, strength = 0.28) {
  if (!el || reducedMotion) return () => {}
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return () => {}

  const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'elastic.out(1, 0.4)' })
  const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'elastic.out(1, 0.4)' })

  const onMove = (e) => {
    const r = el.getBoundingClientRect()
    xTo((e.clientX - r.left - r.width / 2) * strength)
    yTo((e.clientY - r.top - r.height / 2) * strength)
  }
  const onLeave = () => {
    xTo(0)
    yTo(0)
  }

  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)
  return () => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
    xTo(0)
    yTo(0)
  }
}

// Fonts/images below the fold can shift layout after ScrollTrigger has
// already measured trigger positions from their pre-load geometry. One
// refresh once everything has settled keeps every reveal's threshold honest.
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh())
}

export { gsap, ScrollTrigger }
