import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state } from '../core/store'
import { Filaments, Pulses } from '../world/EnergyFlow'
import WorldLabel from '../world/WorldLabel'
import { ANCHORS } from '../core/world'
import { buildStars, buildLinks } from './constellationData'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 8 — THE CONSTELLATION
//
// Trust, drawn instead of claimed. Delivered projects burn as anchor stars;
// every sector served is a star wired to the work nearest it. As the camera
// moves through, the links switch on in sequence — the network visibly grows
// rather than arriving pre-built.
// ─────────────────────────────────────────────────────────────────────────────

function Star({ star, data, index }) {
  const ref = useRef()
  const fade = useRef(0)
  const home = useMemo(() => new THREE.Vector3(...star.pos), [star.pos])

  useFrame(() => {
    // Zeroing before the bail-out matters: leaving `fade` at its last value
    // strands this scene's labels on screen for the rest of the journey.
    if (!data.current.active || !ref.current) {
      fade.current = 0
      return
    }
    const t = data.current.t
    const k = index * 1.7

    // Stars ignite in sequence, brightest first.
    const born = THREE.MathUtils.smoothstep(
      data.current.local,
      index * 0.012,
      0.22 + index * 0.012,
    )

    ref.current.position.set(
      home.x + Math.sin(t * 0.13 + k) * 0.16,
      home.y + Math.cos(t * 0.11 + k) * 0.14,
      home.z + Math.sin(t * 0.09 + k) * 0.12,
    )

    const twinkle = 0.75 + 0.25 * Math.sin(t * (star.bright ? 1.1 : 2.3) + k)
    const s = (star.bright ? 0.20 : 0.075) * born * twinkle
    ref.current.scale.setScalar(s)
    ref.current.material.opacity = (star.bright ? 1 : 0.55) * born * data.current.band
    fade.current = born * data.current.band
  })

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={star.bright ? '#ffffff' : '#b7ff6a'}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Only the anchors get a name. Labelling all 19 would be noise. */}
      {star.bright && (
        <WorldLabel center distanceFactor={15} position={star.pos} fade={fade} className="uv-star">
          <span className="uv-star__name">{star.label}</span>
          <span className="uv-star__sub">{star.sub}</span>
        </WorldLabel>
      )}
    </group>
  )
}

export default function Constellation() {
  const { group, d } = useScene('clients')
  const reveal = useRef(0)
  const fade = useRef(0)

  const stars = useMemo(() => buildStars(), [])
  const links = useMemo(
    () => buildLinks(stars).map(([a, b]) => [new THREE.Vector3(...a.pos), new THREE.Vector3(...b.pos)]),
    [stars],
  )

  useFrame(() => {
    if (!d.current.active) return
    // Drives the staggered switch-on inside the filament and pulse shaders.
    reveal.current = THREE.MathUtils.smoothstep(d.current.local, 0.12, 0.92)
    fade.current = d.current.band

    if (group.current) {
      group.current.rotation.y = d.current.t * 0.02 + state.smooth.x * 0.08
      group.current.rotation.x = state.smooth.y * 0.05
    }
  })

  return (
    <group ref={group} position={ANCHORS.clients}>
      <Filaments links={links} color="#b7ff6a" opacity={0.34} reveal={reveal} fade={fade} />
      <Pulses
        links={links}
        perLink={2}
        speed={0.1}
        size={1.2}
        color="#d8ffb0"
        arc={1.2}
        reveal={reveal}
        fade={fade}
      />
      {stars.map((s, i) => (
        <Star key={s.id} star={s} data={d} index={i} />
      ))}
    </group>
  )
}
