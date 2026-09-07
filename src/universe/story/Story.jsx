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
              <em>Freelance Product Engineering</em>
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
            {/* A real route change, so this one keeps its default behaviour. */}
            <a href="#/privacy">Privacy</a>
          </nav>
          <p className="st-foot__legal">© {new Date().getFullYear()} Trimugo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
