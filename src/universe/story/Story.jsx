import { useRef } from 'react'

import ProductStudio from './ProductStudio.jsx'
import CaseStudies from './CaseStudies.jsx'
import Faq from './Faq.jsx'
import ContactSection from './ContactSection.jsx'
import { Process, Team } from './Sections.jsx'
import Logo from '../../components/Logo.jsx'
import { contactChannels } from '../../data/business.js'
import useStoryTransition from './useStoryTransition.js'
import { scrollToElement } from '../core/engine'

// Keep anchor destinations clear of the fixed header.
const FOOT_LINKS = [
  { label: 'Who we are', to: '#team', scroll: true },
  { label: 'FAQ', to: '#faq', scroll: true },
  { label: 'Contact', to: '#contact', scroll: true },
  { label: 'About', to: '/about/' },
  { label: 'Privacy policy', to: '#/privacy' },
]
const FOOT_CONTACT_CHANNELS = contactChannels.filter(({ label }) => label === 'Email' || label === 'Phone')

export default function Story() {
  const track = useRef(null)
  useStoryTransition(track)

  return (
    <div className="st-track" id="story" ref={track}>
      <section className="st-section st-overview" id="overview" tabIndex={-1} aria-labelledby="overview-title">
        <div className="st-wrap">
          <div className="st-overview__composition">
            <div className="st-overview__copy">
              <p className="st-kicker">Beyond the experience. Into the real world.</p>
              <h2 className="st-title" id="overview-title">Digital products.<br /><em>Built with intent.</em></h2>
              <p className="st-lead">Web, mobile and the systems between them. Our engineers turn your idea into working software, taking shared ownership from first sketch to release.</p>
              <a className="uv-btn uv-btn--text" href="#work" onClick={(event) => { event.preventDefault(); scrollToElement('#work') }}>
                <span className="uv-btn__label">Explore selected work</span>
              </a>
            </div>
            <ProductStudio />
          </div>
        </div>
      </section>

      <div className="st-stack">
        <CaseStudies />
        <Process />
        <Team />
        <Faq />
        <ContactSection />

        <span className="st-stack-anchor" aria-hidden="true" />
        <footer className="st-foot">
          <div className="st-wrap st-foot__inner">
            <a className="st-foot__brand" href="#hero" onClick={(event) => { event.preventDefault(); scrollToElement('#hero', { offset: 0 }) }}>
              <Logo className="st-foot__mark" />
              <span>
                <strong>Trimugo</strong>
                <em>Smart Solutions</em>
              </span>
            </a>
            <nav className="st-foot__nav" aria-label="Footer">
              {FOOT_LINKS.map((link) => (
                <div className={`st-foot__group${link.to === '#contact' ? ' st-foot__group--contact' : ''}`} key={link.to}>
                  <a
                    href={link.to}
                    onClick={link.scroll ? (event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                      event.preventDefault()
                      scrollToElement(link.to)
                    } : undefined}
                  >
                    {link.label}
                  </a>
                  {link.to === '#contact' && (
                    <address className="st-foot__contact">
                      {FOOT_CONTACT_CHANNELS.map((channel) => (
                        <a
                          key={channel.href}
                          href={channel.href}
                          aria-label={`${channel.label === 'Phone' ? 'Mobile' : channel.label}: ${channel.value}`}
                        >
                          {channel.value}
                        </a>
                      ))}
                    </address>
                  )}
                </div>
              ))}
            </nav>
            <p className="st-foot__legal">© {new Date().getFullYear()} Trimugo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
