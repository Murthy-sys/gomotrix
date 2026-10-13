import { useEffect } from 'react'

import '../universe/styles/base.css'
import '../universe/styles/story.css'

import Logo from '../components/Logo.jsx'
import StudioBackdrop from '../universe/StudioBackdrop.jsx'
import { privacy } from '../data/business.js'

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY POLICY · #/privacy
//
// The legal route shares the studio backdrop and design tokens while keeping
// its prose in normal document flow, independent of the homepage's 3D and stack.
// ─────────────────────────────────────────────────────────────────────────────

export default function Privacy() {
  useEffect(() => {
    // Clear homepage document state when arriving from an in-page link.
    document.documentElement.classList.remove('uv-active', 'uv-locked')
    window.scrollTo(0, 0)

    // A single-page app keeps the index title on every route unless it is told
    // otherwise, and this is the one page people arrive at with a bookmark.
    const previous = document.title
    document.title = 'Privacy policy — Trimugo'
    return () => {
      document.title = previous
    }
  }, [])

  const { controller } = privacy

  return (
    <div className="uv-root st-legal">
      <StudioBackdrop />
      <header className="st-legal__bar">
        <a className="st-legal__brand" href="#hero" aria-label="Trimugo — home">
          <Logo className="st-legal__mark" />
          <span>
            <strong>Trimugo</strong>
            <em>Smart Solutions</em>
          </span>
        </a>
        <a className="uv-btn uv-btn--sm uv-btn--text" href="#hero">
          <span className="uv-btn__label">Back to site</span>
        </a>
      </header>

      <main className="st-section st-legal__main" id="privacy-content">
        <div className="st-wrap st-legal__body">
          <p className="st-kicker">Legal</p>
          <h1 className="st-title">Privacy <em>policy</em></h1>
          <p className="st-lead">{privacy.intro}</p>
          <p className="st-legal__meta">Last updated {privacy.updated}</p>

          <section className="st-legal__controller" aria-label="Data controller">
            <p className="st-legal__label">{controller.role}</p>
            <p className="st-legal__name">{controller.name}</p>
            <ul>
              {/* Rendered only when it is real. An invented address on a legal
                  page is worse than a missing one. */}
              {controller.postal && <li>{controller.postal}</li>}
              <li>
                <a href={`mailto:${controller.email}`}>{controller.email}</a>
              </li>
              <li>
                <a href={`tel:${controller.phone.replace(/\s/g, '')}`}>{controller.phone}</a>
              </li>
            </ul>
          </section>

          <div className="st-legal__sections">
            {privacy.sections.map((s) => (
              <section key={s.title}>
                <h2>{s.title}</h2>
                {s.body && <p>{s.body}</p>}
                {s.items && (
                  <ul className="st-legal__list">
                    {s.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                )}
                {s.note && <p className="st-legal__note">{s.note}</p>}
              </section>
            ))}
          </div>

          <p className="st-legal__foot">
            Questions about anything on this page go to{' '}
            <a href={`mailto:${controller.email}`}>{controller.email}</a>, and are answered by the
            person who wrote it.
          </p>
        </div>
      </main>
    </div>
  )
}
