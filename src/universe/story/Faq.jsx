import { Head, Reveal, Section } from './parts.jsx'
import { faq } from '../../data/business.js'

// SECTION 11 — FAQ
//
// Native <details>/<summary>: keyboard accessible, screen-reader correct, open
// to in-page find, and indexable whether or not it has been expanded. An ARIA
// accordion built out of divs would be all of the work and none of that.

export default function Faq() {
  return (
    <Section id="faq" label="Frequently asked questions">
      <Head kicker="Section 11 — FAQ" title="The questions we are actually asked." />
      <div className="st-faq">
        {faq.map((f, i) => (
          <Reveal key={f.q} delay={i * 40}>
            <details className="st-faq__item">
              <summary>
                <span>{f.q}</span>
                <span className="st-faq__mark" aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
