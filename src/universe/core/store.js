import { STOPS } from './stops.js'

// A mutable, non-reactive store.
//
// Scroll runs at 120Hz on a good display. Pushing that through React state
// would re-render the tree every frame and destroy the frame budget, so the
// hot values live in a plain object that `useFrame` reads directly. Only the
// handful of genuinely discrete values (active scene, focused module) get a
// subscription channel for the DOM overlay.

// Open on the first headline, using the same position as keyboard navigation.
const START_PROGRESS = STOPS[0]

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
  // the journey (the narrative, the progress hairline) use this as a hard stop:
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
