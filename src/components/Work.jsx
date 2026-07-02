import { ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { projects } from '../data/content.js'

export default function Work() {
  return (
    <section id="cases" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Work"
          title="Products and platforms we've shipped"
          subtitle="A selection of real projects we've designed, built, and launched for our clients — from marketplaces to online stores and brand platforms."
        />

        {/* Trusted-by strip */}
        <Reveal>
          <div className="mx-auto mb-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Trusted by
            </span>
            {projects.map((p) => (
              <span key={p.name} className="flex items-center gap-2 text-sm font-bold text-ink-800 dark:text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-700 text-[10px] font-extrabold text-amber-400">
                  {p.initials}
                </span>
                {p.name}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Project cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const Tag = p.url ? 'a' : 'div'
            return (
              <Reveal i={i % 3} key={p.name}>
                <Tag
                  {...(p.url ? { href: p.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group card flex h-full flex-col p-7 hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-700 text-base font-extrabold text-amber-400">
                      {p.initials}
                    </span>
                    <span className="chip">{p.category}</span>
                  </div>

                  <h3 className="mt-5 flex items-center gap-1.5 text-lg font-bold text-ink-900 dark:text-white">
                    {p.name}
                    {p.url && (
                      <ArrowUpRight
                        size={16}
                        className="text-amber-500 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    )}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.desc}</p>

                  {p.tags?.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Tag>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
