import { Briefcase, MapPin, ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { careers } from '../data/content.js'

export default function Careers() {
  return (
    <section id="careers" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Careers"
          title="Join Gomotrix"
          subtitle="We hire full-timers, interns, freelancers, and campus talent who want to build technology that matters."
        />

        <div className="mx-auto max-w-3xl divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-ink-800">
          {careers.map((c, i) => (
            <Reveal i={i} key={c.role}>
              <a
                href="#contact"
                className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <div>
                  <h3 className="font-bold text-ink-900 dark:text-white">{c.role}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={13} className="text-brand-500" /> {c.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-brand-500" /> {c.location}
                    </span>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors group-hover:border-brand-400 group-hover:text-brand-600 dark:border-white/10 dark:text-slate-300">
                  Apply <ArrowUpRight size={14} />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
