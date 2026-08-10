import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state, set } from '../core/store'
import { scrollToProgress } from '../core/engine'
import { Orb, GlowRing } from '../world/Holo'
import { Pulses } from '../world/EnergyFlow'
import WorldLabel from '../world/WorldLabel'
import { ANCHORS, SCENES } from '../core/world'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — THE ECOSYSTEM
//
// The core throws off four orbital rings, one per capability. Hovering slows
// that ring's rotation — the world yields to attention. Clicking flies the
// camera into the module's own scene, so "zooming into a module" and "scrolling
// the story" are literally the same motion. There is no menu anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    id: 'web',
    label: 'Web Platforms',
    hint: 'Portals · Sites · Dashboards',
    radius: 5.4,
    tilt: [Math.PI / 2, 0, 0],
    phase: 0,
    speed: 0.13,
    color: '#dbe6f2',
  },
  {
    id: 'mobile',
    label: 'Mobile Apps',
    hint: 'iOS · Android · React Native',
    radius: 7.1,
    tilt: [Math.PI / 2.35, 0.6, 0.3],
    phase: 2.1,
    speed: -0.1,
    color: '#dbe6f2',
  },
  {
    id: 'agents',
    label: 'AI Agents',
    hint: 'Chat · Voice · OCR · RAG',
    radius: 8.9,
    tilt: [Math.PI / 1.8, -0.5, -0.35],
    phase: 4.0,
    speed: 0.07,
    color: '#cfe0ff',
  },
  {
    id: 'automation',
    label: 'Automation',
    hint: 'Workflows · Integrations',
    radius: 10.8,
    tilt: [Math.PI / 2.6, 1.2, 0.15],
    phase: 5.4,
    speed: -0.055,
    color: '#dbe6f2',
  },
]

function Module({ mod, sceneData, index }) {
  const ring = useRef()
  const orb = useRef()
  const halo = useRef()
  const ringMesh = useRef()
  const pulses = useRef()
  const [hovered, setHovered] = useState(false)
  const speed = useRef(mod.speed)
  const energy = useRef(0)
  // Drives both the DOM label and the link opacity. Without this the rings and
  // labels of scene 2 are fully lit while the user is still in scene 1.
  const fade = useRef(0)

  // The module lives at a fixed point in its ring's local frame, so rotating the
  // ring carries the module — and its energy link — around with it. One
  // transform drives everything; nothing has to be re-synced per frame.
  const localPos = useMemo(() => new THREE.Vector3(mod.radius, 0, 0), [mod.radius])
  const links = useMemo(() => [[new THREE.Vector3(0, 0, 0), localPos]], [localPos])

  useFrame((_, dt) => {
    if (!sceneData.current.active) {
      fade.current = 0
      return
    }
    const d = Math.min(dt, 0.05)

    // Hover slows the orbit to a near-stop instead of freezing it — motion
    // decays, it never snaps.
    const target = hovered ? mod.speed * 0.12 : mod.speed
    speed.current += (target - speed.current) * (1 - Math.exp(-3 * d))
    if (ring.current) ring.current.rotation.z += speed.current * d

    energy.current += ((hovered ? 1 : 0) - energy.current) * (1 - Math.exp(-6 * d))

    const t = sceneData.current.local
    // Rings bloom outward in sequence as the scene opens.
    const bloom = THREE.MathUtils.smoothstep(t, 0.05 + index * 0.07, 0.45 + index * 0.07)
    if (ring.current) ring.current.scale.setScalar(THREE.MathUtils.lerp(0.25, 1, bloom))

    // Everything this module owns fades together.
    fade.current = bloom * sceneData.current.band
    if (ringMesh.current?.material.uniforms) {
      ringMesh.current.material.uniforms.uOpacity.value = fade.current * 0.9
    }
    if (pulses.current?.material.uniforms) {
      pulses.current.material.uniforms.uOpacity.value = fade.current
    }

    if (orb.current?.material.uniforms) {
      const u = orb.current.material.uniforms
      u.uHover.value = energy.current
      u.uOpacity.value = bloom * sceneData.current.band
      const s = 0.62 * (1 + energy.current * 0.3 + Math.sin(sceneData.current.t * 1.3 + index) * 0.04)
      orb.current.scale.setScalar(s)
    }

    if (halo.current) {
      halo.current.scale.setScalar(0.62 * (1.4 + energy.current * 0.4))
      halo.current.material.opacity = (0.03 + energy.current * 0.07) * bloom * sceneData.current.band
    }
  })

  const enter = () => {
    setHovered(true)
    set({ hovered: mod.id })
    document.body.style.cursor = 'pointer'
  }
  const leave = () => {
    setHovered(false)
    set({ hovered: null })
    document.body.style.cursor = ''
  }
  const go = () => {
    const target = SCENES.find((s) => s.id === mod.id)
    // Land a little past the scene's opening so the camera arrives mid-shot.
    if (target) scrollToProgress(target.start + (target.end - target.start) * 0.42)
    leave()
  }

  return (
    <group rotation={mod.tilt}>
      <group ref={ring}>
        <GlowRing
          ref={ringMesh}
          radius={mod.radius}
          tube={0.009}
          speed={mod.speed * 0.9}
          color={mod.color}
          opacity={0}
        />
        <Pulses
          ref={pulses}
          links={links}
          perLink={9}
          speed={0.16}
          size={1.5}
          color={mod.color}
          arc={0.6}
          opacity={0}
        />

        <group position={localPos}>
          {/* Generous invisible hit area — hunting for a 0.3-unit orb with a
              mouse is not a premium interaction. */}
          <mesh onPointerOver={enter} onPointerOut={leave} onClick={go} visible={false}>
            <sphereGeometry args={[1.5, 8, 8]} />
          </mesh>

          <Orb ref={orb} radius={1} detail={3} color={mod.color} amp={0.09} />

          <mesh ref={halo}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color={mod.color}
              transparent
              opacity={0.06}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Counter-rotated so the label stays upright while its ring turns. */}
          <group rotation={[-mod.tilt[0], -mod.tilt[1], -mod.tilt[2]]}>
            <WorldLabel
              center
              distanceFactor={16}
              fade={fade}
              className={`uv-module ${hovered ? 'is-hot' : ''}`}
            >
              <span className="uv-module__label">{mod.label}</span>
              <span className="uv-module__hint">{mod.hint}</span>
            </WorldLabel>
          </group>
        </group>
      </group>
    </group>
  )
}

export default function Ecosystem() {
  const { group, d } = useScene('ecosystem')
  const core = useRef()

  useFrame(() => {
    if (!d.current.active) return
    if (core.current?.material.uniforms) {
      core.current.material.uniforms.uOpacity.value = d.current.band * 0.95
    }
    // A slow yaw on the whole system, plus a lean toward the cursor.
    if (group.current) {
      group.current.rotation.y = d.current.t * 0.032 + state.smooth.x * 0.06
      group.current.rotation.x = state.smooth.y * 0.04
    }
  })

  return (
    <group ref={group} position={ANCHORS.ecosystem}>
      {/* The core persists from scene 1 — the same object, now generating. */}
      <Orb ref={core} radius={2.4} detail={4} amp={0.1} opacity={0.6} />
      {MODULES.map((mod, i) => (
        <Module key={mod.id} mod={mod} sceneData={d} index={i} />
      ))}
    </group>
  )
}
