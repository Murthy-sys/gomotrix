import { motion } from 'framer-motion'
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
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chip"
          >
            <Sparkles size={14} /> Your long-term technology partner
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            Technology that <span className="accent-text">drives</span> real business growth
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
          >
            We help businesses simplify operations, automate workflows, and improve customer experience
            using AI, software, and digital transformation — built to last.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a href="#contact" className="btn-primary text-base">
              <Calendar size={18} /> Book Free Consultation
            </a>
            <a href="#solutions" className="btn-ghost text-base">
              Explore Solutions <ArrowRight size={18} />
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid max-w-lg grid-cols-3 gap-x-6 gap-y-7"
          >
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-amber-400 pl-3">
                <dt className="font-display text-2xl font-bold text-ink-900 dark:text-white">{s.value}</dt>
                <dd className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <HeroIllustration />
        </motion.div>
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
