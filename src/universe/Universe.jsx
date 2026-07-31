import { Suspense, lazy, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { AdaptiveEvents, Preload } from '@react-three/drei'

import './styles/base.css'
import './styles/overlay.css'
import './styles/world.css'

import { startEngine, SCROLL_VH, detectQuality } from './core/engine'
import { state } from './core/store'
import CameraRig from './core/CameraRig'
import Atmosphere from './world/Atmosphere'
import Effects from './world/Effects'

import Preloader from './overlay/Preloader'
import Chrome from './overlay/Chrome'
import Narrative from './overlay/Narrative'
import CaseStudy from './overlay/CaseStudy'
import ContactForm from './overlay/ContactForm'
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

export default function Universe() {
  const [entered, setEntered] = useState(false)

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

  return (
    <div className="uv-root">
      {/* The scroll surface. The canvas is fixed behind it; this element exists
          purely to give the page a real, accessible scrollbar to drive. */}
      <div className="uv-scroll" style={{ height: `${SCROLL_VH}vh` }} aria-hidden="true" />

      <div className="uv-stage">
        <Canvas
          dpr={tier.dpr}
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
      <ContactForm />
      <Chrome />
      <CaseStudy />

      {!entered && <Preloader onEnter={() => setEntered(true)} />}

      {/* Real content for crawlers and screen readers. The journey above is
          visual; this is the same information as text. */}
      <div className="uv-sr">
        <h1>Trimugo — AI-powered web, mobile, enterprise and automation platforms</h1>
        <p>
          Trimugo is a remote-first IT partner building custom software, AI chatbots and agents,
          workflow automation, cloud, ERP and CRM solutions for startups, SMEs and enterprises.
        </p>
        <a href="#/classic">View the standard accessible site</a>
      </div>
    </div>
  )
}
