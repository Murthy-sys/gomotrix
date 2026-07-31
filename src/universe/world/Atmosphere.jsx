import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Lightformer, Environment } from '@react-three/drei'
import * as THREE from 'three'
import Dust from './Dust'
import { state } from '../core/store'
import { C, FOG } from '../core/theme'

// ─────────────────────────────────────────────────────────────────────────────
// Light.
//
// Second pass. Killing the green emission fixed "garish" but left "plain":
// every surface was the same matte grey under one white light on a flat black
// field. Nothing to look at.
//
// What brings an image back to life is not more glow — it is:
//   · a colour temperature SPLIT, so shadows and highlights differ in hue
//   · an environment worth reflecting, so gloss has something to show
//   · a background with direction and structure instead of flat black
//
// The palette stays neutral. The interest comes from light, not from paint.
// ─────────────────────────────────────────────────────────────────────────────

const bgVert = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const bgFrag = /* glsl */ `
precision mediump float;
uniform float uTime;
uniform vec3  uAccent;
varying vec3 vDir;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// Value noise, 2 octaves. Enough to break the gradient into something that
// reads as atmosphere rather than a flat wash.
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main(){
  vec3 dir = normalize(vDir);

  // Vertical falloff, but split by temperature: the sky end is cool steel, the
  // floor end is a warmer near-black. That difference is most of what stops a
  // dark background reading as "off".
  float up = smoothstep(-0.75, 0.85, dir.y);
  vec3 cool = vec3(0.055, 0.068, 0.088);
  vec3 warm = vec3(0.028, 0.024, 0.023);
  vec3 col = mix(warm, cool, up);

  // A soft off-screen source high and to the left — the same direction as the
  // key light, so the background agrees with how objects are lit.
  float lamp = pow(max(0.0, dot(dir, normalize(vec3(-0.55, 0.5, 0.65)))), 3.2);
  col += vec3(0.10, 0.13, 0.17) * lamp * 0.55;

  // Very slow drifting haze. Large scale, low contrast — it should be felt
  // rather than seen.
  float n = vnoise(dir.xz * 3.4 + vec2(uTime * 0.008, 0.0));
  col += vec3(0.018, 0.021, 0.028) * n * (0.35 + up * 0.65);

  // One faint accent bloom low and right. The only hue in the entire backdrop.
  float glow = pow(max(0.0, dot(dir, normalize(vec3(0.7, -0.35, 0.55)))), 7.0);
  col += uAccent * glow * 0.035;

  // Dither: smooth dark gradients band badly on 8-bit displays.
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.005;

  gl_FragColor = vec4(col, 1.0);
}
`

function Backdrop() {
  const mesh = useRef()
  const mat = useRef()
  const { camera } = useThree()
  useFrame((_, dt) => {
    if (mesh.current) mesh.current.position.copy(camera.position)
    if (mat.current) mat.current.uniforms.uTime.value += dt
  })
  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={-1000}>
      <sphereGeometry args={[400, 48, 32]} />
      <shaderMaterial
        ref={mat}
        args={[
          {
            uniforms: { uTime: { value: 0 }, uAccent: { value: new THREE.Color(C.accent) } },
            vertexShader: bgVert,
            fragmentShader: bgFrag,
          },
        ]}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}

/**
 * The studio. This is what every glossy surface in the scene mirrors, so its
 * composition matters as much as the lights themselves — a big bright softbox
 * with dark gaps either side is what produces the long specular streaks that
 * make a surface look expensive.
 */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Key softbox: large, bright, camera-left and high. */}
      <Lightformer
        form="rect"
        intensity={5}
        color="#ffffff"
        scale={[12, 16, 1]}
        position={[-11, 7, 9]}
        rotation={[0, 0.65, 0]}
      />
      {/* Two narrow strips beside it. The gaps between bright bands are what
          give reflections structure instead of a flat sheen. */}
      <Lightformer form="rect" intensity={3} color="#eaf2ff" scale={[0.6, 12, 1]} position={[-4, 5, 10]} rotation={[0, 0.3, 0]} />
      <Lightformer form="rect" intensity={2.2} color="#eaf2ff" scale={[0.4, 9, 1]} position={[-1.5, 3, 10]} rotation={[0, 0.15, 0]} />

      {/* Cool fill from the opposite side — this is the temperature split. */}
      <Lightformer form="rect" intensity={1.6} color="#6f93d6" scale={[10, 12, 1]} position={[12, 1, 3]} rotation={[0, -0.8, 0]} />

      {/* Hard overhead bar: the bright line that runs along every top edge. */}
      <Lightformer
        form="rect"
        intensity={6}
        color="#ffffff"
        scale={[20, 0.5, 1]}
        position={[0, 11, -1]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Warm low bounce, opposite the cool fill. Completes the split. */}
      <Lightformer form="rect" intensity={0.9} color="#ffd9b0" scale={[12, 5, 1]} position={[2, -8, 4]} rotation={[Math.PI / 2, 0, 0]} />

      {/* One accent source. The only brand colour in the lighting rig. */}
      <Lightformer form="circle" intensity={2.2} color={C.accent} scale={[3.5, 3.5, 1]} position={[7, -4, 7]} />
    </Environment>
  )
}

export default function Atmosphere() {
  const q = state.quality

  return (
    <>
      <color attach="background" args={[FOG.color]} />
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
      <Backdrop />

      {q !== 'low' && <Studio />}

      {/* Key: bright, barely warm, high and left. Casts the form. */}
      <directionalLight position={[-9, 13, 10]} intensity={3.1} color="#fff6ec" />
      {/* Fill: cool and dim, opposite side. The hue difference against the key
          is what gives neutral surfaces depth instead of flatness. */}
      <directionalLight position={[10, -1, 4]} intensity={0.85} color="#7ea3e0" />
      {/* Rim: behind and high, separates every silhouette from the background. */}
      <directionalLight position={[3, 8, -14]} intensity={2.2} color="#dbe9ff" />
      {/* A close accent bounce — small radius, so it only kisses nearby geometry. */}
      <pointLight position={[6, -3, 6]} intensity={18} distance={26} decay={2} color={C.accent} />
      {/* Ambient stays low. This is what protects the contrast. */}
      <ambientLight intensity={0.12} color="#54627a" />

      <Dust
        count={q === 'high' ? 900 : q === 'medium' ? 450 : 200}
        box={80}
        size={0.7}
        drift={0.04}
        opacity={0.3}
        colorA="#ffffff"
        colorB="#cfe0ff"
      />
      <Dust
        count={q === 'high' ? 1100 : q === 'medium' ? 500 : 220}
        box={320}
        size={0.55}
        drift={0.01}
        opacity={0.2}
        colorA="#ffffff"
        colorB="#9db4d6"
        reactive={false}
      />
    </>
  )
}
