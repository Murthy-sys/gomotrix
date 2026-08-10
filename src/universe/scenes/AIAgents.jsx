import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScene from '../core/useScene'
import { state, set } from '../core/store'
import { Orb } from '../world/Holo'
import { Filaments, Pulses } from '../world/EnergyFlow'
import WorldLabel from '../world/WorldLabel'
import { ANCHORS } from '../core/world'
import { NOISE, POINT_SHAPE } from '../shaders/common'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5 — AI AGENTS
//
// The camera is inside the network, not looking at a diagram of one. Thousands
// of nodes drift in a volume; a sparse subset is wired together and carries
// signal. Five agents hang in the foreground — click one and it shows what it
// actually does, four words at a time. No paragraphs anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'support',
    name: 'Customer Support',
    pos: [-0.6, 2.2, 2.4],
    color: '#dbe6f2',
    skills: ['Conversation', 'Decision making', 'Workflow', 'API execution', 'Escalation'],
  },
  {
    id: 'ocr',
    name: 'Document AI · OCR',
    pos: [2.4, -2.6, 3.6],
    color: '#cfe0ff',
    skills: ['Extraction', 'Classification', 'Validation', 'Structured output', 'Archival'],
  },
  {
    id: 'crm',
    name: 'CRM Copilot',
    pos: [6.4, 2.6, 2.0],
    color: '#dbe6f2',
    skills: ['Lead scoring', 'Enrichment', 'Outreach drafts', 'Pipeline sync', 'Forecasting'],
  },
  {
    id: 'automation',
    name: 'Automation',
    pos: [9.6, -0.8, 3.2],
    color: '#dbe6f2',
    skills: ['Triggers', 'Decision making', 'API execution', 'Retries', 'Audit trail'],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    pos: [4.6, 5.2, 1.2],
    color: '#cfe0ff',
    skills: ['Natural language Q&A', 'Aggregation', 'Anomaly detection', 'Forecasting', 'Reporting'],
  },
]

// ── The network volume ───────────────────────────────────────────────────────

const netVert = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uReveal;
uniform vec2  uPointer;
attribute float aSeed;
attribute float aScale;
attribute float aLayer;
varying float vAlpha;
varying float vFire;

${NOISE}

void main(){
  vec3 p = position;

  // Slow structural drift — the network is thinking, not idling.
  float n = snoise(p * 0.10 + vec3(0.0, 0.0, uTime * 0.055));
  p += vec3(n, snoise(p * 0.11 + 21.0), snoise(p * 0.09 + 47.0)) * 0.85;

  // Layers light up front-to-back, like activation sweeping through a net.
  float gate = smoothstep(aLayer - 0.25, aLayer + 0.1, uReveal);

  p.xy += uPointer * (0.4 + aSeed * 0.5);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;

  // Individual neurons fire on their own rhythm.
  vFire = pow(0.5 + 0.5 * sin(uTime * 1.7 + aSeed * 42.0 + aLayer * 6.0), 6.0);

  vAlpha = gate * uOpacity * smoothstep(0.5, 6.0, dist) * (0.3 + aSeed * 0.45);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * aScale * (9.0 / max(dist, 0.8)) * (1.0 + vFire * 1.2);
}
`

const netFrag = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform vec3 uHot;
varying float vAlpha;
varying float vFire;
${POINT_SHAPE}
void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha * (0.5 + vFire * 0.8);
  if (a < 0.003) discard;
  gl_FragColor = vec4(mix(uColor, uHot, vFire), a);
}
`

function Network({ data }) {
  const mat = useRef()
  const count = state.quality === 'high' ? 4200 : state.quality === 'medium' ? 2000 : 900

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const scale = new Float32Array(count)
    const layer = new Float32Array(count)

    // Six loose sheets rather than a uniform cloud — the eye reads depth and
    // structure instead of fog.
    const LAYERS = 6
    for (let i = 0; i < count; i++) {
      const l = Math.floor(Math.random() * LAYERS)
      const z = -9 + l * 3.4 + (Math.random() - 0.5) * 1.9
      const r = Math.pow(Math.random(), 0.62) * 12
      const a = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = Math.sin(a) * r * 0.72
      pos[i * 3 + 2] = z
      seed[i] = Math.random()
      scale[i] = 0.4 + Math.pow(Math.random(), 2.0) * 1.5
      layer[i] = l / (LAYERS - 1)
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    g.setAttribute('aLayer', new THREE.BufferAttribute(layer, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 22)
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uReveal: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color('#8fa6c4') },
      uHot: { value: new THREE.Color('#eaf2ff') },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!data.current.active) return
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    u.uPixelRatio.value = state.dpr
    u.uReveal.value = THREE.MathUtils.smoothstep(data.current.local, 0.0, 0.55)
    u.uOpacity.value = data.current.band
    u.uPointer.value.set(state.smooth.x, state.smooth.y)
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader: netVert, fragmentShader: netFrag }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ── Agents ───────────────────────────────────────────────────────────────────

