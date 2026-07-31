import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { NOISE, POINT_SHAPE, HASH } from '../shaders/common'
import { state } from '../core/store'

const vert = /* glsl */ `
uniform float uTime;
uniform vec3  uCam;
uniform float uBox;
uniform float uSize;
uniform float uDrift;
uniform vec2  uPointer;
uniform float uPixelRatio;

attribute float aSeed;
attribute float aScale;

varying float vAlpha;
varying float vSeed;

${NOISE}

void main(){
  vec3 p = position;

  // Slow organic drift. Cheap: one noise lookup, not a full curl field —
  // there are a lot of these on screen at once.
  float t = uTime * uDrift;
  p.x += snoise(vec3(p.yz * 0.05, t)) * 1.4;
  p.y += snoise(vec3(p.zx * 0.05, t + 11.0)) * 1.4;
  p.z += snoise(vec3(p.xy * 0.05, t + 23.0)) * 1.4;

  // Infinite field: wrap every mote into a box centred on the camera. The dust
  // is therefore always around you, at zero CPU cost and constant vertex count.
  vec3 rel = p - uCam;
  float h = uBox * 0.5;
  rel = mod(rel + h, uBox) - h;

  // Cursor swirl — the air itself notices the pointer.
  float pull = 1.0 - smoothstep(0.0, h * 0.6, length(rel.xy));
  rel.xy += uPointer * pull * 2.2 * (0.4 + aSeed * 0.6);

  vec3 world = uCam + rel;
  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  float dist = -mv.z;

  // Fade at both ends: nothing pops in at the far plane, nothing smears across
  // the lens up close.
  vAlpha = smoothstep(h, h * 0.25, dist) * smoothstep(0.6, 5.0, dist);
  vAlpha *= 0.25 + aSeed * 0.75;
  vSeed = aSeed;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (18.0 / max(dist, 0.6));
}
`

const frag = /* glsl */ `
precision mediump float;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uOpacity;
// Must match the vertex stage, which gets highp by default. A bare
// "uniform float" here would be mediump and the program would fail to link.
uniform highp float uTime;

varying float vAlpha;
varying float vSeed;

${POINT_SHAPE}
${HASH}

void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha * uOpacity;
  if (a < 0.002) discard;

  // A minority of motes carry the accent hue. Too many and it stops reading as
  // dust and starts reading as confetti.
  float tint = step(0.86, vSeed) * (0.5 + 0.5 * sin(uTime * 1.4 + vSeed * 60.0));
  vec3 col = mix(uColorA, uColorB, tint);

  gl_FragColor = vec4(col, a);
}
`

/**
 * Volumetric floating dust. One draw call, GPU-animated, infinite in extent.
 * Also doubles as the distant starfield with a larger box and slower drift.
 */
export default function Dust({
  count = 2600,
  box = 90,
  size = 1.0,
  drift = 0.05,
  opacity = 0.55,
  colorA = '#ffffff',
  colorB = '#cfe0ff',
  reactive = true,
}) {
  const mat = useRef()
  const { camera } = useThree()

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const scale = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * box
      pos[i * 3 + 1] = (Math.random() - 0.5) * box
      pos[i * 3 + 2] = (Math.random() - 0.5) * box
      seed[i] = Math.random()
      // Biased small: a few large motes near the lens, most of them fine.
      scale[i] = 0.35 + Math.pow(Math.random(), 2.4) * 1.9
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    // The wrap happens in the shader, so the CPU-side bounds are meaningless.
    // Give it an infinite sphere or three.js will frustum-cull the whole cloud.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity)
    return g
  }, [count, box])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector3() },
      uBox: { value: box },
      uSize: { value: size },
      uDrift: { value: drift },
      uOpacity: { value: opacity },
      uPointer: { value: new THREE.Vector2() },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((_, dt) => {
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    u.uCam.value.copy(camera.position)
    u.uPixelRatio.value = state.dpr
    if (reactive && !state.reduced) {
      u.uPointer.value.set(state.smooth.x, state.smooth.y)
    }
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: vert, fragmentShader: frag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
