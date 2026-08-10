import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { RadialGlow } from '../world/Holo'
import useScene from '../core/useScene'
import { state } from '../core/store'
import { ANCHORS } from '../core/world'
import { NOISE } from '../shaders/common'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4 — MOBILE APPS
//
// A single device, lit like a product film. Both the hardware and every screen
// it displays are generated in shaders — there is no model to download and no
// texture atlas to decode, which is why this scene costs almost nothing.
//
// The six screens are drawn with signed distance fields and cross-faded with a
// slide, the way Apple cuts between app states in a product video.
// ─────────────────────────────────────────────────────────────────────────────

export const SCREENS = ['Splash', 'Login', 'Dashboard', 'Booking', 'Payments', 'Analytics']

// ── The display ──────────────────────────────────────────────────────────────

const screenVert = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const screenFrag = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uPhase;     // 0..(N-1), continuous position through the screens
uniform float uOpacity;
uniform vec3  uAccent;
uniform vec3  uInk;

varying vec2 vUv;

${NOISE}

const float ASPECT = 2.125;   // screen height / width

// ── SDF primitives ──
float rbox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float seg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
// Crisp fill with derivative-based antialiasing.
float fill(float d){ return 1.0 - smoothstep(0.0, fwidth(d) * 1.5, d); }
float ring(float d, float w){ return 1.0 - smoothstep(0.0, fwidth(d) * 1.5, abs(d) - w); }

// Accumulator: rgb carries colour, a carries coverage.
void put(inout vec4 dst, float cov, vec3 col){
  dst.rgb = mix(dst.rgb, col, clamp(cov, 0.0, 1.0));
  dst.a = max(dst.a, clamp(cov, 0.0, 1.0));
}

vec3 SURF(){ return vec3(0.135, 0.146, 0.158); }
vec3 DIM(){  return vec3(0.40, 0.43, 0.46); }

// ── 0 · Splash ──
vec4 sSplash(vec2 p, float t){
  vec4 o = vec4(0.0);
  float pulse = 0.5 + 0.5 * sin(t * 2.0);
  put(o, ring(length(p) - 0.115, 0.006), uAccent * (0.7 + pulse * 0.5));
  put(o, fill(length(p) - 0.038), uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.30), vec2(0.115, 0.011), 0.011)), DIM());
  return o;
}

// ── 1 · Login ──
vec4 sLogin(vec2 p, float t){
  vec4 o = vec4(0.0);
  put(o, fill(rbox(p - vec2(0.0, 0.60), vec2(0.15, 0.018), 0.018)), vec3(0.85));
  put(o, fill(rbox(p - vec2(0.0, 0.50), vec2(0.10, 0.009), 0.009)), DIM());
  // Fields — the focused one carries an accent underline and a caret.
  for (int i = 0; i < 2; i++){
    float y = 0.16 - float(i) * 0.145;
    put(o, fill(rbox(p - vec2(0.0, y), vec2(0.185, 0.048), 0.022)), SURF());
    put(o, ring(rbox(p - vec2(0.0, y), vec2(0.185, 0.048), 0.022), 0.0016),
        i == 0 ? uAccent * 0.8 : vec3(0.18));
    put(o, fill(rbox(p - vec2(-0.10, y), vec2(0.055, 0.008), 0.008)), DIM());
  }
  float caret = step(0.5, fract(t * 1.0));
  put(o, fill(rbox(p - vec2(0.02, 0.16), vec2(0.002, 0.020), 0.001)) * caret, uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.16), vec2(0.185, 0.050), 0.024)), uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.16), vec2(0.055, 0.009), 0.009)), vec3(0.03, 0.06, 0.02));
  put(o, fill(rbox(p - vec2(0.0, -0.30), vec2(0.075, 0.007), 0.007)), DIM() * 0.7);
  return o;
}

