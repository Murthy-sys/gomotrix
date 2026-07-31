import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// THE WORLD
//
// Every scene is a real place in one continuous 3D space. The camera never cuts
// — it flies from one location to the next along a single spline. Scenes are
// laid out down -Z with lateral drift so the journey banks and turns instead of
// running down a straight corridor.
// ─────────────────────────────────────────────────────────────────────────────

export const ANCHORS = {
  spark: new THREE.Vector3(0, 0, 0),
  ecosystem: new THREE.Vector3(0, 0, 0), // shares the core — scene 2 grows out of scene 1
  web: new THREE.Vector3(-34, 3, -46),
  mobile: new THREE.Vector3(30, -4, -104),
  agents: new THREE.Vector3(-14, 12, -164),
  showcase: new THREE.Vector3(24, 2, -224),
  tech: new THREE.Vector3(-20, 6, -286),
  contact: new THREE.Vector3(18, 4, -344),
}

// Eight scenes, not eleven. Automation, the client constellation and the
// separate finale were cut: the first was the weakest read, the second was
// abstract filler, and the third said the same thing as the contact scene.
export const SCENES = [
  { id: 'spark', label: 'The Spark', start: 0.0, end: 0.1 },
  { id: 'ecosystem', label: 'The Ecosystem', start: 0.1, end: 0.22 },
  { id: 'web', label: 'Web Platforms', start: 0.22, end: 0.37 },
  { id: 'mobile', label: 'Mobile Apps', start: 0.37, end: 0.52 },
  { id: 'agents', label: 'AI Agents', start: 0.52, end: 0.65 },
  { id: 'showcase', label: 'Selected Work', start: 0.65, end: 0.78 },
  { id: 'tech', label: 'The Stack', start: 0.78, end: 0.88 },
  { id: 'contact', label: 'Start Your Project', start: 0.88, end: 1.0 },
]

// Camera keyframes: [t, positionXYZ, lookAtXYZ].
const KEYS = [
  // ── 1. The Spark ──────────────────────────────────────────────────────────
  [0.0, [0, 0.4, 30], [0, 0, 0]],
  [0.04, [6.5, 1.6, 15], [0, 0, 0]],
  [0.085, [-7, 2.6, 12.5], [0, 0, 0]],
  // ── 2. The Ecosystem ──────────────────────────────────────────────────────
  [0.125, [-13, 7, 19], [0, 0, 0]],
  [0.175, [12, 9, 22], [0, 0.5, 0]],
  [0.215, [16, 4, 2], [-10, 2, -18]],
  // ── 3. Web Platforms ──────────────────────────────────────────────────────
  [0.255, [-20, 6, -20], [-34, 3, -46]],
  [0.3, [-34.5, 3.2, -31], [-34, 3, -47]],
  [0.365, [-30, 1, -58], [-30, 0, -76]],
  // ── 4. Mobile Apps ────────────────────────────────────────────────────────
  [0.405, [8, -1, -84], [30, -4, -104]],
  [0.45, [30.5, -3.6, -89.5], [30, -4, -104]],
  [0.515, [24, 0, -120], [4, 8, -140]],
  // ── 5. AI Agents ──────────────────────────────────────────────────────────
  [0.555, [0, 13, -138], [-14, 12, -164]],
  [0.59, [-14, 13.5, -147], [-14, 12, -166]],
  [0.645, [-6, 9, -186], [14, 4, -206]],
  // ── 6. Selected Work ──────────────────────────────────────────────────────
  [0.685, [10, 4, -204], [24, 2, -224]],
  [0.72, [24, 2.5, -210], [24, 2, -226]],
  [0.775, [16, 6, -246], [-8, 8, -266]],
  // ── 7. The Stack ──────────────────────────────────────────────────────────
  [0.805, [-8, 8, -262], [-20, 6, -286]],
  [0.835, [-20, 7, -268], [-20, 6, -288]],
  [0.875, [-12, 5, -306], [6, 4, -326]],
  // ── 8. Start Your Project ─────────────────────────────────────────────────
  [0.905, [6, 5, -322], [18, 4, -344]],
  [0.955, [18, 4.5, -326], [18, 4, -346]],
  [1.0, [19, 5, -325], [18, 4, -346]],
]

const positions = KEYS.map((k) => new THREE.Vector3(...k[1]))
const targets = KEYS.map((k) => new THREE.Vector3(...k[2]))
const times = KEYS.map((k) => k[0])

// Centripetal Catmull-Rom avoids the cusps and overshoot that a uniform spline
// produces when keyframe spacing is uneven — the camera never lurches.
export const camCurve = new THREE.CatmullRomCurve3(positions, false, 'centripetal', 0.5)
export const lookCurve = new THREE.CatmullRomCurve3(targets, false, 'centripetal', 0.5)

const SEGMENTS = KEYS.length - 1

/**
 * Map global progress (0..1) onto spline parameter space.
 *
 * `getPoint` distributes t evenly across control points, but our keyframes sit
 * at authored, uneven times. This finds the bracketing pair and converts the
 * local fraction into the spline's uniform space so the camera arrives exactly
 * when the story says it should.
 */
export function curveT(p) {
  const t = Math.min(Math.max(p, 0), 1)
  let i = 0
  while (i < SEGMENTS - 1 && t > times[i + 1]) i++
  const span = times[i + 1] - times[i] || 1
  const u = Math.min(Math.max((t - times[i]) / span, 0), 1)
  return (i + smoothstep(u)) / SEGMENTS
}

/** Cinematic easing: slow acceleration, slow deceleration. No sudden movement. */
export function smoothstep(x) {
  return x * x * (3 - 2 * x)
}

/** 0 outside the range, 1 inside, eased across `fade` at both ends. */
export function band(p, start, end, fade = 0.03) {
  const a = smoothstep(clamp01((p - start) / fade))
  const b = 1 - smoothstep(clamp01((p - (end - fade)) / fade))
  return Math.min(a, b)
}

/** Local 0..1 progress within a scene's own scroll range. */
export function local(p, start, end) {
  return clamp01((p - start) / (end - start))
}

export function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

export function sceneIndexAt(p) {
  for (let i = SCENES.length - 1; i >= 0; i--) if (p >= SCENES[i].start) return i
  return 0
}

/** Scenes render only near their slot. Everything else is skipped entirely. */
export function isActive(p, start, end, margin = 0.06) {
  return p > start - margin && p < end + margin
}
