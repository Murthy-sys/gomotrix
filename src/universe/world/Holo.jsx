import { useMemo, useRef, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C } from '../core/theme'

// ─────────────────────────────────────────────────────────────────────────────
// Surfaces.
//
// Rewritten. The first version made every object an additive shader that emitted
// its own colour, which is why nothing had form: additive geometry cannot be
// shaded, cannot occlude, and cannot receive light. Stack a few and you get
// exactly what this looked like — a green haze.
//
// These are physical materials now. They are lit by the studio rig in
// Atmosphere, they write depth, they reflect the environment, and the accent
// appears only as emissive on things that are genuinely active.
//
// Scenes drive these imperatively through `.material.uniforms.uHover/.uOpacity`,
// so each component still exposes that shape even where it is no longer a raw
// ShaderMaterial.
// ─────────────────────────────────────────────────────────────────────────────

// ── Orb ──────────────────────────────────────────────────────────────────────

/**
 * A glass sphere with a lit core.
 *
 * Two layers: a transmissive outer shell that picks up the environment, and a
 * small emissive centre. Reading as "a lit object with something glowing inside"
 * rather than "a ball of light" is the whole difference in feel.
 */
/**
 * Scenes drive these objects by writing `mesh.material.uniforms.uHover/.uOpacity`.
 * meshStandardMaterial has no `uniforms`, so we graft the same handle onto the
 * material instance. Materials are plain objects — this is safe, and it means
 * every existing scene keeps working without a rewrite.
 */
function attachUniforms(material, api) {
  if (material && !material.uniforms) material.uniforms = api.uniforms
}

/**
 * A glass sphere with a lit core.
 *
 * Two layers: a transmissive outer shell that picks up the environment, and a
 * small emissive centre. Reading as "a lit object with something glowing inside"
 * rather than "a ball of light" is the whole difference in feel.
 */
