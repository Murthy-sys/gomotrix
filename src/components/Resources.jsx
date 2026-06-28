import { Download } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import { resources } from '../data/content.js'

export default function Resources() {
  return (
    <section id="resources" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Resources"
          title="Free tools to kickstart your transformation"
          subtitle="Calculators, checklists, and templates to assess your readiness and plan with confidence."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r, i) => (
            <Reveal i={i % 3} key={r.name}>
              <a
                href="#contact"
                className="group card flex h-full items-center gap-4 p-6 hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-200">
                  <Icon name={r.icon} size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-ink-900 dark:text-white">{r.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{r.desc}</p>
                </div>
                <Download
                  size={18}
                  className="text-slate-300 transition-colors group-hover:text-amber-500 dark:text-slate-600"
                />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
