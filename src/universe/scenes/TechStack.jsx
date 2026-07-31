import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state, set } from '../core/store'
import { GlassPanel, RadialGlow } from '../world/Holo'
import { Filaments } from '../world/EnergyFlow'
import WorldLabel from '../world/WorldLabel'
import { ANCHORS } from '../core/world'
import { techLayout } from './techData'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 9 — THE STACK
//
// A curved wall of holographic tiles, one per technology, each carrying its
// official mark. Idle, the marks sit desaturated inside the green palette;
// hovering brings a tile forward and restores its true brand colour, so the
// wall only lights up where the reader is actually looking.
// ─────────────────────────────────────────────────────────────────────────────

const TILE = 2.35

function Tile({ tech, data, onHover }) {
  const wrap = useRef()
  const panel = useRef()
  const [hovered, setHovered] = useState(false)
  const energy = useRef(0)
  const fade = useRef(0)
  const home = useMemo(() => new THREE.Vector3(...tech.pos), [tech.pos])

  useFrame((_, dt) => {
    if (!data.current.active || !wrap.current) {
      fade.current = 0
      return
    }
    const d = Math.min(dt, 0.25)
    const t = data.current.t

    energy.current += ((hovered ? 1 : 0) - energy.current) * (1 - Math.exp(-6 * d))
    const e = energy.current

    // Tiles arrive in a diagonal sweep across the wall.
    const stagger = tech.index * 0.012
    const enter = THREE.MathUtils.smoothstep(data.current.local, 0.02 + stagger, 0.3 + stagger)

    const k = tech.index * 1.3
    wrap.current.position.set(
      home.x + Math.sin(t * 0.3 + k) * 0.07,
      home.y + Math.cos(t * 0.26 + k) * 0.09,
      // Slide in from behind the wall, then hover lifts it toward the lens.
      THREE.MathUtils.lerp(home.z - 9, home.z, enter) + e * 1.15,
    )
    wrap.current.rotation.y = tech.yaw + state.smooth.x * 0.05 * e
    wrap.current.rotation.x = Math.sin(t * 0.22 + k) * 0.02 - state.smooth.y * 0.04 * e
    wrap.current.scale.setScalar(THREE.MathUtils.lerp(0.8, 1, enter) * (1 + e * 0.085))

    fade.current = enter * data.current.band
    const u = panel.current?.material.uniforms
    if (u) {
      u.uHover.value = e
      u.uOpacity.value = (0.3 + e * 0.34) * enter * data.current.band
    }
  })

  const enter = () => {
    setHovered(true)
    onHover(tech.name)
    set({ hovered: tech.name })
    document.body.style.cursor = 'pointer'
  }
  const leave = () => {
    setHovered(false)
    onHover(null)
    set({ hovered: null })
    document.body.style.cursor = ''
  }

  return (
    <group ref={wrap}>
      <mesh onPointerOver={enter} onPointerOut={leave} visible={false}>
        <planeGeometry args={[TILE * 1.15, TILE * 1.15]} />
      </mesh>

      <GlassPanel
        ref={panel}
        width={TILE}
        height={TILE}
        radius={0.16}
        opacity={0.3}
        scan={0.45}
      />

      <WorldLabel
        center
        distanceFactor={20}
        position={[0, 0, 0.03]}
        fade={fade}
        className={`uv-tech ${hovered ? 'is-hot' : ''}`}
      >
        <svg
          className="uv-tech__mark"
          viewBox="0 0 24 24"
          role="img"
          aria-label={tech.name}
          style={{ '--brand': `#${tech.hex}` }}
        >
          <path d={tech.path} />
        </svg>
        <span className="uv-tech__name">{tech.name}</span>
        <span className="uv-tech__group">{tech.group}</span>
      </WorldLabel>
    </group>
  )
}

export default function TechStack() {
  const { group, d } = useScene('tech')
  const [, setHot] = useState(null)
  const glow = useRef()
  const fade = useRef(0)

  const tiles = useMemo(() => techLayout(4), [])

  // Hairlines stitching the grid together — the stack is a system, not a bag
  // of logos.
  const links = useMemo(() => {
    const out = []
    const cols = 4
    tiles.forEach((t, i) => {
      const right = i % cols !== cols - 1 ? tiles[i + 1] : null
      const below = tiles[i + cols]
      if (right) out.push([new THREE.Vector3(...t.pos), new THREE.Vector3(...right.pos)])
      if (below) out.push([new THREE.Vector3(...t.pos), new THREE.Vector3(...below.pos)])
    })
    return out
  }, [tiles])

  useFrame(() => {
    fade.current = d.current.band
    if (!d.current.active || !group.current) return
    group.current.rotation.y = state.smooth.x * 0.045 + Math.sin(d.current.t * 0.11) * 0.015
    group.current.rotation.x = state.smooth.y * 0.03
    if (glow.current?.material.uniforms) {
      glow.current.material.uniforms.uOpacity.value = 0.055 * d.current.band
    }
  })

  return (
    <group ref={group} position={ANCHORS.tech}>
      <RadialGlow ref={glow} size={26} opacity={0.055} falloff={2.6} position={[5.2, 0, -7]} />
      <Filaments links={links} color="#7f93ab" opacity={0.14} segments={4} fade={fade} />
      {tiles.map((t) => (
        <Tile key={t.name} tech={t} data={d} onHover={setHot} />
      ))}
    </group>
  )
}
