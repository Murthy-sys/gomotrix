import { useEffect } from 'react'

import '../universe/styles/base.css'
import '../universe/styles/story.css'

import Logo from '../components/Logo.jsx'
import { privacy } from '../data/business.js'

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY POLICY · #/privacy
//
// A standalone route, deliberately outside the journey: it imports no WebGL and
// mounts no canvas, so a reader who lands here — or a procurement reviewer
// checking the site before a vendor form — gets plain text immediately instead
// of a 300KB three.js bundle and a scroll narrative.
//
// It borrows the story track's design language (base.css for the tokens and the
// button, story.css for the type scale) so it reads as part of the same site
// rather than as a generated legal page bolted onto the side of one.
//
// No reveal animation here on purpose. This is the one page on the site where
// content appearing on scroll would be actively unhelpful: people arrive to
// find one specific clause, and Ctrl+F has to work on the first frame.
// ─────────────────────────────────────────────────────────────────────────────

export default function Privacy() {
  useEffect(() => {
    // The journey locks the document and paints it black; this route does
    // neither, so anything the journey left behind has to be cleared.
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
      <header className="st-legal__bar">
        <a className="st-legal__brand" href="#/" aria-label="Trimugo — home">
          <Logo className="st-legal__mark" />
          <span>
            <strong>Trimugo</strong>
            <em>AI &amp; Workflow Engineering</em>
          </span>
        </a>
        <a className="uv-btn uv-btn--sm uv-btn--ghost" href="#/">
          <span>Back to site</span>
        </a>
      </header>

      <main className="st-section">
        <div className="st-wrap st-legal__body">
          <p className="st-kicker">Legal</p>
          <h1 className="st-title">Privacy policy</h1>
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