// ── 2 · Dashboard ──
vec4 sDash(vec2 p, float t){
  vec4 o = vec4(0.0);
  put(o, fill(rbox(p - vec2(-0.11, 0.86), vec2(0.075, 0.016), 0.014)), vec3(0.85));
  put(o, fill(length(p - vec2(0.165, 0.86)) - 0.026), SURF());
  // Stat tiles, one highlighted.
  for (int i = 0; i < 4; i++){
    float cx = (mod(float(i), 2.0) - 0.5) * 0.20;
    float cy = 0.60 - floor(float(i) / 2.0) * 0.185;
    put(o, fill(rbox(p - vec2(cx, cy), vec2(0.093, 0.078), 0.026)), SURF());
    put(o, fill(rbox(p - vec2(cx - 0.045, cy + 0.035), vec2(0.030, 0.008), 0.008)), DIM());
    vec3 c = i == 0 ? uAccent : vec3(0.78);
    put(o, fill(rbox(p - vec2(cx - 0.030, cy - 0.012), vec2(0.045, 0.017), 0.010)), c);
    // Tiny sparkline in each tile.
    for (int k = 0; k < 5; k++){
      float fx = cx - 0.055 + float(k) * 0.028;
      float h = 0.010 + 0.020 * (0.5 + 0.5 * sin(float(k) * 1.7 + float(i) * 2.3 + t * 0.6));
      put(o, fill(rbox(p - vec2(fx, cy - 0.052 + h * 0.5), vec2(0.006, h * 0.5), 0.004)),
          c * 0.55);
    }
  }
  // Activity rows.
  for (int i = 0; i < 4; i++){
    float y = 0.13 - float(i) * 0.115;
    put(o, fill(rbox(p - vec2(0.0, y), vec2(0.198, 0.046), 0.020)), SURF() * 0.75);
    put(o, fill(length(p - vec2(-0.155, y)) - 0.022), uAccent * 0.35);
    put(o, fill(rbox(p - vec2(-0.045, y + 0.014), vec2(0.070, 0.007), 0.007)), vec3(0.72));
    put(o, fill(rbox(p - vec2(-0.075, y - 0.012), vec2(0.040, 0.006), 0.006)), DIM());
  }
  return o;
}

// ── 3 · Booking ──
vec4 sBooking(vec2 p, float t){
  vec4 o = vec4(0.0);
  // Map plate with a street grid.
  put(o, fill(rbox(p - vec2(0.0, 0.42), vec2(0.205, 0.40), 0.030)), vec3(0.055, 0.075, 0.085));
  for (int i = 0; i < 5; i++){
    float gx = -0.16 + float(i) * 0.08;
    put(o, fill(rbox(p - vec2(gx, 0.42), vec2(0.0015, 0.40), 0.0)) , vec3(0.10, 0.13, 0.14));
    float gy = 0.10 + float(i) * 0.16;
    put(o, fill(rbox(p - vec2(0.0, gy), vec2(0.205, 0.0015), 0.0)), vec3(0.10, 0.13, 0.14));
  }
  // Animated route.
  vec2 a = vec2(-0.13, 0.18), b = vec2(-0.02, 0.42), c = vec2(0.12, 0.66);
  put(o, ring(seg(p, a, b), 0.004), uAccent * 0.9);
  put(o, ring(seg(p, b, c), 0.004), uAccent * 0.9);
  float trav = fract(t * 0.26);
  vec2 car = trav < 0.5 ? mix(a, b, trav * 2.0) : mix(b, c, (trav - 0.5) * 2.0);
  put(o, fill(length(p - car) - 0.017), vec3(1.0));
  put(o, ring(length(p - c) - 0.026, 0.004), uAccent);
  // Booking sheet.
  put(o, fill(rbox(p - vec2(0.0, -0.52), vec2(0.205, 0.28), 0.034)), SURF());
  put(o, fill(rbox(p - vec2(0.0, -0.30), vec2(0.035, 0.005), 0.005)), DIM());
  put(o, fill(rbox(p - vec2(-0.09, -0.40), vec2(0.105, 0.014), 0.010)), vec3(0.85));
  put(o, fill(rbox(p - vec2(-0.12, -0.47), vec2(0.075, 0.008), 0.008)), DIM());
  put(o, fill(rbox(p - vec2(0.0, -0.65), vec2(0.175, 0.045), 0.022)), uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.65), vec2(0.048, 0.008), 0.008)), vec3(0.03, 0.06, 0.02));
  return o;
}

// ── 4 · Payments ──
vec4 sPayments(vec2 p, float t){
  vec4 o = vec4(0.0);
  // Card with a sheen that travels across it.
  vec2 cp = p - vec2(0.0, 0.52);
  float card = rbox(cp, vec2(0.195, 0.125), 0.030);
  put(o, fill(card), vec3(0.10, 0.13, 0.12));
  float sheen = smoothstep(0.10, 0.0, abs(cp.x - cp.y * 0.6 - (fract(t * 0.18) * 0.7 - 0.35)));
  put(o, fill(card) * sheen * 0.5, uAccent * 0.5);
  put(o, fill(rbox(cp - vec2(-0.125, 0.055), vec2(0.030, 0.022), 0.008)), uAccent * 0.75);
  put(o, fill(rbox(cp - vec2(-0.045, -0.045), vec2(0.110, 0.010), 0.008)), vec3(0.70));
  // Amount.
  put(o, fill(rbox(p - vec2(0.0, 0.25), vec2(0.090, 0.026), 0.012)), vec3(0.92));
  put(o, fill(rbox(p - vec2(0.0, 0.17), vec2(0.048, 0.007), 0.007)), DIM());
  // Keypad — one key lights on a rolling cycle.
  for (int i = 0; i < 12; i++){
    float cx = (mod(float(i), 3.0) - 1.0) * 0.115;
    float cy = -0.02 - floor(float(i) / 3.0) * 0.135;
    float hot = step(0.5, 1.0 - abs(mod(t * 1.6, 12.0) - float(i)));
    put(o, fill(length(p - vec2(cx, cy)) - 0.042), mix(SURF(), uAccent * 0.55, hot));
    put(o, fill(rbox(p - vec2(cx, cy), vec2(0.014, 0.011), 0.005)), mix(vec3(0.75), vec3(1.0), hot));
  }
  put(o, fill(rbox(p - vec2(0.0, -0.72), vec2(0.185, 0.048), 0.024)), uAccent);
  return o;
}

