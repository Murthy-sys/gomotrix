import Lenis from 'lenis'
import { state, set } from './store'
import { sceneIndexAt } from './world'

// Total scroll distance for the journey. Long enough that every scene gets room
// to breathe, short enough that the trip never feels like a chore.
export const SCROLL_VH = 1000

/** Detect what this machine can actually afford to render. */
export function detectQuality() {
  if (typeof window === 'undefined') return { quality: 'high', dpr: 1.5, reduced: false }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4

  let quality = 'high'
  if (mobile || cores <= 4 || mem <= 4) quality = 'medium'
  if ((mobile && cores <= 4) || cores <= 2 || mem <= 2) quality = 'low'

  // Capping DPR is the single biggest win on retina displays: a 3x buffer costs
  // 9x the fragments for a difference almost nobody can see through bloom.
  const cap = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1.25
  const dpr = Math.min(window.devicePixelRatio || 1, cap)

  return { quality, dpr, reduced, mobile }
}

let lenisRef = null

/**
 * Boots smooth scrolling, pointer tracking and the master clock.
 * Returns a teardown function.
 */
export function startEngine() {
  const { quality, dpr, reduced } = detectQuality()
  Object.assign(state, { quality, dpr, reduced })

  const lenis = new Lenis({
    duration: reduced ? 0.1 : 2.3,
    // Long, heavy exponential-out: momentum with a slow settle. This is where
    // most of the "expensive" feel of the scroll comes from.
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    smoothWheel: !reduced,
    syncTouch: false,
    touchMultiplier: 1.25,
    wheelMultiplier: 0.7,
  })
  lenisRef = lenis

  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

  // The journey opens mid-story (see store.js) rather than at the top, so the
  // native scroll position has to be moved to match before anything reads it —
  // otherwise the first real scroll event reports 0 and every value in `state`
  // snaps back to the void.
  lenis.scrollTo(state.progress * maxScroll(), { immediate: true })

  lenis.on('scroll', ({ scroll }) => {
    state.raw = Math.min(Math.max(scroll / maxScroll(), 0), 1)
  })

  const onPointer = (e) => {
    state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    state.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  // A touch drag should still tilt the world a little.
  const onTouch = (e) => {
    const t = e.touches && e.touches[0]
    if (t) onPointer(t)
  }

  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('touchmove', onTouch, { passive: true })

  // Dev-only handle. Programmatic window.scrollTo fights Lenis (it keeps its own
  // animated scroll value and snaps back on the next frame), so automated
  // checks need to drive Lenis directly.
  if (import.meta.env.DEV) {
    window.__uv = {
      state,
      lenis,
      jump(p) {
        lenis.scrollTo(p * maxScroll(), { immediate: true })
        state.raw = p
        state.progress = p
      },
    }
  }

  let raf
  let last = performance.now()
  let lastProgress = state.progress

  const tick = (time) => {
    raf = requestAnimationFrame(tick)
    lenis.raf(time)

    const dt = Math.min((time - last) / 1000, 0.05) // clamp: tab-switch guard
    last = time

    // A second, gentler smoothing pass on top of Lenis. Two-stage easing is
    // what stops the camera from ever tracking the wheel 1:1. A lower rate
    // constant here is the single biggest lever on "does this feel slow and
    // weighty" — it widens the lag between input and the world's response.
    const k = reduced ? 1 : 1 - Math.exp(-3.1 * dt)
    state.progress += (state.raw - state.progress) * k

    state.velocity = (state.progress - lastProgress) / (dt || 1 / 60)
    lastProgress = state.progress

    // Pointer inertia — the camera lags the cursor, it never snaps to it.
    const pk = 1 - Math.exp(-3.2 * dt)
    state.smooth.x += (state.pointer.x - state.smooth.x) * pk
    state.smooth.y += (state.pointer.y - state.smooth.y) * pk

    const scene = sceneIndexAt(state.progress)
    if (scene !== state.scene) set({ scene })
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    lenis.destroy()
    lenisRef = null
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('touchmove', onTouch)
  }
}

/**
 * Snap the native scroll (and state.raw/progress with it) to a 0..1 position
 * with no animation. Used once, the instant the preloader unlocks scroll, so
 * the journey opens already at its starting beat instead of visibly snapping
 * back to the top — `startEngine` tries this too, but it runs while the
 * preloader still has `overflow: hidden` applied, which some browsers ignore
 * programmatic scrollTo under, so this is the guaranteed-safe second call.
 */
export function syncScrollTo(p) {
  if (!lenisRef) return
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  lenisRef.scrollTo(p * max, { immediate: true })
  state.raw = p
  state.progress = p
}

/** Fly the page to a scene's scroll position, letting Lenis ease the travel. */
export function scrollToProgress(p, duration = 3.4) {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const top = p * max
  if (lenisRef) lenisRef.scrollTo(top, { duration, easing: (t) => 1 - Math.pow(1 - t, 5) })
  else window.scrollTo({ top, behavior: 'smooth' })
}
