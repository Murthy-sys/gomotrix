import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state } from '../core/store'
import { RadialGlow } from '../world/Holo'
import { ANCHORS } from '../core/world'
import { POINT_SHAPE } from '../shaders/common'
import { webVert, webFrag } from './webScreen'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — WEB PLATFORMS
//
// A browser window that builds itself. A sweep travels down the page; above it
// every component is finished, below it there is only wireframe. Code streams in
// from the left and dissolves into the interface it produced.
//
// The whole window is one plane and one shader — 15 UI regions for the cost of a
// single draw call, and razor sharp however close the camera pushes in.
// ─────────────────────────────────────────────────────────────────────────────

export const STAGES = ['Idea', 'Research', 'Wireframe', 'Design', 'Development', 'Deployment']

const W = 13.6
const H = W / 1.62

// ── The window ───────────────────────────────────────────────────────────────

function Window({ data }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBuild: { value: 0 },
      uOpacity: { value: 1 },
      uAccent: { value: new THREE.Color('#b7ff6a') },
      uInk: { value: new THREE.Color('#070b09') },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!data.current.active) return
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    // The build occupies the middle of the scene, so the window is already in
    // frame before construction starts and stays after it finishes.
    u.uBuild.value = THREE.MathUtils.smoothstep(data.current.local, 0.1, 0.82)
    u.uOpacity.value = data.current.band
  })

  return (
    <mesh>
      <planeGeometry args={[W, H]} />
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: webVert, fragmentShader: webFrag }]}
        transparent
      />
    </mesh>
  )
}

// ── Code becoming interface ──────────────────────────────────────────────────

const codeVert = /* glsl */ `
uniform float uTime;
uniform float uFlow;
uniform float uPixelRatio;
uniform float uOpacity;
attribute vec3  aTarget;
attribute float aSeed;
attribute float aRow;
varying float vAlpha;

void main(){
  // Typing rhythm: each glyph waits its turn along its row.
  float typed = clamp(uTime * 0.5 - aRow * 0.05 - aSeed * 0.1, 0.0, 1.0);

  vec3 p = position;
  p.x += sin(uTime * 0.5 + aRow) * 0.05;

  // Then the code dissolves forward into the interface it produced.
  float f = clamp((uFlow - aSeed * 0.3) / 0.7, 0.0, 1.0);
  f = f * f * (3.0 - 2.0 * f);
  p = mix(p, aTarget, f);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vAlpha = typed * (1.0 - f * 0.9) * uOpacity;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * (16.0 / max(-mv.z, 0.8)) * (1.0 + f);
}
`

const codeFrag = /* glsl */ `
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

function CodeStream({ data }) {
  const mat = useRef()
  const count = state.quality === 'low' ? 420 : 1200

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const target = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const row = new Float32Array(count)

    const rows = 24
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * rows)
      const indent = (r % 4) * 0.26
      const len = 1.4 + Math.random() * 3.0
      // Off to the left of the window, as a column of source.
      pos[i * 3] = -W * 0.5 - 5.4 + indent + Math.random() * len
      pos[i * 3 + 1] = H * 0.42 - r * 0.3
      pos[i * 3 + 2] = 0.4 + Math.random() * 0.6

      // Each glyph is bound for somewhere inside the finished window.
      target[i * 3] = (Math.random() - 0.5) * W * 0.92
      target[i * 3 + 1] = (Math.random() - 0.5) * H * 0.86
      target[i * 3 + 2] = 0.06

      seed[i] = Math.random()
      row[i] = r
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aRow', new THREE.BufferAttribute(row, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFlow: { value: 0 },
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
    u.uPixelRatio.value = state.dpr
    const t = data.current.local
    u.uFlow.value = THREE.MathUtils.smoothstep(t, 0.5, 0.86)
    u.uOpacity.value = THREE.MathUtils.smoothstep(t, 0.16, 0.34) * data.current.band
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: codeVert, fragmentShader: codeFrag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function WebPlatform() {
  const { group, d } = useScene('web')
  const glow = useRef()

  useFrame(() => {
    if (!d.current.active || !group.current) return
    // Turns gently to face the viewer as they arrive, never enough to make the
    // interface hard to read.
    group.current.rotation.y = -0.15 + state.smooth.x * 0.045 + Math.sin(d.current.t * 0.13) * 0.02
    group.current.rotation.x = state.smooth.y * 0.025
    group.current.position.y = ANCHORS.web.y + Math.sin(d.current.t * 0.32) * 0.12

    if (glow.current?.material.uniforms) {
      glow.current.material.uniforms.uOpacity.value = 0.13 * d.current.band
    }
  })

  return (
    <group ref={group} position={ANCHORS.web}>
      <RadialGlow ref={glow} size={26} opacity={0.13} falloff={2.5} position={[0, 0, -1.4]} />
      <Window data={d} />
      <CodeStream data={d} />
    </group>
  )
}
