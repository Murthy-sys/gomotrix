import { useEffect, useRef, useState } from 'react'
import Logo from '../../components/Logo.jsx'
import { set } from '../core/store'
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
    const t = setTimeout(() => setReady(true), 1100)
    return () => clearTimeout(t)
  }, [])

  const enter = (withSound) => {
    if (leaving) return
    setLeaving(true)
    if (withSound) startAudio()
    document.documentElement.classList.remove('uv-locked')
    set({ entered: true })
    // Matches the CSS fade so the panel is gone before scroll can begin.
    setTimeout(() => onEnter?.(), 900)
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
        <h1 className="uv-pre__title">The Digital Universe</h1>
        <p className="uv-pre__sub">
          A scroll-driven journey through everything we build.
          <br />
          Best with sound on.
        </p>

        <div className="uv-pre__actions">
          <button type="button" className="uv-btn" onClick={() => enter(true)}>
            <span>Enter with music</span>
          </button>
          <button type="button" className="uv-btn uv-btn--ghost" onClick={() => enter(false)}>
            <span>Enter silently</span>
          </button>
        </div>

        <a className="uv-pre__skip" href="#/classic">
          Skip to the standard site
        </a>
      </div>
    </div>
  )
}
