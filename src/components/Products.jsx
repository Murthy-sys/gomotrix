import { ArrowRight, PlayCircle } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import { products } from '../data/content.js'

export default function Products() {
  return (
    <section id="products" className="relative py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Featured Products"
          title="Ready-to-deploy platforms, built to scale"
          subtitle="Proven products with screenshots, full feature sets, transparent pricing, and live demos on request."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal i={i % 3} key={p.name}>
              <div className="card group flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:shadow-glow">
                {/* faux screenshot header */}
                <div className="relative h-32 overflow-hidden bg-brand-900">
                  <div className="absolute inset-0 bg-grid-dark bg-[size:24px_24px] opacity-40" />
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  </div>
                  <div className="absolute -bottom-6 left-5 grid h-14 w-14 place-items-center rounded-2xl border-4 border-white bg-white text-brand-700 shadow-lg dark:border-ink-800 dark:bg-ink-700 dark:text-amber-300">
                    <Icon name={p.icon} size={24} />
                  </div>
                  <span className="absolute right-4 top-4 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                    {p.tag}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6 pt-9">
                  <h3 className="text-base font-bold text-ink-900 dark:text-white">{p.name}</h3>
                  <p className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">{p.price}</p>
                  <div className="mt-5 flex items-center gap-3 pt-1">
                    <a href="#contact" className="btn-primary flex-1 py-2 text-xs">
                      Request Demo <PlayCircle size={14} />
                    </a>
                    <a
                      href="#contact"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-brand-500 hover:text-brand-700 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
                      aria-label={`Learn more about ${p.name}`}
                    >
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
