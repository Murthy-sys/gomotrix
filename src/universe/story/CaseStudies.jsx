import { useState } from 'react'
import { Head, Reveal } from './parts.jsx'
import WorkStudio from './WorkStudio.jsx'
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

function Study({ study }) {
  const links = Object.entries(study.links || {})

  return (
    <Reveal as="article" className="st-study">
      <header className="st-study__head">
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
              <a key={k} className="uv-btn uv-btn--sm uv-btn--text" href={href} target="_blank" rel="noreferrer noopener">
                <span className="uv-btn__label">{LINK_LABELS[k] || k}</span>
              </a>
            ))}
          </div>
        )}
      </footer>
    </Reveal>
  )
}

const PREVIEWS = {
  'Lumo Rentals': { desktop: '/work/lumo-rentals.webp', mobile: '/work/lumo-booking-mobile.webp' },
  'WanderLux Journeys': { desktop: '/work/wanderlux-journeys.webp', companion: 'tablet' },
  'Lisno India': { desktop: '/work/lisno-india.webp', mobile: '/work/lisno-mobile.webp' },
  "Suresh's Yogalaya": { desktop: '/work/suresh-yogalaya.webp', mobile: '/work/suresh-mobile.webp' },
}

const visualProjects = projects.filter((project) => PREVIEWS[project.name])
const otherProjects = projects.filter((project) => !PREVIEWS[project.name])

export default function CaseStudies() {
  const [selected, setSelected] = useState(0)
  const project = visualProjects[selected]

  return (
    <>
      <span className="st-stack-anchor" aria-hidden="true" />
      <section id="work" className="st-section st-work" aria-label="Selected work">
        <div className="st-work__spotlight">
          <div className="st-wrap">
            <div className="st-section-heading">
              <Head kicker="Selected work" title={<>Ideas made <em>tangible.</em></>} />
              <div className="st-work__intro">
                <p className="st-section-caption">A closer look at the products and experiences we build. Open a project and try it for yourself.</p>
              </div>
            </div>
            <div className="st-project-picker" role="group" aria-label="Choose a project">
              {visualProjects.map((item, index) => (
                <button key={item.name} type="button" aria-pressed={selected === index} aria-controls="selected-project" onClick={() => setSelected(index)}>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            <div className="st-project">
              <WorkStudio project={project} preview={PREVIEWS[project.name]} />
              <div id="selected-project" className="st-project__copy" aria-live="polite" aria-atomic="true">
                <p className="st-kicker">{project.category}</p>
                <h3>{project.name}</h3>
                <p>{project.desc}</p>
                <ul className="st-chips" aria-label="Project technologies">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                <div className="st-project__links">
                  {Object.entries(project.links).map(([type, href]) => (
                    <a key={type} className="uv-btn uv-btn--sm uv-btn--text" href={href} target="_blank" rel="noreferrer noopener">
                      <span className="uv-btn__label">{LINK_LABELS[type] || type}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <span className="st-stack-anchor" aria-hidden="true" />
      <section className="st-section st-work__archive" aria-label="Engineering case studies">
        <div className="st-wrap">
          {caseStudies.map((study) => (
            <details className="st-case-detail" key={study.id}>
              <summary><span>Behind the build / {study.name}</span><span>Read the engineering case study <span className="st-case-detail__mark" aria-hidden="true" /></span></summary>
              <Study study={study} />
            </details>
          ))}
          <div className="st-also">
            <p className="st-kicker">More from the studio</p>
            <ul className="st-also__list">{otherProjects.map((item) => (
              <li key={item.name}>
                <span className="st-also__name">{item.links.live ? <a href={item.links.live} target="_blank" rel="noreferrer noopener">{item.name} ↗</a> : item.name}</span>
                <span className="st-also__cat">{item.category}{item.status && <em>{item.status}</em>}</span>
                <span className="st-also__stack">{item.tags.join(' · ')}</span>
              </li>
            ))}</ul>
          </div>
        </div>
      </section>
    </>
  )
}