// ── 5 · Analytics ──
vec4 sAnalytics(vec2 p, float t){
  vec4 o = vec4(0.0);
  put(o, fill(rbox(p - vec2(-0.11, 0.88), vec2(0.085, 0.016), 0.014)), vec3(0.85));
  // Trend line built from short segments, with a filled area beneath.
  for (int i = 0; i < 7; i++){
    float x0 = -0.18 + float(i) * 0.06;
    float x1 = x0 + 0.06;
    float y0 = 0.42 + 0.11 * sin(float(i) * 0.9 + t * 0.4);
    float y1 = 0.42 + 0.11 * sin(float(i + 1) * 0.9 + t * 0.4);
    put(o, ring(seg(p, vec2(x0, y0), vec2(x1, y1)), 0.0035), uAccent);
    // Cheap area fill: a box from the baseline up to the midpoint.
    float ym = (y0 + y1) * 0.5;
    put(o, fill(rbox(p - vec2((x0 + x1) * 0.5, (0.22 + ym) * 0.5),
                     vec2(0.030, (ym - 0.22) * 0.5), 0.0)) * 0.18, uAccent);
  }
  put(o, fill(rbox(p - vec2(0.0, 0.22), vec2(0.205, 0.0012), 0.0)), vec3(0.16));
  // Bar chart.
  for (int i = 0; i < 6; i++){
    float x = -0.165 + float(i) * 0.066;
    float h = 0.045 + 0.105 * (0.5 + 0.5 * sin(float(i) * 1.4 + t * 0.55));
    vec3 c = i == 3 ? uAccent : vec3(0.26, 0.31, 0.30);
    put(o, fill(rbox(p - vec2(x, -0.34 + h * 0.5), vec2(0.021, h * 0.5), 0.010)), c);
  }
  // Legend rows.
  for (int i = 0; i < 3; i++){
    float y = -0.56 - float(i) * 0.085;
    put(o, fill(length(p - vec2(-0.165, y)) - 0.012), i == 0 ? uAccent : DIM() * 0.8);
    put(o, fill(rbox(p - vec2(-0.075, y), vec2(0.065, 0.007), 0.007)), DIM());
    put(o, fill(rbox(p - vec2(0.135, y), vec2(0.032, 0.008), 0.008)), vec3(0.70));
  }
  return o;
}

vec4 screenAt(int id, vec2 p, float t){
  if (id == 0) return sSplash(p, t);
  if (id == 1) return sLogin(p, t);
  if (id == 2) return sDash(p, t);
  if (id == 3) return sBooking(p, t);
  if (id == 4) return sPayments(p, t);
  return sAnalytics(p, t);
}

