import { useEffect, useRef, useState } from 'react'
import Logo from '../../components/Logo.jsx'
import { state } from '../core/store'
import { toggle as toggleAudio, isPlaying, onChange as onAudioChange } from './audio'

// Minimal UI: the brand mark, a chapter rail, a sound toggle. Nothing else is
// allowed on screen — the world is the interface.

export default function Chrome() {
  const [sound, setSound] = useState(isPlaying())
  const bar = useRef()
  const hint = useRef()

  // The audio module is the source of truth: playback can stop on its own when
  // a tab is backgrounded or the browser refuses to start it.
  useEffect(() => onAudioChange(setSound), [])

  useEffect(() => {
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      // Written directly, never through state — this updates every frame.
      if (bar.current) bar.current.style.transform = `scaleX(${state.progress})`
      if (hint.current) {
        const a = Math.max(0, 1 - state.progress / 0.02)
        hint.current.style.opacity = String(a)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <header className="uv-chrome uv-chrome--top">
        <a className="uv-brand" href="#/classic" aria-label="Trimugo — standard site">
          <Logo className="uv-brand__mark" />
          <span className="uv-brand__text">
            <span className="uv-brand__word">Trimugo</span>
            <span className="uv-brand__tag">Smart Solutions. Real Results.</span>
          </span>
        </a>

        <button
          type="button"
          className={`uv-sound ${sound ? 'is-on' : ''}`}
          onClick={() => setSound(toggleAudio())}
          aria-pressed={sound}
          aria-label={sound ? 'Mute music' : 'Play music'}
        >
          <span className="uv-sound__bars" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          <span className="uv-sound__label">{sound ? 'Sound on' : 'Muted'}</span>
        </button>
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
