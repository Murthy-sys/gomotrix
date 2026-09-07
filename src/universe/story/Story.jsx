import { useEffect, useRef } from 'react'

import Problem from './Problem.jsx'
import Pipeline from './Pipeline.jsx'
import CaseStudies from './CaseStudies.jsx'
import Faq from './Faq.jsx'
import ContactSection from './ContactSection.jsx'
import {
  Capabilities,
  Delivery,
  FinalCta,
  Process,
  Security,
  Solutions,
  Team,
  Why,
} from './Sections.jsx'
import Logo from '../../components/Logo.jsx'
import { armRevealFallback } from './parts.jsx'
import { scrollToElement } from '../core/engine'

// In-page destinations. These have to be intercepted: a bare href would hand
// the jump to the browser, and a native scroll fights Lenis, which keeps its
// own animated scroll value and snaps back on the next frame.
const FOOT_LINKS = [
  { label: 'Work', to: '#work' },
  { label: 'What we build', to: '#solutions' },
  { label: 'Engineering', to: '#capabilities' },
  { label: 'FAQ', to: '#faq' },
  { label: 'Contact', to: '#contact' },
]

// ─────────────────────────────────────────────────────────────────────────────
// THE STORY TRACK
//
// The business case, below the journey, in the same document and the same
// design language. The journey demonstrates the capability; this argues it —
// for the visitor who needs to justify a decision to someone else.
//
// It scrolls over the canvas rather than replacing it: the track is opaque, so
// the world simply passes behind it and is still there on the way back up.
// ─────────────────────────────────────────────────────────────────────────────

export default function Story() {
  const track = useRef(null)

  // `st-anim` is what hides revealable content, and it is only ever added from
  // JS. If the script never runs, the track renders fully visible instead of
  // fully blank — the reveal is decoration, and decoration does not get to own
  // whether the page has content in it.
  useEffect(() => {
    const el = track.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('st-anim')
    return armRevealFallback(el)
  }, [])

  return (
    <div className="st-track" id="story" ref={track}>
      {/* The seam. A gradient rather than a hard edge, so the journey dissolves
          into the page instead of being cut off by it. */}
      <div className="st-seam" aria-hidden="true" />

      <section className="st-section st-overview" id="overview" aria-labelledby="overview-title">
        <div className="st-wrap">
          <p className="st-kicker">Independent engineering · Remote, worldwide</p>
          <h1 className="st-title" id="overview-title">Trimugo — product &amp; workflow engineering</h1>
          <p className="st-lead">
            Trimugo is the freelance product and workflow engineering practice of Malisetti
            Obulamurthy. One engineer takes your idea from first scope to a shipped release,
            builds the web and mobile applications your business runs on, and automates the
            manual work between them.
          </p>
          <p className="st-lead">
            React, Vue and React Native development, system integration, and AI agents and
            document intelligence where a project calls for them. Available for freelance
            projects or contract work alongside your team, remotely worldwide.
          </p>
          <nav className="st-overview__links" aria-label="Explore Trimugo">
            <a href="/about/">About Trimugo</a>
            <a href="/hire-freelance-react-developer/">Freelance development</a>
            <a href="/contract-developer-for-hire/">Contract development</a>
            <a href="/ai-agents-document-automation/">AI &amp; document automation</a>
            <a href="/work/">Selected work</a>
          </nav>
        </div>
      </section>

      <Problem />
      <Pipeline />
      <Solutions />
      <CaseStudies />
      <Process />
      <Capabilities />
      <Why />
      <Team />
      <Security />
      <Delivery />
      <Faq />
      <FinalCta />
      <ContactSection />

      <footer className="st-foot">
        <div className="st-wrap st-foot__inner">
          <a className="st-foot__brand" href="#/">
            <Logo className="st-foot__mark" />
            <span>
              <strong>Trimugo</strong>
              <em>Smart Solutions</em>
            </span>
          </a>
          <nav className="st-foot__nav" aria-label="Footer">
            {FOOT_LINKS.map((l) => (
              <a
                key={l.to}
                href={l.to}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToElement(l.to)
                }}
              >
                {l.label}
              </a>
            ))}
            {/* Real pages, generated at build time by scripts/build-seo-pages.mjs.
                They are the site's only URLs other than this one, so linking to
                them here is how a crawler reaches them and how a reader who
                wants the plain-text version of a service gets out of the 3D. */}
            <a href="/hire-freelance-react-developer/">Freelance developer</a>
            <a href="/contract-developer-for-hire/">Contract developer</a>
            <a href="/ai-agents-document-automation/">AI solutions</a>
            <a href="/work/">All projects</a>
            <a href="/about/">About Trimugo</a>
            {/* A real route change, so this one keeps its default behaviour. */}
            <a href="#/privacy">Privacy</a>
          </nav>
          <p className="st-foot__legal">© {new Date().getFullYear()} Trimugo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
