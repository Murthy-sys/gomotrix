import { Brain, Sparkles } from 'lucide-react'
import Reveal from './Reveal.jsx'
import { aiSolutions } from '../data/content.js'

export default function AISolutions() {
  return (
    <section id="ai" className="relative overflow-hidden bg-ink-900 py-24">
      {/* single warm accent over deep navy */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[130px]" />
        <div className="absolute bottom-0 right-16 h-64 w-64 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="container-x relative">
        <div className="mb-12 mx-auto max-w-2xl text-center">
          <span className="section-eyebrow border-white/10 bg-white/5 text-amber-300">
            <Sparkles size={14} /> AI Solutions
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.5rem] sm:leading-[1.12]">
            Put <span className="accent-text">artificial intelligence</span> to work
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            From chatbots to predictive analytics and full LLM integration — we ship AI that delivers measurable
            business value, not science projects.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {aiSolutions.map((name, i) => (
            <Reveal i={i % 6} key={name}>
              <span className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-amber-400/50 hover:bg-white/[0.09] hover:text-white">
                <Brain size={16} className="text-amber-400 transition-transform group-hover:scale-110" />
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
