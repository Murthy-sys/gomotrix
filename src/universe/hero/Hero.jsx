import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { detectQuality, scrollToElement } from '../core/engine.js'
import ServiceBadges from './ServiceBadges.jsx'
import { EARTH_RADIUS, fitOrbitCamera, orbitPoint, orbitScale, SERVICE_ORBITS } from './orbitMath.js'

const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'))

// The visual can fail independently of the headline and project action.
class VisualBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

export default function Hero() {
  const hero = useRef(null)
  const globe = useRef(null)
  const poster = useRef(null)
  const labelRefs = useRef([])
  const [tier] = useState(detectQuality)
  const [reduced, setReduced] = useState(tier.reduced)
  const [active, setActive] = useState(true)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const failVisual = useCallback(() => setFailed(true), [])
  const visualReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const element = hero.current
    let inView = true
    const update = () => setActive(inView && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    observer.observe(element)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  useEffect(() => {
    if (ready && !failed) return
    // Use the same projection for loading and WebGL failure. This stays static
    // and needs no renderer; labels remain readable around the real Earth poster.
    const element = globe.current
    const paint = () => {
      const width = element.clientWidth
      const height = element.clientHeight
      const distance = fitOrbitCamera({ width, height, labelWidths: labelRefs.current.map((label) => label?.offsetWidth || 0) })
      const focal = height / (2 * Math.tan(21 * Math.PI / 180))
      const radius = focal * EARTH_RADIUS / Math.sqrt(distance ** 2 - EARTH_RADIUS ** 2)
      poster.current.style.width = `${radius * 2}px`
      const point = {}
      SERVICE_ORBITS.forEach((orbit, index) => {
        const label = labelRefs.current[index]
        if (!label) return
        orbitPoint(orbit, orbit.staticPhase, point)
        const scale = orbitScale(distance, point.z, orbit.radius * Math.sin(orbit.tilt))
        const x = point.x * focal / (distance - point.z)
        const y = -point.y * focal / (distance - point.z)
        label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`
        label.style.zIndex = '3'
      })
    }
    paint()
    const observer = new ResizeObserver(paint)
    observer.observe(element)
    labelRefs.current.forEach((label) => { if (label) observer.observe(label) })
    return () => observer.disconnect()
  }, [ready, failed])

  return (
    <section className="uv-hero" id="hero" ref={hero} aria-labelledby="hero-title" data-motion={reduced || failed ? 'static' : 'live'} data-renderer={failed ? 'fallback' : ready ? 'webgl' : 'loading'}>
      <div className="uv-hero__copy">
        <p className="uv-beat__kicker">Ideas · Technology · Real impact</p>
        <h1 className="uv-beat__title" id="hero-title"><span>Global ideas.</span><em>Built together.</em></h1>
        <p className="uv-beat__body">We design and build web, mobile and AI-powered solutions that help businesses grow, automate and create real value.</p>
        <div className="uv-beat__actions">
          <a className="uv-btn" href="#contact" onClick={(event) => { event.preventDefault(); scrollToElement('#contact') }}>
            <span className="uv-btn__label">Start a project</span><span className="uv-btn__mark" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="uv-hero__globe" ref={globe}>
        <div className="uv-hero__poster" ref={poster} aria-hidden="true"><img src="/visuals/earth/earth-poster.webp" alt="" width="1024" height="1024" fetchpriority="high" /></div>
        {!failed && <div className="uv-hero__canvas" aria-hidden="true">
          <VisualBoundary onError={failVisual}>
            <Suspense fallback={null}>
              <HeroCanvas active={active} reduced={reduced} tier={tier} onError={failVisual} onReady={visualReady} labelRefs={labelRefs} />
            </Suspense>
          </VisualBoundary>
        </div>}
        <ServiceBadges labelRefs={labelRefs} />
      </div>
    </section>
  )
}
