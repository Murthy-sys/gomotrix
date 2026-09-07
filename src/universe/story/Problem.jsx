import { Head, Reveal, Section } from './parts.jsx'
import { problem } from '../../data/business.js'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 01 — WHERE PROJECTS START
//
// Two doors, stated before anything else: an idea that needs building, and a
// process that runs by hand. They carry equal weight on purpose — a founder
// arriving with an idea has to see themselves in the first screenful.
//
// The chain below belongs to the second door only, and is labelled as such.
// The transformation is carried by the shape of the thing, not by decoration:
// the manual process is drawn as a staggered chain that keeps stepping sideways
// and waiting, and the resolution is a single straight rail. The reader sees
// the difference before reading a word of it.
// ─────────────────────────────────────────────────────────────────────────────

export default function Problem() {
  return (
    <Section id="problem" label="The business problem">
      <Head kicker={problem.kicker} title={problem.title} body={problem.body} />

      {/* The two entry points, side by side. Same hairline cells as the rest of
          the track, so neither door is dressed up over the other. */}
      <ul className="st-grid st-grid--2 st-doors">
        {problem.doors.map((d, i) => (
          <Reveal as="li" key={d.n} className="st-cell" delay={i * 70}>
            <span className="st-cell__n" aria-hidden="true">
              {d.n}
            </span>
            <h3 className="st-cell__title">{d.title}</h3>
            <p className="st-cell__body">{d.body}</p>
          </Reveal>
        ))}
      </ul>

      <Reveal className="st-problem__label st-doors__label">{problem.chainLabel}</Reveal>

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
