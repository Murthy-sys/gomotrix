import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state } from '../core/store'
import { GlowRing, Orb } from '../world/Holo'
import { Filaments } from '../world/EnergyFlow'
import WorldLabel from '../world/WorldLabel'
import { ANCHORS } from '../core/world'
import { POINT_SHAPE, NOISE } from '../shaders/common'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 6 — AUTOMATION
//
// A production line running away into the dark. The camera travels it rather
// than observing it. A payload of light moves down the pipe and each gate fires
// as it passes — the stages are not labelled boxes, they are events.
// ─────────────────────────────────────────────────────────────────────────────

const STAGES = [
  { name: 'Lead', note: 'Captured' },
  { name: 'Requirement', note: 'Scoped' },
  { name: 'Design', note: 'Approved' },
  { name: 'Development', note: 'Built' },
  { name: 'Testing', note: 'Verified' },
  { name: 'Deployment', note: 'Shipped' },
  { name: 'Monitoring', note: 'Watched' },
]

const SPAN = 4.4 // distance between gates
const Z0 = ((STAGES.length - 1) * SPAN) / 2 // first gate sits nearest the camera

const zAt = (i) => Z0 - i * SPAN

// ── Conveyor: material streaming down the pipe ───────────────────────────────

const flowVert = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uZ0;
uniform float uLen;
attribute float aSeed;
attribute float aRadius;
attribute float aAngle;
varying float vAlpha;
varying float vSeed;

void main(){
  // Helical travel down the pipe. Recycled with fract, so the stream is
  // endless without ever respawning a particle on the CPU.
  float t = fract(aSeed + uTime * (0.06 + aSeed * 0.05));
  float z = uZ0 - t * uLen;
  float ang = aAngle + t * 5.0;

  vec3 p = vec3(cos(ang) * aRadius, sin(ang) * aRadius, z);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  // Fade at both ends of the run so nothing appears or vanishes abruptly.
  vAlpha = sin(t * 3.14159) * uOpacity;
  vSeed = aSeed;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * (16.0 / max(dist, 0.8)) * (0.5 + aSeed);
}
`

const flowFrag = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
varying float vSeed;
${POINT_SHAPE}
void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha * (0.35 + vSeed * 0.65);
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor, a);
}
`

