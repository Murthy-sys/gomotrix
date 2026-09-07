// Extension is explicit, unlike the rest of core/: this module is imported
// directly by scripts/check-snap.mjs under plain Node, which does not do
// Vite's extensionless resolution. Being testable is worth the inconsistency.
import { SCENES } from './world.js'

// ─────────────────────────────────────────────────────────────────────────────
// THE REST POINTS
//
// The pure half of section snapping: where the scenes park, and which one a
// gesture from a given scroll position resolves to. No DOM, no GSAP, no
// listeners — so `npm run check:snap` can assert the whole contract in Node,
// including the one the eye cannot reliably check: that a gesture NEVER
// advances more than one scene.
//
// snap.js owns the input handling and the tween; this file owns the arithmetic.
// ─────────────────────────────────────────────────────────────────────────────

// Where each scene comes to rest, as a fraction of that scene's own scroll
// range. These mirror `at` in overlay/copy.js — the point where that scene's
// headline is fully composed — so the camera parks exactly where the words are
// readable. Kept as a literal table rather than importing BEATS so that core/
// does not depend on overlay/; update this if a beat's `at` moves.
const REST_AT = {
  spark: 0.62,
  ecosystem: 0.5,
  web: 0.5,
  mobile: 0.5,
  agents: 0.5,
  showcase: 0.45,
  tech: 0.42,
  contact: 0.5, // no beat of its own — the finale overlay owns this one
}

/** The eight rest points, in global journey progress (0..1). */
export const STOPS = SCENES.map((s) => s.start + (s.end - s.start) * (REST_AT[s.id] ?? 0.5))

/** Below this many px, two scroll positions count as the same place. */
export const EPS = 4

/** Returned by `resolveStop` when a forward gesture runs off the last scene. */
export const STORY = 'story'

/**
 * Which stop a single gesture from `y` should land on.
 *
 * Two cases, and keeping them separate is the whole correctness argument:
 *
 *   - Parked ON a stop (within `eps`): step to the neighbouring index.
 *   - Between two stops — after a scrollbar drag, or a resize that moved the
 *     stops underneath the reader: land on the ADJACENT one.
 *
 * Collapsing these into a single "first stop beyond y + eps" test looks
 * equivalent and is not: a position between one and two epsilons below a stop
 * satisfies neither branch of it and skips that scene entirely. `check:snap`
 * covers exactly that window.
 *
 * @param {number} y        current scroll position, px
 * @param {1|-1} dir        gesture direction; +1 is further into the journey
 * @param {number[]} px     stop positions in px, ascending
 * @returns {number|'story'} index of the stop to land on, or STORY to hand off
 */
export function resolveStop(y, dir, px, eps = EPS) {
  // Parked on a stop (within the epsilon) — step to the neighbour.
  const at = px.findIndex((p) => Math.abs(p - y) <= eps)
  if (at !== -1) {
    const next = at + dir
    if (next < 0) return 0
    return next >= px.length ? STORY : next
  }

  // Genuinely between two stops — land on the adjacent one.
  if (dir > 0) {
    const i = px.findIndex((p) => p > y)
    return i === -1 ? STORY : i
  }
  for (let i = px.length - 1; i >= 0; i--) if (px[i] < y) return i
  return 0
}

/** Index of the stop closest to `y`. Used to settle a dragged scrollbar. */
export function nearestStop(y, px) {
  let best = 0
  let bd = Infinity
  for (let i = 0; i < px.length; i++) {
    const d = Math.abs(px[i] - y)
    if (d < bd) {
      bd = d
      best = i
    }
  }
  return best
}
