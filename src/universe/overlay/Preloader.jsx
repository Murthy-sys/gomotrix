import { useEffect, useRef, useState } from 'react'
import Logo from '../../components/Logo.jsx'
import { set, state } from '../core/store'
import { scrollToElement, syncScrollTo } from '../core/engine'
import { start as startAudio } from './audio'

// The threshold. The experience opens in darkness with a single point of light —
// the same mote that becomes the AI core — so the preloader is the first beat of
// the story rather than a spinner in front of it.

export default function Preloader({ onEnter }) {
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const shell = useRef()

  useEffect(() => {
    // Scroll is locked until the user chooses to enter.
    document.documentElement.classList.add('uv-locked')

    // The canvas compiles its shaders on the first frames; a short beat here
    // means the first thing the user sees is already running at full rate.
    const t = setTimeout(() => setReady(true), 1300)
    return () => clearTimeout(t)
  }, [])

  const enter = () => {
    if (leaving) return
    setLeaving(true)
    startAudio()
    document.documentElement.classList.remove('uv-locked')
    // Belt-and-suspenders: startEngine already tried this while still locked;
    // redo it now that overflow is free so the journey opens on its starting
    // beat instead of snapping to the top on the first real scroll event.
    syncScrollTo(state.progress)
    set({ entered: true })
    // Matches the CSS fade so the panel is gone before scroll can begin.
    setTimeout(() => onEnter?.(), 1400)
  }

  // For the visitor who did not come here to be taken on a journey. Enters
  // first — the preloader holds `overflow: hidden` while it is up, and some
  // browsers swallow a programmatic scroll under it — then drops them at the
  // first section of the business case on this same page.
  const skipToOverview = () => {
    enter()
    setTimeout(() => scrollToElement('#problem', { duration: 1.2 }), 180)
  }

  return (
    <div
      ref={shell}
      className={`uv-pre ${ready ? 'is-ready' : ''} ${leaving ? 'is-leaving' : ''}`}
      role="dialog"
      aria-label="Enter the experience"
    >
      <div className="uv-pre__mote" aria-hidden="true" />

      <div className="uv-pre__inner">
        <span className="uv-pre__lockup">
          <Logo className="uv-pre__mark" />
          <span className="uv-pre__brand">Trimugo</span>
        </span>
        {/* The threshold is the real first screen, so it carries the company
            line. The headline proper waits for the first beat — saying the
            same sentence twice in three seconds reads as a stutter. */}
        <h1 className="uv-pre__title">
          AI &amp; Workflow
          <br />
          Engineering Partner
        </h1>
        <p className="uv-pre__sub">
          We design and build AI-powered software that automates repetitive operations and connects
          business processes. What follows is a scroll-driven journey through how we work — best
          with sound on.
        </p>

        <p className="uv-pre__meta">
          AI Engineering · Workflow Automation · Custom Software · System Integration
        </p>

        <div className="uv-pre__actions">
          <button type="button" className="uv-btn" onClick={enter}>
            <span>Enter the Journey</span>
          </button>
        </div>

        <button type="button" className="uv-pre__skip" onClick={skipToOverview}>
          Skip the experience — read the business overview
        </button>
      </div>
    </div>
  )
}