function Conveyor({ data }) {
  const mat = useRef()
  const count = state.quality === 'high' ? 2600 : state.quality === 'medium' ? 1200 : 500
  const len = (STAGES.length - 1) * SPAN + SPAN

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const radius = new Float32Array(count)
    const angle = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      seed[i] = Math.random()
      // Hollow-ish tube: most particles ride the wall, some the core.
      radius[i] = Math.random() > 0.35 ? 1.5 + Math.random() * 0.55 : Math.random() * 1.1
      angle[i] = Math.random() * Math.PI * 2
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1))
    g.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), len)
    return g
  }, [count, len])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uZ0: { value: Z0 + SPAN * 0.5 },
      uLen: { value: len },
      uColor: { value: new THREE.Color('#b7ff6a') },
    }),
    [len],
  )

  useFrame((_, dt) => {
    if (!data.current.active) return
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    u.uPixelRatio.value = state.dpr
    u.uOpacity.value = data.current.band * 0.85
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: flowVert, fragmentShader: flowFrag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ── A gate ───────────────────────────────────────────────────────────────────

function Gate({ stage, index, data, payload }) {
  const ring = useRef()
  const inner = useRef()
  const flash = useRef()
  const fire = useRef(0)
  const fade = useRef(0)
  const z = zAt(index)

  useFrame((_, dt) => {
    if (!data.current.active) {
      fade.current = 0
      return
    }
    const d = Math.min(dt, 0.05)

    // Fires as the payload crosses this gate's plane, then decays. The gate
    // stays warm afterwards — the stage is now "live", not reset.
    const near = 1 - THREE.MathUtils.clamp(Math.abs(payload.current - z) / SPAN, 0, 1)
    const passed = payload.current < z ? 1 : 0
    const target = Math.max(Math.pow(near, 2.2), passed * 0.32)
    fire.current += (target - fire.current) * (1 - Math.exp(-7 * d))

    const b = data.current.band
    // Stage names brighten as their gate fires, so the eye is led down the line.
    fade.current = b * (0.45 + fire.current * 0.55)
    if (ring.current) {
      ring.current.rotation.z += (0.1 + fire.current * 0.7) * d
      ring.current.scale.setScalar(1 + fire.current * 0.09)
      const u = ring.current.material.uniforms
      if (u) u.uOpacity.value = (0.22 + fire.current * 0.85) * b
    }
    if (inner.current?.material.uniforms) {
      const u = inner.current.material.uniforms
      u.uHover.value = fire.current
      u.uOpacity.value = (0.16 + fire.current * 0.8) * b
      inner.current.scale.setScalar(0.30 + fire.current * 0.14)
    }
    if (flash.current) {
      flash.current.scale.setScalar(1.5 + fire.current * 1.6)
      flash.current.material.opacity = fire.current * 0.05 * b
    }
  })

  return (
    <group position={[0, 0, z]}>
      <GlowRing ref={ring} radius={2.25} tube={0.022} speed={0.2 + index * 0.03} />
      <Orb ref={inner} radius={1} detail={2} amp={0.12} />
      <mesh ref={flash}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color="#b7ff6a"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <WorldLabel center distanceFactor={10} position={[0, 3.0, 0]} fade={fade} className="uv-stage">
        <span className="uv-stage__idx">{String(index + 1).padStart(2, '0')}</span>
        <span className="uv-stage__name">{stage.name}</span>
        <span className="uv-stage__note">{stage.note}</span>
      </WorldLabel>
    </group>
  )
}

export default function Automation() {
  const { group, d } = useScene('automation')
  const fade = useRef(0)
  const payload = useRef(Z0 + SPAN)
  const head = useRef()

  // The rails: two lines running the length of the pipe.
  const rails = useMemo(() => {
    const a = Z0 + SPAN * 0.6
    const b = zAt(STAGES.length - 1) - SPAN * 0.6
    return [
      [new THREE.Vector3(-2.25, 0, a), new THREE.Vector3(-2.25, 0, b)],
      [new THREE.Vector3(2.25, 0, a), new THREE.Vector3(2.25, 0, b)],
      [new THREE.Vector3(0, 2.25, a), new THREE.Vector3(0, 2.25, b)],
      [new THREE.Vector3(0, -2.25, a), new THREE.Vector3(0, -2.25, b)],
    ]
  }, [])

  useFrame(() => {
    fade.current = d.current.band
    if (!d.current.active) return

    // Scroll drives the payload down the line, so the user is running the
    // factory. It leads slightly so gates fire just ahead of the camera.
    const t = THREE.MathUtils.smoothstep(d.current.local, 0.02, 0.95)
    const from = Z0 + SPAN * 0.8
    const to = zAt(STAGES.length - 1) - SPAN * 0.8
    payload.current = THREE.MathUtils.lerp(from, to, t)

    if (head.current) {
      head.current.position.z = payload.current
      head.current.scale.setScalar(0.5 + Math.sin(d.current.t * 5) * 0.04)
      const u = head.current.material.uniforms
      if (u) u.uOpacity.value = d.current.band
    }

    if (group.current) {
      group.current.rotation.y = state.smooth.x * 0.05
      group.current.rotation.x = state.smooth.y * 0.035
    }
  })

  return (
    <group ref={group} position={ANCHORS.automation}>
      <Filaments links={rails} color="#b7ff6a" opacity={0.3} segments={24} fade={fade} />
      <Conveyor data={d} />
      {STAGES.map((s, i) => (
        <Gate key={s.name} stage={s} index={i} data={d} payload={payload} />
      ))}
      {/* The work-in-progress itself. */}
      <Orb ref={head} radius={1} detail={3} amp={0.16} color="#ffffff" core="#b7ff6a" />
    </group>
  )
}
