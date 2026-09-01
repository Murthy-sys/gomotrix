import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state, set } from '../core/store'
import { GlassPanel } from '../world/Holo'
import WorldLabel from '../world/WorldLabel'
import { ANCHORS } from '../core/world'
import { POINT_SHAPE } from '../shaders/common'
import { projects } from '../../data/content'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 7 — SELECTED WORK
//
// Real projects, as holograms adrift in a gallery. Hovering lifts a card toward
// the viewer and pulls a swarm of particles into its frame. Clicking hands off
// to the DOM for the full case study — text that needs to be read should be
// real text, not a texture.
// ─────────────────────────────────────────────────────────────────────────────

// Card dimensions.
//
// The thing that actually occupies space here is the DOM card, not the glass
// panel behind it — so the layout is built from the card's real measurements.
//
// drei's <Html distanceFactor> sizes a label from camera distance ALONE; it is
// blind to the parent group's scale. Scaling the group therefore used to shrink
// the panel while the card sitting on it stayed exactly as big, and the two
// stopped agreeing about how much room a card needs — which is precisely how
// seven cards that measured clear ended up overlapping on screen.
//
// The useful identity: a distanceFactor label's world width is
//     CARD_PX * factor / viewportHeightPx
// with the camera distance cancelling out. Solving that for the factor that
// makes the card exactly W wide locks the label to its panel at any viewport,
// and makes the collision maths below true again.
const CARD_PX_W = 232 // must match `.uv-card { width }` in styles/world.css
const CARD_PX_H = 154 // the tallest card: four tags wrapping onto two rows

const W = 3.5
// Derived rather than declared, so the panel matches the card instead of the
// card being quietly taller than the panel it sits on.
const H = (CARD_PX_H / CARD_PX_W) * W

/** The distanceFactor that renders a card exactly W world-units wide. */
function labelFactor(scale, viewportH) {
  return (W * scale * viewportH) / CARD_PX_W
}

// The gallery layout.
//
// One card per real project, so the table has to hold however many there are —
// and the cluster has to survive every viewport, because the camera's focal
// length is fixed (see CameraRig: the FOV deliberately never changes). A narrow
// window therefore sees roughly a quarter of the world-width a wide one does,
// which is why half of this gallery used to render off the side of the frustum
// on a phone.
//
// Two columns rather than three: the frustum here is wider than it is tall, but
// not by enough for three columns to pay for themselves — three force the whole
// cluster down to about half scale, where two hold ~0.7.
//
// Columns sit 4.5 apart and rows 3.0, against a card of 3.5 x 2.32 — a clear
// gap on both axes rather than a snug fit, because this gallery is viewed from
// an angle and perspective quietly converges the columns as the camera comes in.
// Depth is held to a 0.2–0.9 band for the same reason: the cards used to span
// 0.4–2.8, and that much parallax between neighbours was enough on its own to
// slide them into each other on the approach.
//
// The per-slot jitter stays inside ±0.15 so it breaks up the grid without ever
// eating into that gap.
const SLOTS_WIDE = [
  { pos: [1.55, 4.55, 0.7], rot: [0, -0.14, 0.03] },
  { pos: [6.15, 4.4, 0.2], rot: [0, -0.34, -0.02] },
  { pos: [1.7, 1.55, 0.9], rot: [0, -0.1, 0.04] },
  { pos: [6.05, 1.4, 0.4], rot: [0, -0.38, -0.03] },
  { pos: [1.5, -1.45, 0.6], rot: [0, -0.16, -0.03] },
  { pos: [6.2, -1.6, 0.9], rot: [0, -0.32, 0.03] },
  { pos: [1.65, -4.45, 0.3], rot: [0, -0.12, 0.02] },
  { pos: [6.1, -4.6, 0.7], rot: [0, -0.42, -0.02] },
]

