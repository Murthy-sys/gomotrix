import { Component, Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import EarthScene from './EarthScene.jsx'

const CAMERA_OPTIONS = { fov: 42, near: 0.1, far: 40, position: [0, 0, 9] }
const GL_OPTIONS = { antialias: true, alpha: true, powerPreference: 'low-power', stencil: false, depth: true }

class CanvasBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    this.props.onError(error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function RenderLifecycle({ active, animate, onError }) {
  const { gl, invalidate } = useThree()

  useEffect(() => {
    gl.domElement.dataset.active = String(animate)
    if (active) invalidate()
  }, [active, animate, gl, invalidate])

  useEffect(() => {
    const canvas = gl.domElement
    const handleLoss = (event) => {
      event.preventDefault()
      onError(new Error('WebGL context was lost'))
    }
    canvas.addEventListener('webglcontextlost', handleLoss)
    return () => canvas.removeEventListener('webglcontextlost', handleLoss)
  }, [gl, onError])

  return null
}

/** The scene owns motion; service names, navigation and actions remain in the DOM. */
export default function HeroCanvas({ active = true, reduced = false, tier, onError, labelRefs, onReady }) {
  const [failed, setFailed] = useState(false)
  const quality = tier?.quality || 'medium'
  const dpr = Math.min(tier?.dpr || 1, quality === 'low' ? 1.25 : 1.5)
  const animate = active && !reduced
  const reportError = useCallback((error) => {
    setFailed(true)
    onError?.(error)
  }, [onError])

  if (failed) return null

  return (
    <CanvasBoundary onError={reportError}>
      <Canvas
        aria-hidden="true"
        dpr={dpr}
        frameloop={!active ? 'never' : animate ? 'always' : 'demand'}
        gl={GL_OPTIONS}
        camera={CAMERA_OPTIONS}
        fallback={<span>The decorative Earth is unavailable.</span>}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
        }}
      >
        <RenderLifecycle active={active} animate={animate} onError={reportError} />
        <Suspense fallback={null}>
          <EarthScene animate={animate} reduced={reduced} quality={quality} labelRefs={labelRefs} onReady={onReady} />
        </Suspense>
      </Canvas>
    </CanvasBoundary>
  )
}
