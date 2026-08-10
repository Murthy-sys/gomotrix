import { useEffect, useRef } from 'react'
import { state } from '../core/store'
import { SCENES, clamp01 } from '../core/world'
import { scrollToProgress } from '../core/engine'
import { BEATS } from './copy'

// ─────────────────────────────────────────────────────────────────────────────
// The narrative layer.
//
// Text is positioned by scroll, but it is never re-rendered by React. A single
// rAF loop writes `opacity`, `transform` and `visibility` straight onto the
// nodes. Driving nine beats through React state would mean a full reconcile on
// every wheel event; this costs a handful of style writes per frame.
// ─────────────────────────────────────────────────────────────────────────────

/** Where in global scroll a beat peaks. */
function beatCentre(beat) {
  const s = SCENES.find((x) => x.id === beat.scene)
  return s.start + (s.end - s.start) * beat.at
}

export default function Narrative() {
  const refs = useRef([])

  useEffect(() => {
    let raf
    // How much scroll either side of the peak the beat remains visible.
    const HALF = 0.052

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = state.progress

      for (let i = 0; i < BEATS.length; i++) {
        const el = refs.current[i]
        if (!el) continue

        const centre = beatCentre(BEATS[i])
        const dist = (p - centre) / HALF // -1..1 across the visible window

        if (Math.abs(dist) > 1.35) {
          // Fully outside — take it out of the layout and the a11y tree so it
          // can never steal focus or get read out of order.
          if (el.style.visibility !== 'hidden') {
            el.style.visibility = 'hidden'
            el.style.opacity = '0'
            el.setAttribute('aria-hidden', 'true')
          }
          continue
        }

        if (el.style.visibility !== 'visible') {
          el.style.visibility = 'visible'
          el.removeAttribute('aria-hidden')
        }

        // Fade in and out symmetrically, holding fully opaque in the middle.
        const a = clamp01(1 - (Math.abs(dist) - 0.30) / 0.75)
        const eased = a * a * (3 - 2 * a)

        // Text drifts against the camera — a parallax layer, not a card pinned
        // to the glass. The blur ramp is what sells the morph: type dissolves
        // into soft light rather than popping in and out.
        const shift = dist * 50
        const scale = 1 - Math.abs(dist) * 0.015
        const blur = (1 - eased) * 7

        el.style.opacity = String(eased)
        el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
        el.style.filter = blur > 0.06 ? `blur(${blur.toFixed(2)}px)` : 'none'
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="uv-narrative">
      {BEATS.map((b, i) => (
        <section
          key={b.scene}
          ref={(el) => (refs.current[i] = el)}
          className={`uv-beat uv-beat--${b.align}`}
          style={{ visibility: 'hidden', opacity: 0 }}
        >
          <p className="uv-beat__kicker">{b.kicker}</p>

          <h2 className="uv-beat__title">
            {b.title.split('\n').map((line, k) => (
              <span key={k}>{line}</span>
            ))}
          </h2>

          <p className="uv-beat__body">{b.body}</p>

          {b.steps && (
            <ol className="uv-beat__steps">
              {b.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}

          {(b.cta || b.secondary) && (
            <div className="uv-beat__actions">
              {b.cta &&
                (b.cta.href ? (
                  <a className="uv-btn" href={b.cta.href}>
                    <span>{b.cta.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="uv-btn"
                    onClick={() => scrollToProgress(b.cta.to, 3.8)}
                  >
                    <span>{b.cta.label}</span>
                  </button>
                ))}
              {b.secondary && (
                <a className="uv-btn uv-btn--ghost" href={b.secondary.href}>
                  <span>{b.secondary.label}</span>
                </a>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
