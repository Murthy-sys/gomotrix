import Lenis from 'lenis'
import { state, set } from './store'
import { sceneIndexAt } from './world'
import { createSnap, STOPS } from './snap'

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
let snapRef = null

// ─────────────────────────────────────────────────────────────────────────────
// Journey scroll space.
//
// The camera spline is driven by the height of the journey's own spacer, NOT by
// the height of the document. The business story track that follows the journey
// adds thousands of pixels below it; measuring the document would compress the
// entire eight-scene flight into the top fraction of the page and leave the
// camera stranded mid-spline while the user reads. Measuring the spacer keeps
// the flight pixel-for-pixel identical to what it was before the track existed,
// and simply parks the camera on its last keyframe once the story begins.
// ─────────────────────────────────────────────────────────────────────────────

let journeyMaxCache = 0

function measureJourney() {
  const spacer = document.querySelector('.uv-scroll')
  const h = spacer ? spacer.offsetHeight : (SCROLL_VH / 100) * window.innerHeight
  journeyMaxCache = Math.max(1, h - window.innerHeight)
  return journeyMaxCache
}

/** Scroll distance, in px, that the camera flight occupies. Cached; resize-aware. */
function journeyMax() {
  return journeyMaxCache || measureJourney()
}

/**
 * Boots smooth scrolling, pointer tracking and the master clock.
 * Returns a teardown function.
 */
export function startEngine() {
  const { quality, dpr, reduced } = detectQuality()
  Object.assign(state, { quality, dpr, reduced })

  // Lenis now scrolls the PROSE ONLY. Inside the journey the snap controller
  // owns the scroll position and Lenis is stopped, so these numbers describe
  // reading a long page, not flying a camera: the old 2.3s settle with a heavy
  // exponential-out put roughly a third of a second between the scrollbar and
  // the page, which is most of what read as "not in sync".
  const lenis = new Lenis({
    duration: reduced ? 0.1 : 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: !reduced,
    syncTouch: false,
    touchMultiplier: 1.25,
    wheelMultiplier: 1,
  })
  lenisRef = lenis

  measureJourney()
  state.scroll = window.scrollY || 0

  // The journey opens mid-story (see store.js) rather than at the top, so the
  // native scroll position has to be moved to match before anything reads it —
  // otherwise the first real scroll event reports 0 and every value in `state`
  // snaps back to the void.
  lenis.scrollTo(state.progress * journeyMax(), { immediate: true })

  // The journey is scrolled by the snap controller, not by Lenis. Stopping
  // Lenis here means exactly one thing is writing the scroll position at a
  // time — two smooth scrollers fighting over window.scrollY was the other
  // half of the out-of-sync feel.
  const snap = createSnap({ lenis, journeyMax, reduced })
  snapRef = snap
  lenis.stop()

  const onResize = () => {
    measureJourney()
  }
  window.addEventListener('resize', onResize, { passive: true })

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

  // Dev-only handle. Inside the journey Lenis is stopped and the snap
  // controller owns the scroll position, so automated checks drive it — a bare
  // window.scrollTo would be pulled back onto the nearest stop a frame later.
  if (import.meta.env.DEV) {
    window.__uv = {
      state,
      lenis,
      snap,
      stops: STOPS,
      jump(p) {
        window.scrollTo(0, p * journeyMax())
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

    // The native scroll position is the single source of truth, in both modes:
    // the snap controller writes it with window.scrollTo, Lenis writes it for
    // the prose. Reading it here rather than subscribing to Lenis means the
    // camera cannot go stale while Lenis is stopped.
    snap.update(dt)
    state.scroll = window.scrollY
    // Clamped, so scrolling on into the story track holds the camera on its
    // final keyframe instead of running off the end of the spline.
    state.raw = Math.min(Math.max(state.scroll / journeyMax(), 0), 1)

    // A second smoothing pass on top of the scroll value. It exists to take the
    // stair-step out of a dragged scrollbar and a coarse wheel — NOT to add
    // weight, which is now the snap tween's job. The old rate constant of 3.1
    // (~320ms of lag) meant the camera was still drifting long after the scroll
    // had stopped; while a snap is running we track it almost exactly, so the
    // camera arrives and settles with the tween instead of after it.
    const rate = reduced ? Infinity : snap.locked ? 15 : 7
    const k = reduced ? 1 : 1 - Math.exp(-rate * dt)
    state.progress += (state.raw - state.progress) * k

    state.velocity = (state.progress - lastProgress) / (dt || 1 / 60)
    lastProgress = state.progress

    // Pointer inertia — the camera lags the cursor, it never snaps to it.
    const pk = 1 - Math.exp(-3.2 * dt)
    state.smooth.x += (state.pointer.x - state.smooth.x) * pk
    state.smooth.y += (state.pointer.y - state.smooth.y) * pk

    const scene = sceneIndexAt(state.progress)
    if (scene !== state.scene) set({ scene })

    // Where the reader is relative to the story track. Derived here rather than
    // from an IntersectionObserver because an instant jump — an anchor link, a
    // restored scroll position — can step clean over a sentinel without ever
    // changing its intersection state, and then the journey's pinned overlays
    // stay pinned over the reader's page. This runs off the scroll value
    // itself, so there is no position it can miss.
    const past = state.scroll - journeyMax()
    const story = past > 0
    const covered = past >= window.innerHeight
    if (story !== state.story || covered !== state.covered) set({ story, covered })
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    snap.destroy()
    snapRef = null
    lenis.destroy()
    lenisRef = null
    window.removeEventListener('resize', onResize)
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
  window.scrollTo(0, p * journeyMax())
  state.scroll = window.scrollY
  state.raw = p
  state.progress = p
}

/**
 * Fly the camera to a point on the journey — the in-world CTAs use this.
 * Goes through the snap controller so the arrival is not immediately undone by
 * the settle-to-nearest-stop rule; the CTA targets in overlay/copy.js are
 * already scene rest points, so this lands exactly on one.
 */
export function scrollToProgress(p, duration = 1.8) {
  if (snapRef) snapRef.toProgress(p, duration)
  else window.scrollTo({ top: p * journeyMax(), behavior: 'smooth' })
}

/**
 * Fly the page to a DOM node in the story track below the journey. Lenis owns
 * the scroll position, so a native `scrollIntoView` would be fought and undone
 * on the next frame.
 */
export function scrollToElement(target, { duration = 1.6, offset } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  // The header is fixed and has no height in the flow, so an exact landing puts
  // the section's kicker underneath it. Back off by its height (capped, so a
  // short viewport does not lose a third of the screen to the allowance).
  const clear = offset ?? -Math.min(96, window.innerHeight * 0.12)
  // Everything reachable this way lives in the prose below the journey, so the
  // snap controller has to let go of the wheel first — otherwise it would pull
  // the reader back onto a scene rest point mid-flight.
  snapRef?.release({ programmatic: true })
  if (lenisRef) {
    lenisRef.scrollTo(el, { duration, offset: clear, easing: (t) => 1 - Math.pow(1 - t, 4) })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