// Portrait tablets keep a curated four in two columns. Seven do fit down there
// geometrically, but only by shrinking to a size nobody can read — the story
// track below carries the complete list, legibly, on every screen.
const SLOTS_MID = [
  { pos: [-2.3, 1.0, 0.6], rot: [0, 0.16, 0.03] },
  { pos: [2.3, 0.8, 0.2], rot: [0, -0.2, -0.03] },
  { pos: [-2.3, -2.9, 0.8], rot: [0, 0.13, -0.02] },
  { pos: [2.3, -3.1, 0.4], rot: [0, -0.24, 0.03] },
]

// A phone gets two, in one column, low in the frame.
//
// This is a legibility floor, not a lack of ambition: the card is designed at
// 232px, and four of them on a 390px-wide screen solve to about 95px each —
// present, but too small for anyone to read a word of. Two hold ~200px. The
// column also sits below centre so the headline keeps the top of the shot.
const SLOTS_PHONE = [
  { pos: [0.2, -1.0, 0.6], rot: [0, 0.1, 0.02] },
  { pos: [0.0, -4.0, 0.3], rot: [0, -0.12, -0.02] },
]

// The card is designed at 232px and stops being readable well before it halves.
// Fitting is therefore not the only test a layout has to pass — a tier that fits
// seven cards at 127px has not solved anything — so the tier below is used
// whenever the widest one that fits would render them below this floor.
const MIN_CARD_PX = 150
// A representative reading distance for the shot: a little beyond the closest
// approach, where the gallery is composed and being looked at.
const READ_DIST = 14

/** On-screen width of a card, in CSS px. Depends on viewport HEIGHT, not width. */
function cardPixels(scale, viewportH) {
  return (W * scale * viewportH) / (2 * READ_DIST * Math.tan(HALF_FOV))
}

// Aspect thresholds, widest first. One card table per shape of screen.
const TIERS = [
  { minAspect: 1.1, slots: SLOTS_WIDE },
  { minAspect: 0.6, slots: SLOTS_MID },
  { minAspect: 0, slots: SLOTS_PHONE },
]

// The shot this cluster is composed for: camera keyframe 0.72 in core/world.js
// sits at [24, 2.5, -210] and the group's anchor is [24, 2, -224]. Measured to
// the NEAREST card rather than the anchor, so the card closest to the lens is
// the one guaranteed to be inside the frustum.
const VIEW_DIST = 11.0
const HALF_FOV = (46 / 2) * (Math.PI / 180)
const VIEW_HALF_H = VIEW_DIST * Math.tan(HALF_FOV)
// Breathing room between the outermost card and the edge of frame.
//
// Tighter horizontally than vertically, and not arbitrarily so: the camera
// arrives at this gallery from the side rather than head-on, which slides the
// cluster sideways in frame on the way in. A head-on solve leaves the right-hand
// column hanging off the edge on any narrow viewport — these two numbers are
// calibrated against `npm run check:gallery`, which projects the real cards
// through the real camera and reports how far past the frame edge they reach.
const FRAME_MARGIN_X = 0.72
const FRAME_MARGIN_Y = 0.88

/**
 * Pick the cluster and the one uniform scale that keeps all of it in shot.
 *
 * Uniform is the whole point: an earlier version compressed x on its own to pull
 * the columns in, which moved the cards closer together without making them any
 * smaller — and quietly collapsed the gaps until they overlapped. Scaling the
 * group scales positions and cards together, so a layout that clears at 1:1
 * clears at every size.
 */
/** The largest uniform scale at which a given cluster stays inside the frame. */
function solve(slots, aspect, count) {
  const shown = Math.min(count, slots.length)
  let boxX = 0
  let boxY = 0
  for (let i = 0; i < shown; i++) {
    boxX = Math.max(boxX, Math.abs(slots[i].pos[0]) + W / 2)
    boxY = Math.max(boxY, Math.abs(slots[i].pos[1]) + H / 2)
  }
  const scale = Math.min(
    1,
    (VIEW_HALF_H * aspect * FRAME_MARGIN_X) / boxX,
    (VIEW_HALF_H * FRAME_MARGIN_Y) / boxY,
  )
  return { slots: slots.slice(0, shown), scale }
}

