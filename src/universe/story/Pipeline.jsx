import { Head, Reveal, Section } from './parts.jsx'
import { pipeline } from '../../data/business.js'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 02 — THE WORKFLOW
//
// Trimugo's signature diagram. Deliberately not a robot and not an abstract
// "AI" glow: it is a real pipeline, and the thing it communicates is the
// boundary between the stages where a model decides and the stages where code
// decides. Technical buyers read that boundary as evidence we have built one.
//
// The two model stages carry an explicit "optional" marker. Seven of the nine
// are deterministic, and the diagram has to say so on its own — a reader who
// only looks at the picture should still come away knowing AI is a component
// here, not the product.
// ─────────────────────────────────────────────────────────────────────────────

// Which stages are model-driven. Everything else is deterministic by design —
// the distinction is the argument this section is making.
const TONE = {
  Model: 'model',
  Deterministic: 'code',
  Orchestration: 'flow',
  Ingest: 'edge',
  Execution: 'flow',
  Output: 'edge',
}

export default function Pipeline() {
  return (
    <Section id="workflow" label="The workflow pipeline">
      <Head kicker={pipeline.kicker} title={pipeline.title} body={pipeline.body} />

      <div className="st-pipe">
        {/* The travelling pulse: one element, one CSS animation, paused under
            reduced motion. This is the only continuous motion in the track. */}
        <span className="st-pipe__rail" aria-hidden="true">
          <span className="st-pipe__pulse" />
        </span>

        <ol className="st-pipe__list">
          {pipeline.stages.map((s, i) => (
            <Reveal as="li" key={s.id} className={`st-node st-node--${TONE[s.kind]}`} delay={i * 55}>
              <span className="st-node__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="st-node__body">
                <p className="st-node__label">{s.label}</p>
                <p className="st-node__note">{s.note}</p>
              </div>
              <span className="st-node__kind">
                {s.kind}
                {s.optional && <em className="st-node__opt">Optional</em>}
              </span>
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal className="st-note">
        <p>{pipeline.note}</p>
      </Reveal>
    </Section>
  )
}