void main(){
  vec2 p = (vUv - 0.5) * vec2(1.0, ASPECT);

  // Hold each screen, then cut quickly. A linear crossfade would leave the
  // display looking permanently half-dissolved.
  float ph = clamp(uPhase, 0.0, 5.0);
  int ia = int(floor(ph));
  int ib = min(ia + 1, 5);
  float f = smoothstep(0.68, 1.0, fract(ph));

  // Slide: outgoing screen exits left, incoming enters from the right.
  vec4 A = screenAt(ia, p + vec2(f * 0.22, 0.0), uTime);
  vec4 B = screenAt(ib, p - vec2((1.0 - f) * 0.22, 0.0), uTime);

  vec3 col = mix(A.rgb, B.rgb, f);
  float cov = mix(A.a, B.a * step(0.001, f), f);

  // Status bar and home indicator persist across every screen.
  float chrome = fill(rbox(p - vec2(-0.175, 0.985), vec2(0.030, 0.007), 0.006))
               + fill(rbox(p - vec2(0.170, 0.985), vec2(0.022, 0.007), 0.006))
               + fill(rbox(p - vec2(0.0, -1.010), vec2(0.060, 0.005), 0.005));
  col = mix(col, vec3(0.62), clamp(chrome, 0.0, 1.0));
  cov = max(cov, clamp(chrome, 0.0, 1.0) * 0.8);

  // Panel backlight + a faint vignette so the display reads as glass, not paper.
  vec3 bg = vec3(0.030, 0.034, 0.039);
  vec3 outc = mix(bg, col, cov);
  outc *= 1.0 - smoothstep(0.5, 0.85, length(p * vec2(1.0, 0.52))) * 0.16;
  outc += snoise(vec3(vUv * 220.0, uTime * 0.5)) * 0.004;

  gl_FragColor = vec4(outc * uOpacity, uOpacity);
}
`

function Screen({ data }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uOpacity: { value: 1 },
      uAccent: { value: new THREE.Color('#b7ff6a') },
      uInk: { value: new THREE.Color('#05080a') },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!data.current.active) return
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    // Screens advance across the middle of the scene, so the device is already
    // in frame before the demo starts and still there once it ends.
    const t = THREE.MathUtils.smoothstep(data.current.local, 0.12, 0.94)
    u.uPhase.value = t * (SCREENS.length - 1)
    u.uOpacity.value = data.current.band
  })

  return (
    <mesh position={[0, 0, 0.152]}>
      <planeGeometry args={[2.86, 6.05]} />
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: screenVert, fragmentShader: screenFrag }]}
        transparent
      />
    </mesh>
  )
}

// ── The hardware ─────────────────────────────────────────────────────────────

const bodyVert = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main(){
  vec4 world = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

// Rather than a PBR material (which needs an environment map to look like
// anything), the chassis is a hand-authored fresnel: dark body, hot rim, and two
// specular streaks standing in for softbox reflections.
const bodyFrag = /* glsl */ `
precision highp float;
uniform vec3  uAccent;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vV;

void main(){
  vec3 n = normalize(vN);
  float fres = pow(1.0 - abs(dot(n, normalize(vV))), 3.0);

  vec3 key = normalize(vec3(0.6, 1.0, 0.55));
  vec3 rim = normalize(vec3(-0.7, 0.2, -0.6));
  float kd = max(dot(n, key), 0.0);
  float rd = pow(max(dot(n, rim), 0.0), 2.4);

  // Graphite, lit like a product shot: neutral speculars carry the form and
  // the accent only kisses the edge. Driving the rim with the brand colour at
  // 0.8 turned the whole chassis into a glowing green wireframe.
  vec3 col = vec3(0.042, 0.048, 0.054);
  col += vec3(0.85, 0.90, 0.96) * pow(kd, 34.0) * 0.85;   // tight softbox hit
  col += vec3(0.30, 0.34, 0.40) * pow(kd, 3.0) * 0.16;    // body falloff
  col += vec3(0.55, 0.60, 0.68) * rd * 0.28;              // cool back rim
  col += uAccent * fres * 0.16;                           // faint accent edge

  gl_FragColor = vec4(col * uOpacity, uOpacity);
}
`

function Body({ data }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({ uAccent: { value: new THREE.Color('#b7ff6a') }, uOpacity: { value: 1 } }),
    [],
  )
  useFrame(() => {
    if (!data.current.active) return
    if (mat.current) mat.current.uniforms.uOpacity.value = data.current.band
  })

  return (
    <RoundedBox args={[3.15, 6.35, 0.3]} radius={0.38} smoothness={5} creaseAngle={0.5}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: bodyVert, fragmentShader: bodyFrag }]}
        transparent
      />
    </RoundedBox>
  )
}

export default function MobileApps() {
  const { group, d } = useScene('mobile')
  const device = useRef()
  const glow = useRef()

  useFrame(() => {
    if (!d.current.active || !device.current) return
    const t = d.current.local

    // One slow, continuous revolution across the scene — a turntable shot. The
    // device is never still and never spins fast enough to strobe.
    const spin = -0.9 + t * 2.2
    device.current.rotation.y = spin + state.smooth.x * 0.22
    device.current.rotation.x = 0.06 + Math.sin(d.current.t * 0.28) * 0.05 - state.smooth.y * 0.12
    device.current.rotation.z = Math.sin(d.current.t * 0.22) * 0.035
    device.current.position.y = Math.sin(d.current.t * 0.4) * 0.16

    if (glow.current?.material.uniforms) {
      glow.current.material.uniforms.uOpacity.value = 0.2 * d.current.band
      glow.current.position.y = device.current.position.y
    }
  })

  return (
    <group ref={group} position={ANCHORS.mobile}>
      <group ref={device}>
        <Body data={d} />
        <Screen data={d} />
        {/* Back-side screen so the turntable never reveals a blank slab. */}
        <mesh position={[0, 0, -0.153]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.86, 6.05]} />
          <meshBasicMaterial color="#070a0c" />
        </mesh>
      </group>

      {/* Bloom source: the light the display throws into the fog around it. */}
      <RadialGlow ref={glow} size={18} opacity={0.2} falloff={2.6} position={[0, 0, -1.6]} />
    </group>
  )
}
