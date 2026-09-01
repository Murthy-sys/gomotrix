import { Head, Reveal, Section } from './parts.jsx'
import { scrollToElement } from '../core/engine'
import {
  capabilities,
  delivery,
  differentiators,
  process,
  security,
  solutions,
  team,
} from '../../data/business.js'

// The straightforward sections of the track: 03, 05, 06, 07, 08, 09, 10 and
// the closing call to action. Each is a list rendered against a hairline grid —
// the restraint is deliberate, because sections 01, 02 and 04 are the ones
// carrying the visual argument and these must not compete with them.

// ── 03 · What we build ──────────────────────────────────────────────────────

export function Solutions() {
  return (
    <Section id="solutions" label="What we build">
      <Head
        kicker="Section 03 — What We Build"
        title="Six things we are asked for."
        body="Named by the business outcome rather than by the technology underneath, because that is how the need arrives."
      />
      <ul className="st-grid st-grid--3">
        {solutions.map((s, i) => (
          <Reveal as="li" key={s.id} className="st-cell" delay={i * 60}>
            <span className="st-cell__n" aria-hidden="true">
              {s.n}
            </span>
            <h3 className="st-cell__title">{s.title}</h3>
            <p className="st-cell__body">{s.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

// ── 05 · How we work ────────────────────────────────────────────────────────

export function Process() {
  return (
    <Section id="process" label="How we work">
      <Head kicker="Section 05 — How We Work" title="Five stages, no ceremony." />
      <ol className="st-steps">
        {process.map((s, i) => (
          <Reveal as="li" key={s.n} className="st-step" delay={i * 70}>
            <span className="st-step__n">{s.n}</span>
            <h3 className="st-step__title">{s.title}</h3>
            <p className="st-step__body">{s.body}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}

// ── 06 · Engineering capabilities ───────────────────────────────────────────

export function Capabilities() {
  return (
    <Section id="capabilities" label="Engineering capabilities">
      <Head
        kicker="Section 06 — Engineering"
        title="What we actually ship with."
        body="The stack the team builds and supports in production. Nothing listed here is aspirational."
      />
      <dl className="st-caps">
        {capabilities.map((c, i) => (
          <Reveal key={c.group} className="st-caps__row" delay={i * 60}>
            <dt>{c.group}</dt>
            <dd>
              <ul className="st-chips">
                {c.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  )
}

// ── 07 · Why Trimugo ────────────────────────────────────────────────────────

export function Why() {
  return (
    <Section id="why" label="Why Trimugo">
      <Head kicker="Section 07 — Why Trimugo" title="What is different here." />
      <ul className="st-grid st-grid--2">
        {differentiators.map((d, i) => (
          <Reveal as="li" key={d.title} className="st-cell" delay={i * 60}>
            <h3 className="st-cell__title">{d.title}</h3>
            <p className="st-cell__body">{d.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

// ── 08 · Team ───────────────────────────────────────────────────────────────

export function Team() {
  return (
    <Section id="team" label="The team">
      <Head kicker="Section 08 — Team" title={team.line} body={team.body} />
      <ul className="st-grid st-grid--4">
        {team.roles.map((r, i) => (
          <Reveal as="li" key={r.title} className="st-cell st-cell--tight" delay={i * 60}>
            <h3 className="st-cell__title">{r.title}</h3>
            <p className="st-cell__body">{r.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

// ── 09 · Security & privacy ─────────────────────────────────────────────────

export function Security() {
  return (
    <Section id="security" label="Security and privacy">
      <Head kicker="Section 09 — Security & Privacy" title={security.statement} />
      <Reveal>
        <ul className="st-chips st-chips--lg">
          {security.practices.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="st-note">
        <p>{security.caveat}</p>
      </Reveal>
    </Section>
  )
}

// ── 10 · European delivery ──────────────────────────────────────────────────

export function Delivery() {
  return (
    <Section id="delivery" label="How we deliver">
      <Head kicker="Section 10 — Delivery" title={delivery.line} body={delivery.body} />
      <ul className="st-grid st-grid--3">
        {delivery.points.map((d, i) => (
          <Reveal as="li" key={d.title} className="st-cell st-cell--tight" delay={i * 50}>
            <h3 className="st-cell__title">{d.title}</h3>
            <p className="st-cell__body">{d.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

// ── Final call to action ────────────────────────────────────────────────────

export function FinalCta() {
  // The form sits directly below this section, so scrolling to it and stopping
  // would read as a button that did nothing. Landing the caret in the first
  // field is the action the click was actually promising.
  const openForm = () => {
    scrollToElement('#contact')
    const first = document.querySelector('#contact input[name="name"]')
    if (!first) return
    // After the scroll settles — focusing mid-flight makes the browser fight
    // Lenis for the scroll position.
    setTimeout(() => first.focus({ preventScroll: true }), 900)
  }

  return (
    <Section id="final" className="st-section--cta" label="Start a conversation">
      <Reveal className="st-cta">
        <h2 className="st-cta__title">Have a business workflow worth automating?</h2>
        <p className="st-cta__body">
          Tell us how your process works today. We&apos;ll help identify where software, AI and
          automation could create the most value.
        </p>
        <div className="st-cta__actions">
          <button type="button" className="uv-btn" onClick={openForm}>
            <span>Discuss Your Workflow</span>
          </button>
          <button
            type="button"
            className="uv-btn uv-btn--ghost"
            onClick={() => scrollToElement('#work')}
          >
            <span>Explore Our Work</span>
          </button>
        </div>
      </Reveal>
    </Section>
  )
}
