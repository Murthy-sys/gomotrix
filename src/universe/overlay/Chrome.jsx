import { useEffect, useRef } from 'react'
import Logo from '../../components/Logo.jsx'
import { state } from '../core/store'
import { scrollToElement } from '../core/engine'

// Minimal UI: the brand mark, a way in, and a single conversion action.
//
// The original rule here was "nothing else on screen — the world is the
// interface", and it is still mostly true: there are no chapter numbers, no
// tick list and no menu. What was added is the smallest set a business visitor
// needs to act — three destinations and one CTA — and all of it stays hidden
// through the opening beat so the first impression is still the world alone.

const LINKS = [
  { label: 'Work', to: '#work' },
  { label: 'What we build', to: '#solutions' },
  { label: 'Engineering', to: '#capabilities' },
]

export default function Chrome() {
  const bar = useRef()
  const hint = useRef()
  const nav = useRef()
  const head = useRef()

  useEffect(() => {
    let raf
    let navShown = null
    let scrimOn = null

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = state.progress

      // Written directly, never through state — this updates every frame.
      if (bar.current) {
        bar.current.style.transform = `scaleX(${p})`
        // The hairline measures the journey. Once the reader is in the story
        // track it is measuring nothing, so it gets out of the way.
        bar.current.style.opacity = state.story ? '0' : '1'
      }
      if (hint.current) {
        const a = Math.max(0, 1 - p / 0.02)
        hint.current.style.opacity = String(a)
      }

      // Copy scrolls under the header inside the story track; over the world
      // there is nothing to separate it from.
      if (head.current && state.story !== scrimOn) {
        scrimOn = state.story
        head.current.classList.toggle('is-over-content', scrimOn)
      }

      // The nav earns its place only after the opening headline has landed.
      const show = p > 0.085
      if (nav.current && show !== navShown) {
        navShown = show
        nav.current.style.opacity = show ? '1' : '0'
        nav.current.style.pointerEvents = show ? 'auto' : 'none'
        nav.current.style.transform = show ? 'none' : 'translate3d(0, -6px, 0)'
        nav.current.setAttribute('aria-hidden', show ? 'false' : 'true')
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const go = (e, sel) => {
    e.preventDefault()
    scrollToElement(sel)
  }

  return (
    <>
      <header ref={head} className="uv-chrome uv-chrome--top">
        <a className="uv-brand" href="#/" aria-label="Trimugo — home">
          <Logo className="uv-brand__mark" />
          <span className="uv-brand__text">
            <span className="uv-brand__word">Trimugo</span>
            <span className="uv-brand__tag">AI &amp; Workflow Engineering</span>
          </span>
        </a>

        <nav
          ref={nav}
          className="uv-nav"
          aria-label="Primary"
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          <ul className="uv-nav__links">
            {LINKS.map((l) => (
              <li key={l.to}>
                <a href={l.to} onClick={(e) => go(e, l.to)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="uv-btn uv-btn--sm" href="#contact" onClick={(e) => go(e, '#contact')}>
            <span>Discuss Your Project</span>
          </a>
        </nav>
      </header>

      {/* No chapter list, no ticks, no numbers. A single hairline across the
          bottom of the frame is the only progress affordance — the world is
          supposed to tell you where you are. */}
      <div className="uv-progress" aria-hidden="true">
        <div ref={bar} className="uv-progress__fill" />
      </div>

      <div ref={hint} className="uv-hint" aria-hidden="true">
        <span>Scroll to begin</span>
        <div className="uv-hint__line" />
      </div>
    </>
  )
}