/**
 * Pick the most generous cluster this screen can actually carry: the widest tier
 * it qualifies for whose cards still come out readable, falling back through the
 * tiers until one does.
 */
function layoutFor(aspect, viewportH, count) {
  const eligible = TIERS.filter((t) => aspect >= t.minAspect)
  const tiers = eligible.length ? eligible : [TIERS[TIERS.length - 1]]
  for (const tier of tiers) {
    const fit = solve(tier.slots, aspect, count)
    if (cardPixels(fit.scale, viewportH) >= MIN_CARD_PX) return fit
  }
  return solve(tiers[tiers.length - 1].slots, aspect, count)
}

// ── Particles that gather around a hovered card ──────────────────────────────

const gatherVert = /* glsl */ `
uniform float uTime;
uniform float uGather;
uniform float uPixelRatio;
uniform float uOpacity;
attribute vec3  aTarget;
attribute float aSeed;
varying float vAlpha;

void main(){
  float g = clamp((uGather - aSeed * 0.35) / 0.65, 0.0, 1.0);
  g = g * g * (3.0 - 2.0 * g);

  vec3 p = mix(position, aTarget, g);
  // Orbit the destination once arrived, so the swarm never looks glued on.
  float a = uTime * (0.5 + aSeed) + aSeed * 6.28;
  p += vec3(cos(a), sin(a * 1.3), sin(a)) * 0.12 * g;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vAlpha = g * uOpacity * (0.3 + aSeed * 0.7);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * (12.0 / max(-mv.z, 0.8)) * (0.5 + aSeed);
}
`

