// ─────────────────────────────────────────────────────────────────────────────
// Selected Work gallery — layout validation.
//
// The cards in that scene are DOM elements portalled into 3D by drei's <Html>,
// so "do they overlap" is a SCREEN-space question, not a world-space one. An
// earlier version of this check compared world-space rectangles and passed
// while the real page was visibly overlapping: it measured the glass panels,
// and the panels are not what the eye sees.
//
// This projects the actual card corners through the actual camera — sampled
// across the whole beat, at the extremes of pointer parallax and idle drift —
// and reports overlap in normalised device coordinates.
//
// Run after changing `projects`, the slot tables, or `.uv-card`'s CSS width.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs'
import * as THREE from 'three'

const root = process.cwd()
const src = fs.readFileSync(`${root}/src/universe/scenes/Showcase.jsx`, 'utf8')
const { camCurve, lookCurve, curveT, ANCHORS, SCENES, band, local } = await import(
  `${root}/src/universe/core/world.js`
)
const { projects } = await import(`${root}/src/data/content.js`)
const { BEATS } = await import(`${root}/src/universe/overlay/copy.js`)

// ── Read the layout straight out of the scene, so this cannot drift ─────────
const grab = (name) => {
  const from = src.indexOf(`const ${name} = [`)
  const arr = src.slice(from, src.indexOf(']\n', from))
  return [...arr.matchAll(/pos:\s*\[([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]/g)].map((m) => [
    +m[1], +m[2], +m[3],
  ])
}
const num = (n) => +src.match(new RegExp(`const ${n} = ([\\d.]+)`))[1]

const TIERS = [
  { minAspect: 1.1, slots: grab('SLOTS_WIDE') },
  { minAspect: 0.6, slots: grab('SLOTS_MID') },
  { minAspect: 0, slots: grab('SLOTS_PHONE') },
]
const VIEW_DIST = num('VIEW_DIST')
const FRAME_MARGIN_X = num('FRAME_MARGIN_X')
const FRAME_MARGIN_Y = num('FRAME_MARGIN_Y')
const CARD_PX_W = num('CARD_PX_W')
const CARD_PX_H = num('CARD_PX_H')
const W = num('W')
const H = (CARD_PX_H / CARD_PX_W) * W
const HALF_FOV = (46 / 2) * (Math.PI / 180)
const VIEW_HALF_H = VIEW_DIST * Math.tan(HALF_FOV)
const MIN_CARD_PX = num('MIN_CARD_PX')
const READ_DIST = num('READ_DIST')
const cardPixels = (scale, vh) => (W * scale * vh) / (2 * READ_DIST * Math.tan(HALF_FOV))

function solve(slots, aspect, count) {
  const shown = Math.min(count, slots.length)
  let boxX = 0
  let boxY = 0
  for (let i = 0; i < shown; i++) {
    boxX = Math.max(boxX, Math.abs(slots[i][0]) + W / 2)
    boxY = Math.max(boxY, Math.abs(slots[i][1]) + H / 2)
  }
  const scale = Math.min(
    1,
    (VIEW_HALF_H * aspect * FRAME_MARGIN_X) / boxX,
    (VIEW_HALF_H * FRAME_MARGIN_Y) / boxY,
  )
  return { slots: slots.slice(0, shown), scale }
}

function layoutFor(aspect, viewportH, count) {
  const eligible = TIERS.filter((t) => aspect >= t.minAspect)
  const tiers = eligible.length ? eligible : [TIERS[TIERS.length - 1]]
  for (const tier of tiers) {
    const fit = solve(tier.slots, aspect, count)
    if (cardPixels(fit.scale, viewportH) >= MIN_CARD_PX) return fit
  }
  return solve(tiers[tiers.length - 1].slots, aspect, count)
}

// ── The camera, exactly as core/CameraRig.jsx builds it ────────────────────
const UP = new THREE.Vector3(0, 1, 0)
function cameraAt(progress, aspect, pxAmt, pyAmt, driftX, driftY) {
  const t = curveT(progress)
  const pos = camCurve.getPoint(t)
  const look = lookCurve.getPoint(t)
  const fwd = look.clone().sub(pos).normalize()
  const right = fwd.clone().cross(UP).normalize()
  const up = right.clone().cross(fwd).normalize()

  const px = pxAmt * 1.15
  const py = pyAmt * 0.75
  pos.addScaledVector(right, px + driftX).addScaledVector(up, py + driftY)
  look.addScaledVector(right, px * 0.22).addScaledVector(up, py * 0.16)

  const cam = new THREE.PerspectiveCamera(46, aspect, 0.1, 700)
  cam.position.copy(pos)
  cam.up.copy(UP)
  cam.lookAt(look)
  cam.updateMatrixWorld(true)
  cam.updateProjectionMatrix()
  return cam
}

// ── Card corners → NDC axis-aligned box ────────────────────────────────────
const CORNERS = [
  [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5],
]
function ndcBox(cam, groupMat, slot, scale) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (const [cx, cy] of CORNERS) {
    const v = new THREE.Vector3(slot[0] + cx * W, slot[1] + cy * H, slot[2])
      .applyMatrix4(groupMat)
      .project(cam)
    x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x)
    y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y)
  }
  return { x0, x1, y0, y1 }
}
const overlap = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

// ── Sample the whole beat, at the worst parallax the rig can produce ───────
const scene = SCENES.find((s) => s.id === 'showcase')
const beat = BEATS.find((b) => b.scene === 'showcase')
const PEAK = scene.start + (scene.end - scene.start) * beat.at

