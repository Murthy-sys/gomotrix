import { Calendar, ArrowRight, Sparkles } from 'lucide-react'
import HeroIllustration from './HeroIllustration.jsx'
import { stats, techStack } from '../data/content.js'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36">
      {/* Background — restrained: faint grid + one soft navy wash + a touch of amber */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-light bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)] dark:bg-grid-dark" />
        <div className="absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[130px] dark:bg-brand-500/20" />
        <div className="absolute right-[12%] top-24 h-64 w-64 rounded-full bg-amber-400/10 blur-[110px]" />
      </div>

      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
        <div>
          <span className="chip animate-fade-up">
            <Sparkles size={14} /> Remote software, AI &amp; automation partner
          </span>

          <h1
            className="mt-5 animate-fade-up font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 dark:text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '0.05s' }}
          >
            Custom software &amp; AI that <span className="accent-text">drive</span> real business growth
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-slate-600 dark:text-slate-300"
            style={{ animationDelay: '0.12s' }}
          >
            We design, build, and ship web, mobile, AI, and automation solutions for growing businesses —
            cutting manual work, speeding up decisions, and turning your operations into an advantage.
          </p>

          <div
            className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '0.18s' }}
          >
            <a href="#contact" className="btn-primary text-base">
              <Calendar size={18} /> Book a Free Strategy Call
            </a>
            <a href="#contact" className="btn-ghost text-base">
              Get a Free Audit <ArrowRight size={18} />
            </a>
          </div>

          <dl
            className="mt-12 grid max-w-lg animate-fade-up grid-cols-3 gap-x-6 gap-y-7"
            style={{ animationDelay: '0.24s' }}
          >
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-amber-400 pl-3">
                <dt className="font-display text-2xl font-bold text-ink-900 dark:text-white">{s.value}</dt>
                <dd className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <HeroIllustration />
        </div>
      </div>

      {/* Tech stack we build with — honest, concrete */}
      <TechMarquee />
    </section>
  )
}

function TechMarquee() {
  const row = [...techStack, ...techStack]
  return (
    <div className="container-x mt-16 md:mt-24">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Built with the tools your team already trusts
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-3">
          {row.map((t, i) => (
            <span
              key={i}
              className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