const gatherFrag = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
${POINT_SHAPE}
void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
}
`

function Gather({ energy, data, w, h }) {
  const mat = useRef()
  // Per-card, so the budget has to come down as the gallery grows: nine cards at
  // the old 180 would be 1,620 points where four cards were 720. 80 keeps the
  // whole scene at roughly what it always cost.
  const count = state.quality === 'low' ? 34 : 80

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const target = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Scattered around the card...
      pos[i * 3] = (Math.random() - 0.5) * 9
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
      // ...destined for its perimeter.
      const edge = Math.random()
      const along = (Math.random() - 0.5)
      if (edge < 0.5) {
        target[i * 3] = along * w
        target[i * 3 + 1] = (edge < 0.25 ? 0.5 : -0.5) * h
      } else {
        target[i * 3] = (edge < 0.75 ? 0.5 : -0.5) * w
        target[i * 3 + 1] = along * h
      }
      target[i * 3 + 2] = (Math.random() - 0.5) * 0.3
      seed[i] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8)
    return g
  }, [count, w, h])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGather: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color('#b7ff6a') },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!data.current.active) return
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    u.uGather.value = energy.current
    u.uPixelRatio.value = state.dpr
    u.uOpacity.value = data.current.band
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: gatherVert, fragmentShader: gatherFrag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ── A project card ───────────────────────────────────────────────────────────

function Card({ project, slot, index, data, distanceFactor }) {
  const wrap = useRef()
  const panel = useRef()
  const [hovered, setHovered] = useState(false)
  const energy = useRef(0)
  const fade = useRef(0)
  const home = useMemo(() => new THREE.Vector3(...slot.pos), [slot.pos])

  useFrame((_, dt) => {
    if (!data.current.active || !wrap.current) {
      fade.current = 0
      return
    }
    const d = Math.min(dt, 0.05)
    const t = data.current.t

    energy.current += ((hovered ? 1 : 0) - energy.current) * (1 - Math.exp(-5.5 * d))
    const e = energy.current

    // Entrance: cards drift in from depth, staggered.
    const enter = THREE.MathUtils.smoothstep(data.current.local, 0.02 + index * 0.06, 0.4 + index * 0.06)

    const k = index * 2.1
    wrap.current.position.set(
      home.x + Math.sin(t * 0.18 + k) * 0.20,
      // Hover lifts the card. Drift keeps it alive when it doesn't.
      home.y + Math.cos(t * 0.15 + k) * 0.24 + e * 0.55,
      THREE.MathUtils.lerp(home.z - 16, home.z, enter) + e * 0.9,
    )
    wrap.current.rotation.set(
      slot.rot[0] + Math.sin(t * 0.14 + k) * 0.035 - state.smooth.y * 0.05 * e,
      slot.rot[1] + Math.cos(t * 0.11 + k) * 0.04 + state.smooth.x * 0.09 * e,
      slot.rot[2] * (1 - e * 0.6),
    )
    wrap.current.scale.setScalar(THREE.MathUtils.lerp(0.85, 1, enter) * (1 + e * 0.055))

    fade.current = enter * data.current.band
    const u = panel.current?.material.uniforms
    if (u) {
      u.uHover.value = e
      u.uOpacity.value = (0.34 + e * 0.3) * enter * data.current.band
    }
  })

  const enter = () => {
    setHovered(true)
    set({ hovered: project.name })
    document.body.style.cursor = 'pointer'
  }
  const leave = () => {
    setHovered(false)
    set({ hovered: null })
    document.body.style.cursor = ''
  }

  return (
    <group ref={wrap}>
      <mesh
        onPointerOver={enter}
        onPointerOut={leave}
        onClick={(e) => {
          e.stopPropagation()
          set({ focused: project.name })
          leave()
        }}
        visible={false}
      >
        <planeGeometry args={[W * 1.1, H * 1.15]} />
      </mesh>

      <GlassPanel ref={panel} width={W} height={H} radius={0.1} opacity={0.34} scan={0.7} />
      <Gather energy={energy} data={data} w={W} h={H} />

      <WorldLabel
        center
        distanceFactor={distanceFactor}
        zIndexRange={[25, 0]}
        position={[0, 0, 0.02]}
        fade={fade}
        className={`uv-card ${hovered ? 'is-hot' : ''}`}
      >
        <div className="uv-card__top">
          <span className="uv-card__mark">{project.initials}</span>
          {/* Status wins the slot when there is one: "in development" is the
              more useful fact about a card than the year it started. */}
          <span className={`uv-card__year${project.status ? ' is-wip' : ''}`}>
            {project.status || project.year}
          </span>
        </div>
        <h3 className="uv-card__name">{project.name}</h3>
        <p className="uv-card__cat">{project.category}</p>
        <div className="uv-card__tags">
          {project.tags.slice(0, 4).map((tg) => (
            <span key={tg}>{tg}</span>
          ))}
        </div>
        <span className="uv-card__cue">View case study</span>
      </WorldLabel>
    </group>
  )
}

export default function Showcase() {
  const { group, d } = useScene('showcase')
  const size = useThree((s) => s.size)

  // A layout decision, not a per-frame one — recomputed only when the canvas is
  // actually resized, so it has no business in useFrame.
  const { slots, scale } = useMemo(
    () => layoutFor(size.width / Math.max(size.height, 1), size.height, projects.length),
    [size.width, size.height],
  )
  const factor = labelFactor(scale, size.height)

  useFrame(() => {
    if (!d.current.active || !group.current) return
    group.current.rotation.y = state.smooth.x * 0.06 + Math.sin(d.current.t * 0.08) * 0.025
    group.current.rotation.x = state.smooth.y * 0.04
  })

  return (
    <group ref={group} position={ANCHORS.showcase} scale={scale}>
      {projects.slice(0, slots.length).map((p, i) => (
        <Card
          key={p.name}
          project={p}
          slot={slots[i]}
          index={i}
          data={d}
          distanceFactor={factor}
        />
      ))}
    </group>
  )
}
