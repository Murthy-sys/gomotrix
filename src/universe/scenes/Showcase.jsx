import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
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

// A loose, deliberately uneven cluster — a neat grid would read as a template.
// Held to the right of centre because this scene's copy is left-aligned; centred
// slots put two cards straight through the headline.
const SLOTS = [
  { pos: [1.1, 2.5, 1.2], rot: [0, -0.16, 0.03] },
  { pos: [5.6, 0.9, 2.9], rot: [0, -0.36, -0.03] },
  { pos: [1.5, -2.1, 2.2], rot: [0, -0.12, 0.04] },
  { pos: [5.9, -3.3, 0.5], rot: [0, -0.44, -0.02] },
]

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
  const count = state.quality === 'low' ? 60 : 180

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

const W = 3.5
const H = 2.3

function Card({ project, slot, index, data }) {
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
        distanceFactor={13}
        zIndexRange={[25, 0]}
        position={[0, 0, 0.02]}
        fade={fade}
        className={`uv-card ${hovered ? 'is-hot' : ''}`}
      >
        <div className="uv-card__top">
          <span className="uv-card__mark">{project.initials}</span>
          <span className="uv-card__year">{project.year}</span>
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

  useFrame(() => {
    if (!d.current.active || !group.current) return
    group.current.rotation.y = state.smooth.x * 0.06 + Math.sin(d.current.t * 0.08) * 0.025
    group.current.rotation.x = state.smooth.y * 0.04
  })

  return (
    <group ref={group} position={ANCHORS.showcase}>
      {projects.slice(0, SLOTS.length).map((p, i) => (
        <Card key={p.name} project={p} slot={SLOTS[i]} index={i} data={d} />
      ))}
    </group>
  )
}
