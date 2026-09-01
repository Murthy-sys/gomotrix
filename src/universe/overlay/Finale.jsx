import { useEffect, useRef } from 'react'
import { state, subscribe } from '../core/store'
import { SCENES, band } from '../core/world'
import { scrollToElement } from '../core/engine'
import { contactChannels } from '../../data/business.js'

// ─────────────────────────────────────────────────────────────────────────────
// The finale, over scene 8.
//
// This used to be the enquiry form. It is now the handoff: the journey ends on
// a decision, and the one real form on the site lives at the foot of the story
// track below, where it can ask the qualifying questions properly without
// having to fit inside a fixed overlay on top of a live canvas.
//
// Fades with the contact scene's own scroll band, written straight to the node
// so scrolling never re-renders it.
// ─────────────────────────────────────────────────────────────────────────────

export default function Finale() {
  const shell = useRef()

  useEffect(() => {
    const scene = SCENES.find((s) => s.id === 'contact')
    let raf
    let shown = true

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const el = shell.current
      if (!el) return

      // Progress saturates at 1 for the whole length of the story track, so the
      // band alone would leave this pinned over the reader's page. `state.story`
      // is the second gate: once the track is on screen, the finale is done.
      const b = state.story ? 0 : band(state.progress, scene.start, scene.end + 0.02, 0.045)
      const visible = b > 0.02

      if (visible !== shown) {
        shown = visible
        el.style.visibility = visible ? 'visible' : 'hidden'
        el.style.pointerEvents = visible ? 'auto' : 'none'
        el.setAttribute('aria-hidden', visible ? 'false' : 'true')
      }
      if (visible) {
        el.style.opacity = String(b)
        el.style.transform = `translate3d(0, ${((1 - b) * 26).toFixed(1)}px, 0)`
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section
      ref={shell}
      className="uv-contact"
      style={{ visibility: 'hidden', opacity: 0 }}
      aria-label="Start your project"
    >
      <div className="uv-contact__inner uv-finale">
        <p className="uv-contact__kicker">Start Your Project</p>
        <h2 className="uv-contact__title">Ready when you are.</h2>
        <p className="uv-contact__sub">
          You&apos;ve seen how we build. Tell us how your process works today, and we&apos;ll help
          identify where software, AI and automation would create the most value.
        </p>

        <div className="uv-finale__actions">
          <button type="button" className="uv-btn" onClick={() => scrollToElement('#contact')}>
            <span>Discuss Your Workflow</span>
          </button>
          <button
            type="button"
            className="uv-btn uv-btn--ghost"
            onClick={() => scrollToElement('#problem')}
          >
            <span>Read the Business Case</span>
          </button>
        </div>

        <ul className="uv-contact__links">
          {contactChannels.map((c) => (
            <li key={c.label}>
              <a href={c.href} target="_blank" rel="noreferrer noopener">
                <em>{c.label}</em>
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
