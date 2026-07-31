import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state } from '../core/store'
import { Orb, GlowRing } from '../world/Holo'
import { Filaments, Pulses } from '../world/EnergyFlow'
import WorldLabel from '../world/WorldLabel'
import { ANCHORS } from '../core/world'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 9 — YOUR UNIVERSE
//
// The camera flies backwards and the eight capabilities the journey passed
// through converge into one connected body, with the core at its centre. The
// last camera keyframe never comes to rest, so the shot keeps drifting after
// the story ends.
// ─────────────────────────────────────────────────────────────────────────────

const NODES = [
  { id: 'core', label: 'AI Core', r: 0, y: 0, size: 1.5, color: '#ffffff' },
  { id: 'web', label: 'Web', r: 6.2, y: 1.4, size: 0.7, color: '#b7ff6a' },
  { id: 'mobile', label: 'Mobile', r: 6.2, y: -0.9, size: 0.7, color: '#a8ff60' },
  { id: 'crm', label: 'CRM', r: 6.2, y: 1.1, size: 0.62, color: '#b7ff6a' },
  { id: 'agents', label: 'AI Agents', r: 6.2, y: -1.3, size: 0.78, color: '#8fd8ff' },
  { id: 'automation', label: 'Automation', r: 6.2, y: 0.8, size: 0.7, color: '#b7ff6a' },
  { id: 'cloud', label: 'Cloud', r: 6.2, y: -1.0, size: 0.66, color: '#8fd8ff' },
  { id: 'analytics', label: 'Analytics', r: 6.2, y: 1.5, size: 0.7, color: '#a8ff60' },
]

// Satellites sit on a ring around the core; the core itself stays at origin.
const placed = NODES.map((n, i) => {
  if (n.r === 0) return { ...n, pos: new THREE.Vector3(0, 0, 0) }
  const sats = NODES.length - 1
  const a = ((i - 1) / sats) * Math.PI * 2
  return {
    ...n,
    pos: new THREE.Vector3(Math.cos(a) * n.r, n.y, Math.sin(a) * n.r * 0.72),
  }
})

function Node({ node, data, index }) {
  const wrap = useRef()
  const orb = useRef()
  const fade = useRef(0)

  useFrame(() => {
    if (!data.current.active || !wrap.current) {
      fade.current = 0
      return
    }
    const t = data.current.t

    // Everything converges from far out to its place in the ecosystem.
    const join = THREE.MathUtils.smoothstep(
      data.current.local,
      0.05 + index * 0.045,
      0.55 + index * 0.045,
    )

    const from = node.pos.clone().multiplyScalar(4.5)
    from.z -= 26
    wrap.current.position.lerpVectors(from, node.pos, join)
    wrap.current.position.y += Math.sin(t * 0.3 + index) * 0.16

    const s = node.size * join * (1 + Math.sin(t * 0.9 + index * 1.3) * 0.04)
    wrap.current.scale.setScalar(Math.max(s, 0.0001))

    fade.current = join * data.current.band
    const u = orb.current?.material.uniforms
    if (u) u.uOpacity.value = join * data.current.band
  })

  return (
    <group ref={wrap}>
      <Orb ref={orb} radius={1} detail={3} color={node.color} core="#05100a" amp={0.1} />
      <WorldLabel
        center
        distanceFactor={15}
        position={[0, 1.7, 0]}
        fade={fade}
        className={`uv-node ${node.id === 'core' ? 'is-core' : ''}`}
      >
        {node.label}
      </WorldLabel>
    </group>
  )
}

export default function Finale() {
  const { group, d } = useScene('finale')
  const reveal = useRef(0)
  const fade = useRef(0)
  const rings = useRef()

  // Core to every satellite, plus the satellites chained into a closed loop —
  // the ecosystem is a network, not a hub with spokes.
  const links = useMemo(() => {
    const out = []
    const core = placed[0].pos
    const sats = placed.slice(1)
    sats.forEach((s) => out.push([core, s.pos]))
    sats.forEach((s, i) => out.push([s.pos, sats[(i + 1) % sats.length].pos]))
    return out
  }, [])

  useFrame(() => {
    if (!d.current.active) return
    reveal.current = THREE.MathUtils.smoothstep(d.current.local, 0.3, 0.95)
    fade.current = THREE.MathUtils.smoothstep(d.current.local, 0.02, 0.3)

    if (group.current) {
      // A slow, permanent rotation. This never stops — the universe keeps
      // turning for as long as the page is open.
      group.current.rotation.y = d.current.t * 0.055 + state.smooth.x * 0.09
      group.current.rotation.x = 0.06 + state.smooth.y * 0.05
    }
    if (rings.current) {
      rings.current.rotation.z += 0.0006
      rings.current.children.forEach((m) => {
        if (m.material?.uniforms) m.material.uniforms.uOpacity.value = fade.current * 0.55
      })
    }
  })

  return (
    <group ref={group} position={ANCHORS.finale}>
      <Filaments links={links} color="#b7ff6a" opacity={0.4} reveal={reveal} fade={fade} />
      <Pulses
        links={links}
        perLink={5}
        speed={0.17}
        size={1.5}
        color="#d8ffb0"
        arc={0.8}
        reveal={reveal}
        fade={fade}
      />

      {placed.map((n, i) => (
        <Node key={n.id} node={n} data={d} index={i} />
      ))}

      <group ref={rings}>
        <GlowRing radius={9.5} tube={0.01} speed={0.05} rotation={[Math.PI / 2, 0, 0]} />
        <GlowRing radius={11.8} tube={0.008} speed={-0.035} rotation={[Math.PI / 2.2, 0.4, 0]} />
      </group>
    </group>
  )
}
