import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { processSteps } from '../data/content.js'

export default function Process() {
  return (
    <section id="process" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Business Transformation Process"
          title="A clear roadmap from idea to impact"
          subtitle="Eight deliberate stages that de-risk delivery and keep your business in control the whole way."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <Reveal i={i % 4} key={step.title}>
              <div className="card group relative h-full overflow-hidden p-6 hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow">
                <span className="font-display text-5xl font-bold text-slate-100 transition-colors group-hover:text-amber-100 dark:text-white/5 dark:group-hover:text-amber-400/15">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="-mt-6 text-base font-bold text-ink-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-brand-600 to-amber-400 transition-all duration-500 group-hover:w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
