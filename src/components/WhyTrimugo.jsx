import { CheckCircle2 } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { principles } from '../data/content.js'

export default function WhyTrimugo() {
  return (
    <section id="why" className="relative py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Why Trimugo"
          title="We solve business problems — not just build software"
          subtitle="Trimugo is a long-term technology partner. We follow a proven process that puts your business outcomes first, then applies the right technology to get you there."
        />

        {/* Process timeline */}
        <div className="relative mx-auto max-w-3xl">
          {/* vertical line */}
          <div className="absolute left-[27px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-brand-600 to-amber-400" />

          <ol className="space-y-6">
            {principles.map((p, i) => (
              <Reveal as="li" i={i} key={p.title} className="relative pl-20">
                {/* node */}
                <div className="absolute left-0 top-3 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-brand-700 text-white shadow-glow ring-1 ring-amber-400/40 dark:border-ink-900">
                  <CheckCircle2 size={22} />
                </div>
                <div className="card p-6 transition-transform hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow">
                  <span className="mb-1 inline-block text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-bold text-ink-900 dark:text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
