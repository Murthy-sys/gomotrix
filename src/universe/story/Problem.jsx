import { Head, Reveal, Section } from './parts.jsx'
import { problem } from '../../data/business.js'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 01 — THE BUSINESS PROBLEM
//
// The transformation is carried by the shape of the thing, not by decoration:
// the manual process is drawn as a staggered chain that keeps stepping sideways
// and waiting, and the resolution is a single straight rail. The reader sees
// the difference before reading a word of it.
// ─────────────────────────────────────────────────────────────────────────────

export default function Problem() {
  return (
    <Section id="problem" label="The business problem">
      <Head kicker={problem.kicker} title={problem.title} body={problem.body} />

      <div className="st-problem">
        {/* The queue. Each link is offset from the last — the handoff is the
            cost, so the layout keeps making the reader's eye travel. */}
        <Reveal className="st-chain" as="ol">
          {problem.before.map((s, i) => (
            <li key={s.step} className="st-chain__link" style={{ '--i': i }}>
              <span className="st-chain__dot" aria-hidden="true" />
              <span className="st-chain__step">{s.step}</span>
              <span className="st-chain__note">{s.note}</span>
            </li>
          ))}
        </Reveal>

        <div className="st-problem__aside">
          <Reveal>
            <p className="st-problem__label">What it costs</p>
          </Reveal>
          <Reveal className="st-costs" as="ul">
            {problem.costs.map((c, i) => (
              <li key={c} style={{ '--i': i }}>
                {c}
              </li>
            ))}
          </Reveal>
        </div>
      </div>

      {/* The resolution: one unbroken line, said once. */}
      <Reveal className="st-turn">
        <span className="st-turn__rail" aria-hidden="true" />
        <p className="st-turn__text">{problem.after}</p>
      </Reveal>
    </Section>
  )
}
