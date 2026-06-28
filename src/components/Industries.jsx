import { ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import { industries } from '../data/content.js'

export default function Industries() {
  return (
    <section id="industries" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Industries We Serve"
          title="Deep expertise across every sector"
          subtitle="From healthcare to government, we tailor solutions to the realities of your industry."
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {industries.map((ind, i) => (
            <Reveal i={i % 5} key={ind.name}>
              <a
                href="#contact"
                className="group card flex h-full flex-col justify-between gap-6 p-5 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-200">
                    <Icon name={ind.icon} size={20} />
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-500 dark:text-slate-600"
                  />
                </div>
                <span className="text-sm font-bold text-ink-900 dark:text-white">{ind.name}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
