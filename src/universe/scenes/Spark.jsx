import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state } from '../core/store'
import { Orb, GlowRing } from '../world/Holo'
import { NOISE, CURL, POINT_SHAPE } from '../shaders/common'
import { ANCHORS } from '../core/world'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — THE SPARK
//
// Darkness. One mote of light. Then thousands of them arrive out of the void and
// assemble themselves into a core that is visibly alive.
//
// The entire assembly is a single Points draw call. Each particle knows where it
// came from and where it belongs; the shader interpolates between the two along
// a curl-noise path, staggered per particle so the swarm arrives as a wave
// rather than a snap.
// ─────────────────────────────────────────────────────────────────────────────

const vert = /* glsl */ `
uniform float uTime;
uniform float uAssemble;   // 0 = scattered in the void, 1 = fully formed
uniform float uSize;
uniform float uPixelRatio;
uniform float uTurb;
uniform vec2  uPointer;

attribute vec3  aTarget;
attribute vec3  aScatter;
attribute float aSeed;
attribute float aScale;
attribute float aStagger;

varying float vAlpha;
varying float vSeed;
varying float vForm;

${NOISE}
${CURL}

void main(){
  // Per-particle stagger: each mote begins its journey at a slightly different
  // moment, spread across the first 45% of the assembly window.
  float form = clamp((uAssemble - aStagger * 0.45) / 0.55, 0.0, 1.0);
  form = form * form * (3.0 - 2.0 * form); // smoothstep

  vec3 p = mix(aScatter, aTarget, form);

  // In flight, particles ride a divergence-free flow field so they curve in on
  // spiralling paths instead of sliding down straight lines. The influence dies
  // off as they arrive.
  float flight = sin(form * 3.14159);
  vec3 flow = curlNoise(p * 0.06 + vec3(0.0, 0.0, uTime * 0.05));
  p += flow * flight * uTurb * (2.0 + aSeed * 5.0);

  // Once formed, the surface keeps churning — the core never sits still.
  float breathe = snoise(aTarget * 1.5 + vec3(0.0, uTime * 0.35, 0.0));
  p += normalize(aTarget + 1e-5) * breathe * 0.16 * form;

  // Slow rotation of the assembled body.
  float ang = uTime * 0.12 * form;
  float c = cos(ang), s = sin(ang);
  p.xz = mat2(c, -s, s, c) * p.xz;

  // The core leans a little toward the cursor.
  p.xy += uPointer * 0.5 * form;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;

  // Motes in flight are dimmer than motes that have found their place.
  vAlpha = (0.22 + form * 0.78) * smoothstep(0.3, 4.0, dist);
  vSeed = aSeed;
  vForm = form;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (26.0 / max(dist, 0.8)) * (0.55 + form * 0.65);
}
`

const frag = /* glsl */ `
precision mediump float;
uniform vec3  uAccent;
uniform vec3  uWhite;
uniform float uOpacity;
// Must match the vertex stage, which gets highp by default. A bare
// "uniform float" here would be mediump and the program would fail to link.
uniform highp float uTime;

varying float vAlpha;
varying float vSeed;
varying float vForm;

${POINT_SHAPE}

void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha * uOpacity;
  if (a < 0.003) discard;

  // Hot white at the centre of the mass, accent green toward the surface —
  // reads as temperature, which is what makes it feel like energy.
  float heat = pow(vForm, 3.0) * (0.5 + 0.5 * sin(uTime * 2.0 + vSeed * 40.0));
  vec3 col = mix(uAccent, uWhite, heat * 0.55 + vSeed * 0.12);

  gl_FragColor = vec4(col, a);
}
`

const CORE_R = 2.6

