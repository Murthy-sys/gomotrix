import { Globe, Smartphone, ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { projects } from '../data/content.js'

const linkMeta = {
  live: { label: 'Live site', icon: Globe },
  playstore: { label: 'Google Play', icon: Smartphone },
  appstore: { label: 'App Store', icon: Smartphone },
}

export default function Work() {
  return (
    <section id="cases" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Work"
          title="Products and platforms we've shipped"
          subtitle="A selection of real projects we've designed, built, and launched — from a multi-vehicle rental marketplace with live mobile apps to career and sustainability platforms."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const links = Object.entries(p.links || {}).filter(([, url]) => url)
            return (
              <Reveal i={i % 3} key={p.name}>
                <article className="group card flex h-full flex-col p-7 hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-700 text-base font-extrabold text-amber-400">
                      {p.initials}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="chip">{p.category}</span>
                      {p.year && (
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{p.year}</span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-ink-900 dark:text-white">{p.name}</h3>
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

                  {links.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-white/5">
                      {links.map(([key, url]) => {
                        const m = linkMeta[key] || { label: 'Open', icon: Globe }
                        const Ico = m.icon
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-white/10 dark:text-slate-200 dark:hover:text-amber-400"
                          >
                            <Ico size={14} /> {m.label}
                            <ArrowUpRight size={12} className="opacity-60" />
                          </a>
                        )
                      })}
                    </div>
                  )}
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
