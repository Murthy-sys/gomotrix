import { ArrowRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import { solutions } from '../data/content.js'

export default function Solutions() {
  return (
    <section id="solutions" className="relative py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Solutions"
          title="Everything you need to run and scale"
          subtitle="A complete suite of software, AI, and cloud solutions — each available as a dedicated, detailed engagement."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => (
            <Reveal i={i % 3} key={s.name}>
              <a
                href="#contact"
                className="group card relative flex h-full items-start gap-4 overflow-hidden p-6 hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-200">
                  <Icon name={s.icon} size={22} />
                </span>
                <div>
                  <h3 className="flex items-center gap-1.5 text-base font-bold text-ink-900 dark:text-white">
                    {s.name}
                    <ArrowRight
                      size={15}
                      className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-amber-500"
                    />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