export default function Spark() {
  const { group, d } = useScene('spark')
  const mat = useRef()
  const orb = useRef()
  const rings = useRef()
  const seed = useRef(0)

  const count = state.quality === 'high' ? 42000 : state.quality === 'medium' ? 16000 : 6500

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const target = new Float32Array(count * 3)
    const scatter = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const scales = new Float32Array(count)
    const stagger = new Float32Array(count)

    // Fibonacci sphere: the only way to distribute points on a sphere without
    // visible clumping at the poles.
    const golden = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * i

      // Most particles sit in a shell; a minority fill the interior so the core
      // has visible internal structure rather than being a hollow ball.
      const shell = Math.random() > 0.28
      const rad = shell
        ? CORE_R * (0.9 + Math.random() * 0.1)
        : CORE_R * Math.pow(Math.random(), 0.55) * 0.88

      target[i * 3] = Math.cos(theta) * r * rad
      target[i * 3 + 1] = y * rad
      target[i * 3 + 2] = Math.sin(theta) * r * rad

      // Scattered origin: a shell far out in the dark, biased *behind* the core.
      // Spawning uniformly around it sent half the swarm straight through the
      // lens, which washed the frame green instead of reading as gathering.
      const sr = 26 + Math.random() * 30
      const st = Math.random() * Math.PI * 2
      const sp = Math.acos(2 * Math.random() - 1)
      scatter[i * 3] = Math.sin(sp) * Math.cos(st) * sr
      scatter[i * 3 + 1] = Math.sin(sp) * Math.sin(st) * sr * 0.5
      scatter[i * 3 + 2] = Math.cos(sp) * sr - 26

      seeds[i] = Math.random()
      scales[i] = 0.35 + Math.pow(Math.random(), 2.2) * 1.5
      stagger[i] = Math.random()
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    g.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    g.setAttribute('aStagger', new THREE.BufferAttribute(stagger, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 90)
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uSize: { value: 1.5 },
      uPixelRatio: { value: 1 },
      uTurb: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
      uAccent: { value: new THREE.Color('#cfe0ff') },
      uWhite: { value: new THREE.Color('#ffffff') },
      uOpacity: { value: 1 },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!d.current.active) return
    const u = mat.current?.uniforms
    if (!u) return

    const t = d.current.local
    u.uTime.value += dt
    u.uPixelRatio.value = state.dpr

    // Story beats mapped onto the scene's own scroll range:
    //   0.00–0.10  a single mote, pulsing alone
    //   0.10–0.72  the swarm arrives and assembles
    //   0.72–1.00  formed, alive, camera orbiting
    const assemble = THREE.MathUtils.smoothstep(t, 0.1, 0.72)
    u.uAssemble.value = assemble
    u.uTurb.value = 1 - assemble * 0.85
    u.uPointer.value.set(state.smooth.x, state.smooth.y)

    // Everything in this scene fades with the shared band, so the transition
    // into scene 2 is a dissolve rather than a cut.
    u.uOpacity.value = d.current.band

    // The first mote: a lone point of light that pulses before anything else
    // exists. It grows into the core itself as the swarm arrives.
    seed.current += dt
    if (orb.current) {
      const birth = THREE.MathUtils.smoothstep(t, 0.0, 0.1)
      const pulse = 1 + Math.sin(seed.current * 2.6) * 0.16 * (1 - assemble)
      const s = THREE.MathUtils.lerp(0.05, 1, assemble) * pulse
      orb.current.scale.setScalar(s * CORE_R * 0.92)
      const ou = orb.current.material.uniforms
      if (ou) ou.uOpacity.value = (0.25 + birth * 0.55) * d.current.band
    }

    if (rings.current) {
      // Rings only appear once there is a core for them to orbit.
      const r = THREE.MathUtils.smoothstep(t, 0.6, 0.95)
      rings.current.scale.setScalar(THREE.MathUtils.lerp(0.4, 1, r))
      rings.current.rotation.y += dt * 0.08
      rings.current.rotation.z = Math.sin(seed.current * 0.2) * 0.12
      rings.current.children.forEach((m) => {
        if (m.material?.uniforms) m.material.uniforms.uOpacity.value = r * 0.9 * d.current.band
      })
    }
  })

  return (
    <group ref={group} position={ANCHORS.spark}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          args={[{ uniforms, vertexShader: vert, fragmentShader: frag }]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* The luminous body inside the particle shell. */}
      <Orb ref={orb} radius={1} detail={4} amp={0.08} opacity={0.5} />

      <group ref={rings}>
        <GlowRing radius={4.2} tube={0.01} speed={0.14} rotation={[Math.PI / 2, 0, 0]} />
        <GlowRing radius={5.1} tube={0.008} speed={-0.09} rotation={[Math.PI / 2, 0.5, 0.35]} />
      </group>
    </group>
  )
}
