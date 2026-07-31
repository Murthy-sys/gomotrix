import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state } from '../core/store'
import { GlassPanel, Orb, GlowRing, RadialGlow } from '../world/Holo'
import { Pulses } from '../world/EnergyFlow'
import { ANCHORS } from '../core/world'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 11 — START YOUR PROJECT
//
// The journey ends at a console, not a footer. This builds the 3D housing: a
// glass plate, a live core feeding it, and rings that keep turning.
//
// The form's actual inputs are real DOM, rendered by ContactForm and anchored
// over this panel. Text fields inside a CSS-3D-transformed container fight the
// caret, IME input and mobile zoom — so the world provides the frame and the
// browser provides the field.
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactScene() {
  const { group, d } = useScene('contact')
  const plate = useRef()
  const fade = useRef(0)
  const core = useRef()
  const rings = useRef()
  const glow = useRef()

  // Energy running from the core into the console — the ecosystem powering
  // the thing the visitor is about to use.
  const links = useMemo(
    () => [
      [new THREE.Vector3(-9.5, 3.5, -2), new THREE.Vector3(-4.6, 0.4, 0)],
      [new THREE.Vector3(-9.5, 3.5, -2), new THREE.Vector3(-4.6, -1.6, 0)],
      [new THREE.Vector3(-9.5, 3.5, -2), new THREE.Vector3(-4.2, 2.4, 0)],
    ],
    [],
  )

  useFrame(() => {
    fade.current = d.current.band
    if (!d.current.active) return
    const t = d.current.local
    const b = d.current.band

    const rise = THREE.MathUtils.smoothstep(t, 0.02, 0.42)

    if (plate.current) {
      plate.current.position.y = THREE.MathUtils.lerp(-3, 0, rise)
      plate.current.rotation.y = state.smooth.x * 0.05
      plate.current.rotation.x = state.smooth.y * 0.03
      const u = plate.current.material.uniforms
      if (u) {
        u.uOpacity.value = 0.34 * rise * b
        u.uHover.value = rise * 0.7
      }
    }
    if (core.current) {
      core.current.position.y = 3.5 + Math.sin(d.current.t * 0.5) * 0.22
      core.current.scale.setScalar(1.5 + Math.sin(d.current.t * 1.4) * 0.05)
      const u = core.current.material.uniforms
      if (u) u.uOpacity.value = rise * b
    }
    if (rings.current) {
      rings.current.rotation.z += 0.0016
      rings.current.rotation.x = 0.4 + Math.sin(d.current.t * 0.2) * 0.06
      rings.current.children.forEach((m) => {
        if (m.material?.uniforms) m.material.uniforms.uOpacity.value = rise * b * 0.8
      })
    }
    if (glow.current?.material.uniforms) {
      glow.current.material.uniforms.uOpacity.value = 0.16 * rise * b
    }
  })

  return (
    <group ref={group} position={ANCHORS.contact}>
      <RadialGlow ref={glow} size={26} opacity={0.16} falloff={2.4} position={[0, 0, -5]} />

      {/* The console plate the DOM form sits against. */}
      <GlassPanel
        ref={plate}
        width={11.5}
        height={8.2}
        radius={0.24}
        opacity={0.34}
        scan={0.5}
      />

      {/* The core, still alive, wired into the console. */}
      <group position={[-9.5, 0, -2]}>
        <Orb ref={core} radius={1} detail={4} amp={0.13} position={[0, 3.5, 0]} />
      </group>
      <Pulses links={links} perLink={7} speed={0.3} size={1.6} color="#d8ffb0" arc={1.1} fade={fade} />

      <group ref={rings} position={[-9.5, 3.5, -2]}>
        <GlowRing radius={2.6} tube={0.012} speed={0.16} />
        <GlowRing radius={3.4} tube={0.008} speed={-0.11} rotation={[0.5, 0.3, 0]} />
      </group>
    </group>
  )
}
