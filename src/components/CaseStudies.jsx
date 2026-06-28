import { Quote, TrendingUp } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { caseStudies } from '../data/content.js'

export default function CaseStudies() {
  return (
    <section id="cases" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Case Studies"
          title="Real businesses. Measurable outcomes."
          subtitle="We measure success the way you do — in time saved, revenue gained, and customers delighted."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {caseStudies.map((c, i) => (
            <Reveal i={i} key={c.industry}>
              <article className="card flex h-full flex-col p-7 hover:-translate-y-1 hover:shadow-glow">
                <span className="chip self-start">{c.industry}</span>

                <div className="mt-5 space-y-4 text-sm">
                  <Field label="Business Problem" value={c.problem} />
                  <Field label="Solution" value={c.solution} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Technology Used</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-400/15 dark:bg-amber-400/[0.06]">
                  {c.results.map((r) => (
                    <div key={r.label}>
                      <p className="flex items-center gap-1 font-display text-2xl font-bold text-amber-700 dark:text-amber-400">
                        <TrendingUp size={18} />
                        {r.metric}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{r.label}</p>
                    </div>
                  ))}
                </div>

                {/* Testimonial */}
                <figure className="mt-auto pt-5">
                  <Quote size={20} className="text-amber-400" />
                  <blockquote className="mt-1 text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
                    "{c.quote}"
                  </blockquote>
                  <figcaption className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    — {c.author}
                  </figcaption>
                </figure>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  )
}