export const Orb = forwardRef(function Orb(
  { radius = 1, detail = 4, color = '#b7ff6a', emissive = 0.8, opacity = 1, amp, core: coreColor, ...props },
  ref,
) {
  const shell = useRef()
  const core = useRef()

  const api = useMemo(
    () => ({ uniforms: { uHover: { value: 0 }, uOpacity: { value: opacity } } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame(() => {
    const o = THREE.MathUtils.clamp(api.uniforms.uOpacity.value, 0, 1)
    const h = THREE.MathUtils.clamp(api.uniforms.uHover.value, 0, 1)

    if (shell.current) {
      shell.current.visible = o > 0.01
      shell.current.material.opacity = 0.22 * o
    }
    if (core.current) {
      core.current.visible = o > 0.01
      // The core is the only thing allowed past 1.0 — it is a real light source,
      // so it is what bloom should be catching, and nothing else.
      core.current.material.emissiveIntensity = (emissive * 2.1 + h * 1.4) * o
      core.current.material.opacity = o
      core.current.scale.setScalar(0.3 + h * 0.06)
    }
  })

  return (
    <mesh ref={ref} {...props}>
      {/* Host geometry is degenerate; its material exists only to carry the
          uniforms handle, and is marked invisible so it draws nothing. */}
      <sphereGeometry args={[0.0001, 3, 2]} />
      <meshBasicMaterial
        ref={(m) => attachUniforms(m, api)}
        visible={false}
        transparent
        opacity={0}
      />

      <mesh ref={shell}>
        <icosahedronGeometry args={[radius, detail]} />
        {/* Glass by alpha, not by transmission. `transmission` refracts only
            the *background*, so the emissive core sitting inside this shell was
            invisible and the orb read as a dead grey marble. It also costs a
            separate render pass per material, which adds up fast with a dozen
            orbs on screen. Plain transparency + clearcoat gets the same read. */}
        <meshPhysicalMaterial
          color={C.surface}
          roughness={0.05}
          metalness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2.4}
          iridescence={0.6}
          iridescenceIOR={1.6}
          iridescenceThicknessRange={[100, 520]}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={core}>
        <icosahedronGeometry args={[radius, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          roughness={0.25}
          metalness={0.1}
          envMapIntensity={1.4}
          transparent
        />
      </mesh>
    </mesh>
  )
})

// ── Glass panel ──────────────────────────────────────────────────────────────

const panelVert = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;
void main(){
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

// Frosted neutral glass. The border is a hairline of light, not a neon tube —
// at the old strength it read as an outline and swallowed its own contents.
const panelFrag = /* glsl */ `
precision highp float;

uniform float uOpacity;
uniform float uRadius;
uniform float uAspect;
uniform vec3  uAccent;
uniform vec3  uFill;
uniform float uHover;
uniform float uBorder;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main(){
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float d = sdRoundBox(p, vec2(0.5 * uAspect, 0.5) - 0.004, uRadius);

  float aa = fwidth(d) * 1.2;
  float inside = 1.0 - smoothstep(-aa, aa, d);
  if (inside < 0.002) discard;

  float fres = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 3.0);
  float border = (1.0 - smoothstep(0.0, uBorder, abs(d))) * inside;

  // Neutral body, a soft sheen where it turns away, a white hairline edge.
  // Vertical falloff across the pane — glass is never one flat value.
  vec3 col = mix(uFill * 1.55, uFill * 0.55, vUv.y);
  // Cool sheen where it turns away, warm where it faces the key. The same
  // temperature split the lighting rig uses.
  col += vec3(0.42, 0.54, 0.78) * fres * 0.42;
  col += vec3(0.30, 0.26, 0.22) * (1.0 - fres) * 0.10;
  col += vec3(1.0) * border * 0.34;
  // Accent appears only on hover — the "active" signal, nothing more.
  col += uAccent * border * uHover * 0.75;
  col += uAccent * fres * uHover * 0.16;

  float alpha = inside * uOpacity * (0.55 + fres * 0.4);
  alpha = max(alpha, border * (0.22 + uHover * 0.5));

  gl_FragColor = vec4(col, alpha);
}
`

export const GlassPanel = forwardRef(function GlassPanel(
  {
    width = 3,
    height = 2,
    radius = 0.12,
    opacity = 0.5,
    accent = '#b7ff6a',
    fill = '#151A1F',
    border = 0.005,
    // Accepted and ignored: scenes still pass it, but scanlines were part of
    // the old hologram look.
    scan,
    ...props
  },
  ref,
) {
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: opacity },
      uRadius: { value: radius },
      uAspect: { value: width / height },
      uAccent: { value: new THREE.Color(accent) },
      uFill: { value: new THREE.Color(fill) },
      uHover: { value: 0 },
      uBorder: { value: border },
      uScan: { value: 0 }, // kept so existing scene writes don't throw
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <mesh ref={ref} {...props} userData={{ uniforms }}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        args={[{ uniforms, vertexShader: panelVert, fragmentShader: panelFrag }]}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
})

// ── Rings ────────────────────────────────────────────────────────────────────

/** A thin machined ring. Metal, lit — not a glowing hoop. */
export const GlowRing = forwardRef(function GlowRing(
  { radius = 4, tube = 0.012, color = '#b7ff6a', opacity = 0.9, speed, ...props },
  ref,
) {
  const self = useRef()
  const api = useMemo(
    () => ({ uniforms: { uOpacity: { value: opacity } } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame(() => {
    const m = self.current
    if (!m) return
    const o = THREE.MathUtils.clamp(api.uniforms.uOpacity.value, 0, 1)
    m.visible = o > 0.01
    m.material.opacity = o * 0.9
    m.material.emissiveIntensity = o * 0.4
  })

  return (
    <mesh
      ref={(n) => {
        self.current = n
        if (typeof ref === 'function') ref(n)
        else if (ref) ref.current = n
      }}
      {...props}
    >
      <torusGeometry args={[radius, tube, 8, 128]} />
      <meshStandardMaterial
        ref={(m) => attachUniforms(m, api)}
        color={C.metal}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={1}
        roughness={0.16}
        envMapIntensity={2.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
})

// ── Radial glow ──────────────────────────────────────────────────────────────

const glowVert = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const glowFrag = /* glsl */ `
precision mediump float;
uniform vec3  uColor;
uniform float uOpacity;
uniform float uFalloff;
varying vec2 vUv;
void main(){
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(max(0.0, 1.0 - d), uFalloff) * uOpacity;
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColor, a);
}
`

/** A soft pool of light behind a subject. Neutral by default now. */
export const RadialGlow = forwardRef(function RadialGlow(
  { size = 8, color = '#8fa6c4', opacity = 0.1, falloff = 2.6, ...props },
  ref,
) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uFalloff: { value: falloff },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <mesh ref={ref} {...props} userData={{ uniforms }}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        args={[{ uniforms, vertexShader: glowVert, fragmentShader: glowFrag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
})
