import { useEffect, useState } from 'react'
import { set, subscribe, state } from '../core/store'
import { projects } from '../../data/content'

// The expanded project view. Clicking a hologram in scene 7 hands off to this —
// the surfaces show device frames and a live analytics read, but the words are
// real DOM text so they can be read, selected and indexed.

const SURFACES = [
  { id: 'laptop', label: 'Laptop', w: 168, h: 104 },
  { id: 'tablet', label: 'Tablet', w: 96, h: 124 },
  { id: 'mobile', label: 'Mobile', w: 60, h: 124 },
]

export default function CaseStudy() {
  const [id, setId] = useState(null)

  useEffect(() => subscribe((s) => setId(s.focused)), [])

  useEffect(() => {
    if (!id) return
    document.documentElement.classList.add('uv-locked')
    const onKey = (e) => e.key === 'Escape' && set({ focused: null })
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('uv-locked')
      window.removeEventListener('keydown', onKey)
    }
  }, [id])

  const project = id ? projects.find((p) => p.name === id) : null
  if (!project) return null

  const close = () => set({ focused: null })
  const links = Object.entries(project.links || {})

  return (
    <div className="uv-case" role="dialog" aria-modal="true" aria-label={`${project.name} case study`}>
      <button type="button" className="uv-case__scrim" onClick={close} aria-label="Close" />

      <article className="uv-case__panel">
        <header className="uv-case__head">
          <div>
            <p className="uv-case__kicker">
              {project.category} · {project.status || project.year}
            </p>
            <h2 className="uv-case__title">{project.name}</h2>
          </div>
          <button type="button" className="uv-case__close" onClick={close} aria-label="Close">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </header>

        {/* Device frames, drawn in CSS — no screenshots to source or ship. */}
        <div className="uv-case__devices" aria-hidden="true">
          {SURFACES.map((s) => (
            <div key={s.id} className={`uv-dev uv-dev--${s.id}`} style={{ width: s.w, height: s.h }}>
              <div className="uv-dev__screen">
                <span className="uv-dev__bar" />
                <span className="uv-dev__bar uv-dev__bar--short" />
                <span className="uv-dev__block" />
                <span className="uv-dev__bar uv-dev__bar--short" />
              </div>
              <span className="uv-dev__label">{s.label}</span>
            </div>
          ))}

          <div className="uv-dev uv-dev--chart">
            <div className="uv-chart">
              {[42, 58, 36, 74, 51, 88, 66].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <span className="uv-dev__label">Analytics</span>
          </div>
        </div>

        <p className="uv-case__body">{project.desc}</p>

        <ul className="uv-case__tags">
          {project.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {links.length > 0 && (
          <div className="uv-case__links">
            {links.map(([k, href]) => (
              <a key={k} className="uv-btn uv-btn--sm" href={href} target="_blank" rel="noreferrer noopener">
                <span>
                  {k === 'live' ? 'Visit live site' : k === 'playstore' ? 'Google Play' : 'App Store'}
                </span>
              </a>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
