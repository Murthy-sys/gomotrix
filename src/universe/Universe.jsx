import { Suspense, lazy, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { AdaptiveEvents, Preload } from '@react-three/drei'

import './styles/base.css'
import './styles/overlay.css'
import './styles/world.css'
import './styles/story.css'

import { startEngine, SCROLL_VH, detectQuality } from './core/engine'
import { state, subscribe } from './core/store'
import CameraRig from './core/CameraRig'
import Atmosphere from './world/Atmosphere'
import Effects from './world/Effects'

import Preloader from './overlay/Preloader'
import Chrome from './overlay/Chrome'
import Narrative from './overlay/Narrative'
import CaseStudy from './overlay/CaseStudy'
import Finale from './overlay/Finale'
import Story from './story/Story'
import { stop as stopAudio } from './overlay/audio'

import Spark from './scenes/Spark'
import Ecosystem from './scenes/Ecosystem'

// Scenes past the opening are code-split. The first frame only needs the spark
// and the ecosystem; the rest stream in while the user is still reading the
// headline, so nothing blocks the initial paint.
const WebPlatform = lazy(() => import('./scenes/WebPlatform'))
const MobileApps = lazy(() => import('./scenes/MobileApps'))
const AIAgents = lazy(() => import('./scenes/AIAgents'))
const Showcase = lazy(() => import('./scenes/Showcase'))
const TechStack = lazy(() => import('./scenes/TechStack'))
const ContactScene = lazy(() => import('./scenes/ContactScene'))

/**
 * Guarantees the render loop comes back.
 *
 * `frameloop="never"` is the documented way to park R3F, and switching the prop
 * back to "always" is meant to restart it on its own. This does not depend on
 * that: React still renders while the loop is stopped, so the effect below runs
 * on the way out and kicks a frame by hand. If the prop does its job this is a
 * harmless no-op; if it ever does not, the world still wakes up instead of
 * leaving a frozen frame behind the reader as they scroll back into it.
 */
function LoopGuard({ covered }) {
  const invalidate = useThree((s) => s.invalidate)
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    if (covered) return
    invalidate()
    advance(performance.now())
  }, [covered, invalidate, advance])
  return null
}

export default function Universe() {
  const [entered, setEntered] = useState(false)
  // True once the story track has scrolled up over the canvas completely.
  // Holding a render loop for a world nobody can see is the one piece of the
  // 3D budget that buys nothing, so it is the one piece we stop.
  const [covered, setCovered] = useState(false)

  // Must land in the store *during render*, before any scene mounts: every
  // scene reads `state.quality` to size its particle buffers, and those are
  // allocated once. Doing this in an effect would give a low-end phone the
  // desktop particle counts for the lifetime of the page.
  const [tier] = useState(() => {
    const t = detectQuality()
    Object.assign(state, { quality: t.quality, dpr: t.dpr, reduced: t.reduced })
    return t
  })

  useEffect(() => {
    const stop = startEngine()
    document.documentElement.classList.add('uv-active')
    return () => {
      stop()
      stopAudio()
      document.documentElement.classList.remove('uv-active', 'uv-locked')
      document.body.style.cursor = ''
    }
  }, [])

  // The engine already sees every scroll value; it decides when the story track
  // has covered the canvas. This only has to mirror that one boolean into React
  // so the Canvas can be told to stop.
  useEffect(() => subscribe((s) => setCovered(s.covered)), [])

  return (
    <div className="uv-root">
      {/* The scroll surface. The canvas is fixed behind it; this element exists
          purely to give the page a real, accessible scrollbar to drive. */}
      <div className="uv-scroll" style={{ height: `${SCROLL_VH}vh` }} aria-hidden="true" />

      <div className="uv-stage">
        <Canvas
          dpr={tier.dpr}
          // 'never' parks the loop entirely while the reader is in the story
          // track; it resumes the moment any part of the world is on screen
          // again, with every scene's local clock exactly where it was left.
          frameloop={covered ? 'never' : 'always'}
          gl={{
            antialias: false, // the composer handles AA; MSAA on the canvas is wasted
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          camera={{ fov: 46, near: 0.1, far: 700, position: [0, 0.4, 30] }}
          // Pointer events only matter for the handful of clickable objects.
          onCreated={({ gl }) => {
            gl.setClearColor('#050505')
            // Explicit, because everything downstream is tuned against it:
            // ACES rolls highlights off instead of clipping, which is what keeps
            // emissive panels from saturating to yellow-white under bloom.
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.0
          }}
        >
          <LoopGuard covered={covered} />
          <CameraRig />
          <Atmosphere />

          <Spark />
          <Ecosystem />

          <Suspense fallback={null}>
            <WebPlatform />
            <MobileApps />
            <AIAgents />
            <Showcase />
            <TechStack />
            <ContactScene />
          </Suspense>

          <Effects />

          {/* No AdaptiveDpr here on purpose: the camera has a permanent idle
              drift, so "is the camera moving" is always true and it would hold
              the canvas at reduced resolution for the entire visit. */}
          <AdaptiveEvents />
          <Preload all />
        </Canvas>
      </div>

      <Narrative />
      <Finale />
      <Chrome />
      <CaseStudy />

      {!entered && <Preloader onEnter={() => setEntered(true)} />}

      {/* The document's h1. The journey states the headline visually and the
          story track argues it; this is the one canonical text version, and it
          is what a crawler and a screen reader read first. */}
      <div className="uv-sr">
        <h1>Turn complex business workflows into intelligent software — Trimugo</h1>
        <p>
          Trimugo is an AI and workflow engineering partner. We design and build AI-powered
          software that automates repetitive operations, connects business processes and helps
          teams work more efficiently — AI workflow systems, AI agents, document intelligence,
          business applications, process automation and system integration.
        </p>
        <a href="#/classic">View the standard accessible site</a>
      </div>

      {/* The business case, below the journey. */}
      <Story />
    </div>
  )
}
