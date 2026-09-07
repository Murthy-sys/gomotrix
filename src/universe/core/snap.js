import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import { STOPS, EPS, STORY, resolveStop, nearestStop } from './stops'

gsap.registerPlugin(Observer)

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SNAPPING
//
// The journey used to be a free scroll: the wheel moved the camera continuously
// along the spline and the reader could stop anywhere, including halfway between
// two scenes with nothing composed on screen. This turns it into a projector.
// One gesture advances exactly one scene and stops there — never two, never a
// fraction of one — and the scrollbar, a swipe and the arrow keys all land on
// the same rest points.
//
// Why GSAP's Observer rather than raw wheel listeners: a trackpad flick emits
// dozens of wheel events with wildly varying deltas, and a phone emits a stream
// of touchmoves. Observer collapses both into one normalised gesture with a
// tolerance, which is exactly the "one flick, one section" contract. The tween
// is a plain GSAP tween on a proxy that writes window.scrollTo, so the easing is
// ours and the whole motion is one interruptible object.
//
// Which stop a gesture resolves to lives in stops.js, where Node can test it.
// ─────────────────────────────────────────────────────────────────────────────

export { STOPS } from './stops'

/**
 * @param {object} o
 * @param {import('lenis').default} o.lenis  Owns scrolling for the story track only.
 * @param {() => number} o.journeyMax        Scroll px the journey occupies.
 * @param {boolean} o.reduced                prefers-reduced-motion.
 */
export function createSnap({ lenis, journeyMax, reduced }) {
  // 'journey' — we own the wheel and land on stops.
  // 'story'   — Lenis owns the wheel and the reader scrolls prose freely.
  let mode = 'journey'
  let locked = false
  let tween = null
  let idle = 0
  let lastY = typeof window === 'undefined' ? 0 : window.scrollY

  const px = (p) => p * journeyMax()
  const endY = () => journeyMax()
  /** The stops in px, recomputed per use so a resize is picked up for free. */
  const stopsPx = () => STOPS.map(px)

  /** Tween the native scroll position. Lenis is stopped in journey mode, so
   *  window.scrollTo is uncontested and the easing below is the only easing. */
  const glide = (y, { duration = 1.05, ease = 'power2.inOut', onDone } = {}) => {
    tween?.kill()
    const target = Math.max(0, Math.round(y))

    if (reduced) {
      window.scrollTo(0, target)
      onDone?.()
      return
    }

    locked = true
    const proxy = { y: window.scrollY }
    tween = gsap.to(proxy, {
      y: target,
      duration,
      ease,
      overwrite: true,
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: () => {
        tween = null
        window.scrollTo(0, target)
        // A short cooldown after landing. Without it the tail of the same
        // trackpad flick — which keeps emitting events for a few hundred ms
        // after the fingers lift — reads as a second gesture and skips a scene.
        gsap.delayedCall(0.1, () => {
          locked = false
        })
        onDone?.()
      },
    })
  }

  /** Hand the wheel back to Lenis so the prose below scrolls normally. */
  const release = () => {
    if (mode === 'story') return
    mode = 'story'
    observer.disable()
    lenis.start()
  }

  const toStory = () => {
    glide(endY(), { duration: 0.85, ease: 'power2.out', onDone: release })
  }

  /** Move exactly one stop. See `resolveStop` for why it is not nearest+dir. */
  const step = (dir) => {
    if (locked || mode !== 'journey') return
    const at = resolveStop(window.scrollY, dir, stopsPx())
    if (at === STORY) return toStory()
    glide(px(STOPS[at]))
  }

  // `wheelSpeed: -1` matches Observer's own section-scroll convention: onUp is
  // the gesture that moves you forward through the page.
  const observer = Observer.create({
    target: window,
    // Deliberately no 'pointer': a pointer drag on the canvas is how the
    // Selected Work cards and the ecosystem modules are interacted with, and
    // Observer would swallow it.
    type: 'wheel,touch',
    wheelSpeed: -1,
    tolerance: 12,
    preventDefault: true,
    // The case-study panel opens over scene 6 and scrolls internally
    // (max-height + overflow-y in world.css). Without this, a wheel inside an
    // open case study would be swallowed and step the journey along behind it.
    // Checked per event rather than passed as a static `ignore` target because
    // the panel is mounted and unmounted as the reader opens and closes it.
    ignoreCheck: (e) => !!e.target?.closest?.('.uv-case__panel'),
    onUp: () => step(1),
    onDown: () => step(-1),
  })

  const onKey = (e) => {
    if (mode !== 'journey') return
    if (e.metaKey || e.ctrlKey || e.altKey) return
    // An open case study owns the arrow keys — it is the thing being read.
    if (document.querySelector('.uv-case')) return
    // Never steal a key from someone typing in the contact form.
    const t = e.target
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault()
        step(1)
        break
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault()
        step(-1)
        break
      case 'Home':
        e.preventDefault()
        glide(px(STOPS[0]), { duration: 1.4 })
        break
      case 'End':
        e.preventDefault()
        toStory()
        break
      default:
    }
  }
  window.addEventListener('keydown', onKey)

  return {
    /** The gesture observer itself — exposed so tests can assert it is live. */
    observer,
    /** True while a snap tween owns the scroll position. */
    get locked() {
      return locked
    },
    get mode() {
      return mode
    },

    /**
     * Per-frame housekeeping, driven by the engine's existing rAF so this adds
     * no second loop. Handles the two things Observer cannot see: a dragged
     * scrollbar, and the reader scrolling back up out of the story track.
     */
    update(dt) {
      const y = window.scrollY

      if (mode === 'story') {
        // Back inside the journey's scroll range — take the wheel again and
        // resume at the last scene rather than wherever the momentum landed.
        if (y < endY() - EPS) {
          mode = 'journey'
          lenis.stop()
          observer.enable()
          glide(px(STOPS[STOPS.length - 1]), { duration: 0.9, ease: 'power2.out' })
        }
        lastY = y
        return
      }

      if (locked) {
        lastY = y
        idle = 0
        return
      }

      // Scrollbar drag: the position moves without a gesture we can observe, so
      // we wait for it to go quiet and then settle onto the nearest stop.
      if (Math.abs(y - lastY) > 0.5) {
        lastY = y
        idle = 0
        return
      }
      idle += dt
      if (idle < 0.16) return
      idle = 0

      if (y >= endY() - EPS) return release()
      const i = nearestStop(y, stopsPx())
      if (Math.abs(px(STOPS[i]) - y) > EPS) glide(px(STOPS[i]), { duration: 0.7, ease: 'power2.out' })
    },

    /** Fly to an arbitrary point on the journey — the in-world CTAs use this. */
    toProgress(p, duration = 1.5) {
      if (mode === 'story') {
        mode = 'journey'
        lenis.stop()
        observer.enable()
      }
      glide(px(p), { duration, ease: 'power2.inOut' })
    },

    /** Called before any scroll into the prose below, so we stop fighting it. */
    release,

    destroy() {
      tween?.kill()
      observer.kill()
      window.removeEventListener('keydown', onKey)
    },
  }
}
