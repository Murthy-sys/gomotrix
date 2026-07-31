import { useMemo, useRef, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { POINT_SHAPE } from '../shaders/common'

// ─────────────────────────────────────────────────────────────────────────────
// Energy travelling between things.
//
// Used by the ecosystem rings, the neural net, the automation pipeline, the
// client constellation and the finale. Every link in the entire experience is
// two draw calls total: one for the filaments, one for every pulse on all of
// them. Doing this per-link would have meant hundreds.
// ─────────────────────────────────────────────────────────────────────────────

const pulseVert = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uSize;
uniform float uPixelRatio;
uniform float uReveal;
uniform float uArc;

attribute vec3  aFrom;
attribute vec3  aTo;
attribute float aOffset;
attribute float aScale;
attribute float aLink;

varying float vAlpha;

void main(){
  // Links reveal in sequence rather than all at once — the eye gets to follow
  // the signal spreading outward.
  float gate = smoothstep(aLink - 0.15, aLink + 0.05, uReveal);

  float t = fract(aOffset + uTime * uSpeed);
  vec3 p = mix(aFrom, aTo, t);

  // Bow the path so links between distant nodes don't read as flat rulers.
  vec3 axis = aTo - aFrom;
  vec3 bend = normalize(cross(axis, vec3(0.0, 1.0, 0.001)));
  p += bend * sin(t * 3.14159) * uArc * length(axis) * 0.08;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;

  // Fade in and out at the ends so pulses emerge and dissolve, never blink.
  vAlpha = sin(t * 3.14159) * gate;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (16.0 / max(dist, 0.7));
}
`

const pulseFrag = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;

${POINT_SHAPE}

void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor, a);
}
`

/**
 * Particles streaming along a set of links.
 * @param links Array of [THREE.Vector3 from, THREE.Vector3 to]
 */
export const Pulses = forwardRef(function Pulses(
  {
    links,
    perLink = 6,
    speed = 0.22,
    size = 1.6,
    color = '#b7ff6a',
    opacity = 1,
    arc = 1,
    pixelRatio = 1,
    reveal, // optional ref holding 0..1 — links switch on in sequence
    fade, // optional ref holding 0..1 master opacity
  },
  ref,
) {
  const mat = useRef()

  const geometry = useMemo(() => {
    const n = links.length * perLink
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(n * 3) // unused, but position is mandatory
    const from = new Float32Array(n * 3)
    const to = new Float32Array(n * 3)
    const offset = new Float32Array(n)
    const scale = new Float32Array(n)
    const link = new Float32Array(n)

    let i = 0
    links.forEach(([a, b], li) => {
      for (let k = 0; k < perLink; k++, i++) {
        from[i * 3] = a.x; from[i * 3 + 1] = a.y; from[i * 3 + 2] = a.z
        to[i * 3] = b.x; to[i * 3 + 1] = b.y; to[i * 3 + 2] = b.z
        // Even spacing plus jitter: a rhythm, not a metronome.
        offset[i] = k / perLink + Math.random() * 0.06
        scale[i] = 0.6 + Math.random() * 0.9
        link[i] = links.length > 1 ? li / (links.length - 1) : 0
      }
    })

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
    g.setAttribute('aTo', new THREE.BufferAttribute(to, 3))
    g.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    g.setAttribute('aLink', new THREE.BufferAttribute(link, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4)
    return g
  }, [links, perLink])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uSize: { value: size },
      uPixelRatio: { value: pixelRatio },
      uReveal: { value: 1 },
      uArc: { value: arc },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((_, dt) => {
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    if (reveal) u.uReveal.value = reveal.current
    if (fade) u.uOpacity.value = opacity * fade.current
  })

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false} userData={{ uniforms }}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: pulseVert, fragmentShader: pulseFrag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
})

// ── Static filaments ─────────────────────────────────────────────────────────

const lineVert = /* glsl */ `
uniform float uReveal;
attribute float aT;      // 0..1 along the segment
attribute float aLink;   // 0..1 index of the link, for staggered reveal
varying float vT;
varying float vGate;
void main(){
  vT = aT;
  vGate = smoothstep(aLink - 0.2, aLink + 0.05, uReveal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const lineFrag = /* glsl */ `
precision mediump float;
uniform vec3  uColor;
uniform float uOpacity;
varying float vT;
varying float vGate;
void main(){
  // Bright at the nodes, thin in the middle — suggests the connection is
  // anchored rather than floating.
  float ends = pow(abs(vT - 0.5) * 2.0, 2.0);
  float a = (0.14 + ends * 0.4) * uOpacity * vGate;
  gl_FragColor = vec4(uColor, a);
}
`

/** Thin glowing connections. One LineSegments draw call for the whole graph. */
export function Filaments({
  links,
  color = '#b7ff6a',
  opacity = 0.5,
  segments = 10,
  reveal,
  fade,
}) {
  const mat = useRef()

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const verts = []
    const ts = []
    const ls = []
    const tmp = new THREE.Vector3()

    links.forEach(([a, b], li) => {
      const li01 = links.length > 1 ? li / (links.length - 1) : 0
      // Subdivided so the gradient in the fragment shader has something to
      // interpolate across, and so future curvature is possible.
      for (let s = 0; s < segments; s++) {
        const t0 = s / segments
        const t1 = (s + 1) / segments
        tmp.lerpVectors(a, b, t0)
        verts.push(tmp.x, tmp.y, tmp.z)
        ts.push(t0)
        ls.push(li01)
        tmp.lerpVectors(a, b, t1)
        verts.push(tmp.x, tmp.y, tmp.z)
        ts.push(t1)
        ls.push(li01)
      }
    })

    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    g.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1))
    g.setAttribute('aLink', new THREE.Float32BufferAttribute(ls, 1))
    return g
  }, [links, segments])

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uReveal: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame(() => {
    const u = mat.current?.uniforms
    if (!u) return
    if (reveal) u.uReveal.value = reveal.current
    if (fade) u.uOpacity.value = opacity * fade.current
  })

  return (
    <lineSegments geometry={geometry} frustumCulled={false} userData={{ uniforms }}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: lineVert, fragmentShader: lineFrag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}