function Agent({ agent, data, selected, onSelect }) {
  const wrap = useRef() // the group that moves and scales
  const orb = useRef() // the Orb mesh, whose shader uniforms we drive
  const halo = useRef()
  const [hovered, setHovered] = useState(false)
  const energy = useRef(0)
  const fade = useRef(0)
  const home = useMemo(() => new THREE.Vector3(...agent.pos), [agent.pos])
  const isOpen = selected === agent.id

  useFrame((_, dt) => {
    if (!data.current.active || !wrap.current) {
      fade.current = 0
      return
    }
    const d = Math.min(dt, 0.05)
    const t = data.current.t

    const want = isOpen ? 1 : hovered ? 0.6 : 0
    energy.current += (want - energy.current) * (1 - Math.exp(-5 * d))

    // Each agent bobs on its own frequency so the group never pulses in unison.
    const k = home.x * 0.7 + home.y
    wrap.current.position.set(
      home.x + Math.sin(t * 0.27 + k) * 0.34,
      home.y + Math.cos(t * 0.23 + k) * 0.30,
      // Selected agent comes toward the viewer.
      home.z + Math.sin(t * 0.18 + k) * 0.22 + energy.current * 1.1,
    )

    const s = 0.62 * (1 + energy.current * 0.34)
    wrap.current.scale.setScalar(s)

    fade.current = data.current.band
    const u = orb.current?.material.uniforms
    if (u) {
      u.uHover.value = energy.current
      u.uOpacity.value = data.current.band
    }
    if (halo.current) {
      halo.current.position.copy(wrap.current.position)
      halo.current.scale.setScalar(s * (1.35 + energy.current * 0.5))
      halo.current.material.opacity = (0.018 + energy.current * 0.055) * data.current.band
    }
  })

  const enter = () => {
    setHovered(true)
    set({ hovered: agent.id })
    document.body.style.cursor = 'pointer'
  }
  const leave = () => {
    setHovered(false)
    set({ hovered: null })
    document.body.style.cursor = ''
  }

  return (
    <group>
      <group ref={wrap}>
        <mesh
          onPointerOver={enter}
          onPointerOut={leave}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(isOpen ? null : agent.id)
          }}
          visible={false}
        >
          <sphereGeometry args={[2.2, 8, 8]} />
        </mesh>
        <Orb ref={orb} radius={1} detail={3} color={agent.color} amp={0.1} />

        <WorldLabel
          center
          distanceFactor={15}
          zIndexRange={[30, 0]}
          fade={fade}
          className={`uv-agent ${hovered ? 'is-hot' : ''} ${isOpen ? 'is-open' : ''}`}
        >
          <span className="uv-agent__name">{agent.name}</span>
          <ul className="uv-agent__skills" aria-hidden={!isOpen}>
            {agent.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </WorldLabel>
      </group>

      <mesh ref={halo}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={agent.color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export default function AIAgents() {
  const { group, d } = useScene('agents')
  const [selected, setSelected] = useState(null)
  const fade = useRef(0)

  // Every agent is wired to every other one — the mesh, not a hub and spoke.
  const links = useMemo(() => {
    const out = []
    for (let i = 0; i < AGENTS.length; i++) {
      for (let j = i + 1; j < AGENTS.length; j++) {
        out.push([new THREE.Vector3(...AGENTS[i].pos), new THREE.Vector3(...AGENTS[j].pos)])
      }
    }
    return out
  }, [])

  useFrame(() => {
    fade.current = d.current.band
    if (!d.current.active || !group.current) return
    group.current.rotation.y = state.smooth.x * 0.07 + Math.sin(d.current.t * 0.1) * 0.04
    group.current.rotation.x = state.smooth.y * 0.05
  })

  return (
    <group ref={group} position={ANCHORS.agents}>
      <Network data={d} />
      <Filaments links={links} color="#93a8c0" opacity={0.5} fade={fade} />
      <Pulses links={links} perLink={4} speed={0.13} size={1.3} color="#d8ffb0" arc={1.4} fade={fade} />
      {AGENTS.map((a) => (
        <Agent key={a.id} agent={a} data={d} selected={selected} onSelect={setSelected} />
      ))}
    </group>
  )
}
