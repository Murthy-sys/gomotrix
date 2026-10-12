import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Orb } from '../world/Holo'
import { NOISE, CURL, POINT_SHAPE } from '../shaders/common'

// ─────────────────────────────────────────────────────────────────────────────
// The retained hero composition. Its particles start at the original headline
// pose, while their slow surface movement keeps the sphere alive.
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
  float breathe = snoise(aTarget * 1.5 + vec3(0.0, uTime * 0.28, 0.0));
  p += normalize(aTarget + 1e-5) * breathe * 0.16 * form;

  // Slow rotation of the assembled body.
  float ang = uTime * 0.09 * form;
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
const ASSEMBLE = THREE.MathUtils.smoothstep(0.62, 0.1, 0.72)
const ORB_SCALE = THREE.MathUtils.lerp(0.05, 1, ASSEMBLE) * CORE_R * 0.92

export default function Spark({ quality = 'high', dpr = 1, animate = true, pointer }) {
  const mat = useRef()
  const count = quality === 'high' ? 42000 : quality === 'medium' ? 16000 : 6500

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

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAssemble: { value: ASSEMBLE },
      uSize: { value: 1.5 },
      uPixelRatio: { value: dpr },
      uTurb: { value: 1 - ASSEMBLE * 0.85 },
      uPointer: { value: new THREE.Vector2() },
      uAccent: { value: new THREE.Color('#cfe0ff') },
      uWhite: { value: new THREE.Color('#ffffff') },
      uOpacity: { value: 1 },
    }),
    [dpr],
  )

  useFrame((_, dt) => {
    const u = mat.current?.uniforms
    if (!u) return
    if (animate) u.uTime.value += Math.min(dt, 0.1)
    if (pointer) u.uPointer.value.copy(pointer.current)
    else u.uPointer.value.set(0, 0)
  })

  return (
    <group>
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
      <Orb radius={1} detail={4} opacity={0.8} scale={ORB_SCALE} />
    </group>
  )
}