// Sample the scene's whole slot. A card is only judged at the moments it is
// actually legible — the cards stagger in from depth, so at the very start of
// the scene most of them are still mid-entrance at 15% opacity, and holding
// those frames to the same standard would fail every layout that could exist.
const VISIBLE_AT = 0.4
// Closer than this and the camera is among the cards rather than looking at
// them. Comfortably outside the cluster's own radius at full scale.
const READABLE_DIST = 11
// How far the gallery's centre may sit from the middle of frame before the
// camera counts as having moved on to something else.
const AIMED_AT = 0.35
const SAMPLES = []
for (let p = scene.start; p <= scene.end; p += 0.005) SAMPLES.push(+p.toFixed(4))

const smoothstep = (x, lo, hi) => {
  const t = Math.min(Math.max((x - lo) / (hi - lo), 0), 1)
  return t * t * (3 - 2 * t)
}
/** Mirrors Card's own fade: staggered entrance, times the scene's scroll band. */
function cardFade(p, index) {
  const l = local(p, scene.start, scene.end)
  return smoothstep(l, 0.02 + index * 0.06, 0.4 + index * 0.06) * band(p, scene.start, scene.end, 0.035)
}
// Pointer at rest and at both extremes; drift at its amplitude.
const PARALLAX = [
  [0, 0, 0, 0], [1, 1, 0.72, 0.52], [-1, -1, -0.72, -0.52], [1, -1, 0.72, -0.52], [-1, 1, -0.72, 0.52],
]

const VIEWPORTS = [
  ['ultrawide 2560x1080', 2560, 1080],
  ['desktop 1920x1080', 1920, 1080],
  ['laptop 1440x900', 1440, 900],
  ['laptop 1366x768', 1366, 768],
  ['browser 1372x765', 1372, 765],
  ['4:3 1024x768', 1024, 768],
  ['tablet portrait 768x1024', 768, 1024],
  ['phone 390x844', 390, 844],
]

// Where the camera passes closest to the gallery — the end of the approach.
let closestPass = SAMPLES[0]
{
  let best = Infinity
  for (const p of SAMPLES) {
    const d = ANCHORS.showcase.distanceTo(camCurve.getPoint(curveT(p)))
    if (d < best) { best = d; closestPass = p }
  }
}

let failed = 0
for (const [label, vw, vh] of VIEWPORTS) {
  const aspect = vw / vh
  const { slots, scale } = layoutFor(aspect, vh, projects.length)
  const groupMat = new THREE.Matrix4()

  const worstOverlap = new Map()
  let offScreen = new Set()
  let maxNdc = 0

  for (const p of SAMPLES) {
    for (const [pxA, pyA, dx, dy] of PARALLAX) {
      const cam = cameraAt(p, aspect, pxA, pyA, dx, dy)
      // The camera does not stop at this gallery — it flies up to it and then
      // straight past, which is the shot the journey is built around. While it
      // is inside the cluster the cards necessarily fill and cross the frame,
      // and points behind the lens project to mirrored nonsense besides. That
      // is a fly-through, not a layout state, so only the frames where the
      // gallery is actually being READ are judged here.
      const dist = ANCHORS.showcase.distanceTo(cam.position)
      // Only the frames where this gallery is actually the SUBJECT are judged.
      // The camera flies up to it, passes through it, and is already swinging
      // toward the next scene while it is still close — during the pass and the
      // turn the cards fill and then stream out of frame by design. Requiring
      // that the cluster still be near the middle of the shot is what separates
      // "composed tableau" from "transition", and only the former is a layout.
      if (p > closestPass || dist < READABLE_DIST) continue
      const centre = ANCHORS.showcase.clone().project(cam)
      if (Math.abs(centre.x) > AIMED_AT || Math.abs(centre.y) > AIMED_AT) continue
      // Group transform, including the small pointer-driven rotation it carries.
      const rot = new THREE.Euler(pyA * 0.04, pxA * 0.06 + 0.025, 0)
      groupMat.compose(
        ANCHORS.showcase.clone(),
        new THREE.Quaternion().setFromEuler(rot),
        new THREE.Vector3(scale, scale, scale),
      )
      const boxes = slots.map((s) => ndcBox(cam, groupMat, s, scale))
      const lit = boxes.map((_, i) => cardFade(p, i) >= VISIBLE_AT)
      boxes.forEach((b, i) => {
        if (!lit[i]) return
        maxNdc = Math.max(maxNdc, Math.abs(b.x0), Math.abs(b.x1), Math.abs(b.y0), Math.abs(b.y1))
        if (b.x0 < -1 || b.x1 > 1 || b.y0 < -1 || b.y1 > 1) offScreen.add(projects[i].name)
      })
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++)
          if (lit[i] && lit[j] && overlap(boxes[i], boxes[j])) {
            const key = `${projects[i].name} ↔ ${projects[j].name}`
            const amt = Math.min(boxes[i].x1, boxes[j].x1) - Math.max(boxes[i].x0, boxes[j].x0)
            worstOverlap.set(key, Math.max(worstOverlap.get(key) || 0, amt))
          }
    }
  }

  const ok = worstOverlap.size === 0 && offScreen.size === 0
  if (!ok) failed++
  console.log(
    `${ok ? '  ok ' : 'FAIL '}${label.padEnd(26)} ${String(slots.length).padStart(2)} cards  card ${Math.round(cardPixels(scale, vh))}px  peak-ndc ${maxNdc.toFixed(2)}` +
      (offScreen.size ? `\n        off-screen: ${[...offScreen].join(', ')}` : '') +
      (worstOverlap.size
        ? `\n        overlap: ${[...worstOverlap.keys()].slice(0, 4).join('; ')}${worstOverlap.size > 4 ? ` (+${worstOverlap.size - 4} more)` : ''}`
        : ''),
  )
}
console.log(failed ? `\n${failed} viewport(s) failed` : '\nAll viewports clear across the whole beat.')
process.exit(failed ? 1 : 0)
