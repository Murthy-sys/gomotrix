// A mutable, non-reactive store.
//
// Scroll runs at 120Hz on a good display. Pushing that through React state
// would re-render the tree every frame and destroy the frame budget, so the
// hot values live in a plain object that `useFrame` reads directly. Only the
// handful of genuinely discrete values (active scene, focused module) get a
// subscription channel for the DOM overlay.

export const state = {
  // Scroll
  progress: 0, // eased 0..1 across the whole journey
  raw: 0, // unsmoothed 0..1
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
