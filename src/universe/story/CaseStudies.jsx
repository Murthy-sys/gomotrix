import { Head, Reveal, Section } from './parts.jsx'
import { caseStudies } from '../../data/business.js'
import { projects } from '../../data/content.js'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 04 — SELECTED WORK
//
// Case studies, not portfolio tiles. Each one is laid out as an argument:
// what the problem was, what was built, where AI was and was not used, what
// became automatic, what was hard to engineer, and what came of it.
//
// Fields that are not verified are not rendered. `existingWorkflow` and
// `outcomeMetrics` are null in the data on purpose — see MISSING_FROM_CLIENT
// in src/data/business.js. Nothing here fills a gap with a plausible guess.
// ─────────────────────────────────────────────────────────────────────────────

const LINK_LABELS = {
  live: 'Visit live site',
  playstore: 'Google Play',
  appstore: 'App Store',
}

/** One labelled block of the argument. Renders nothing when unverified. */
function Field({ label, children }) {
  if (!children) return null
  return (
    <div className="st-field">
      <p className="st-field__label">{label}</p>
      <div className="st-field__body">{children}</div>
    </div>
  )
}

function Study({ study, index }) {
  const links = Object.entries(study.links || {})

  return (
    <Reveal as="article" className="st-study">
      <header className="st-study__head">
        <span className="st-study__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="st-study__id">
          <h3 className="st-study__name">{study.name}</h3>
          <p className="st-study__cat">{study.category}</p>
        </div>
        <p className="st-study__status">
          <span className={study.status === 'Delivered' ? 'is-done' : 'is-live'} aria-hidden="true" />
          {study.status} · {study.year}
        </p>
      </header>

      <p className="st-study__summary">{study.summary}</p>

      {/* The workflow the system actually runs, as a node chain. */}
      <ol className="st-flow" aria-label={`${study.name} workflow`}>
        {study.flow.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ol>

      <div className="st-study__grid">
        <Field label="Challenge">
          <p>{study.challenge}</p>
        </Field>

        <Field label="Existing workflow">
          {study.existingWorkflow ? <p>{study.existingWorkflow}</p> : null}
        </Field>

        <Field label="Solution">
          <p>{study.solution}</p>
        </Field>

        <Field label="AI">
          {study.ai ? (
            <p>{study.ai}</p>
          ) : study.aiNote ? (
            <p className="st-field__none">{study.aiNote}</p>
          ) : null}
        </Field>

        <Field label="Automation">
          <ul>
            {study.automation.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Field>

        <Field label="Engineering">
          <ul>
            {study.engineering.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Field>

        <Field label="Outcome">
          <ul>
            {study.outcome.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          {study.outcomeMetrics ? <p>{study.outcomeMetrics}</p> : null}
        </Field>
      </div>

      <footer className="st-study__foot">
        <ul className="st-chips" aria-label="Stack">
          {study.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {links.length > 0 && (
          <div className="st-study__links">
            {links.map(([k, href]) => (
              <a key={k} className="uv-btn uv-btn--sm" href={href} target="_blank" rel="noreferrer noopener">
                <span>{LINK_LABELS[k] || k}</span>
              </a>
            ))}
          </div>
        )}
      </footer>
    </Reveal>
  )
}

export default function CaseStudies() {
  const featured = caseStudies.map((c) => c.name)
  // The remaining shipped projects, listed honestly as a shorter record rather
  // than inflated into case studies they do not have the depth for.
  const also = projects.filter((p) => !featured.includes(p.name))

  return (
    <Section id="work" label="Selected work">
      <Head
        kicker="Section 04 — Selected Work"
        title={caseStudies.length === 1 ? 'One system, in full.' : `${caseStudies.length} systems, in full.`}
        body="Real production software, written up the way an engineering buyer would want to read it. Where a number has not been measured, there is no number."
      />

      <div className="st-studies">
        {caseStudies.map((s, i) => (
          <Study key={s.id} study={s} index={i} />
        ))}
      </div>

      {also.length > 0 && (
        <Reveal className="st-also">
          <p className="st-also__label">Also shipped</p>
          <ul className="st-also__list">
            {also.map((p) => (
              <li key={p.name}>
                <span className="st-also__name">
                  {p.links?.live ? (
                    <a href={p.links.live} target="_blank" rel="noreferrer noopener">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </span>
                <span className="st-also__cat">
                  {p.category}
                  {p.status && <em className="st-also__wip">{p.status}</em>}
                </span>
                {/* Every tag, not the first four: the old cap silently dropped
                    the tail of a longer stack — Lumo's "Payments" among them. */}
                <span className="st-also__stack">{p.tags.join(' · ')}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </Section>
  )
}
