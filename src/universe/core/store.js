// A mutable, non-reactive store.
//
// Scroll runs at 120Hz on a good display. Pushing that through React state
// would re-render the tree every frame and destroy the frame budget, so the
// hot values live in a plain object that `useFrame` reads directly. Only the
// handful of genuinely discrete values (active scene, focused module) get a
// subscription channel for the DOM overlay.

// The journey opens already on the headline beat ("Ideas Become Intelligent
// Products") instead of the void-and-single-mote intro. Derived from BEATS'
// spark entry (overlay/copy.js, at: 0.62) crossed with SCENES.spark's range
// (core/world.js, 0..0.1): 0 + 0.1 * 0.62. Kept as a literal rather than an
// import so this dependency-free store stays that way — update this if
// either of those two numbers changes.
const START_PROGRESS = 0.062

export const state = {
  // Scroll
  progress: START_PROGRESS, // eased 0..1 across the whole journey
  raw: START_PROGRESS, // unsmoothed 0..1
  scroll: 0, // native scroll position in px — the journey is only the first slice
  velocity: 0, // signed, normalised-ish scroll speed
  // Pointer
  pointer: { x: 0, y: 0 }, // -1..1, raw
  smooth: { x: 0, y: 0 }, // -1..1, damped — what the camera actually uses
  // What the camera is currently looking at. Depth of field reads this so the
  // story subject is always the thing in focus.
  look: { x: 0, y: 0, z: 0 },
  // Runtime
  scene: 0,
  hovered: null, // id of hovered interactive object
  focused: null, // id of the module the user clicked into
  quality: 'high', // 'high' | 'medium' | 'low'
  reduced: false, // prefers-reduced-motion
  entered: false, // user has passed the preloader
  // The business story track below the journey is on screen. Overlays pinned to
  // the journey (the finale, the progress hairline) use this as a hard stop:
  // `progress` saturates at 1 for the whole length of the track, so the scroll
  // band alone would leave them floating over the reader's page.
  story: false,
  // The track has scrolled up far enough to cover the canvas completely, so
  // there is nothing on screen for the render loop to draw.
  covered: false,
  dpr: 1,
}

const listeners = new Set()

/** Subscribe to discrete changes (scene / hovered / focused / entered). */
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Set discrete keys and notify. Cheap enough to call on hover. */
export function set(patch) {
  let changed = false
  for (const k in patch) {
    if (state[k] !== patch[k]) {
      state[k] = patch[k]
      changed = true
    }
  }
  if (changed) listeners.forEach((fn) => fn(state))
}
