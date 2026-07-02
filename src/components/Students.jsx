import { CheckCircle2, MessageCircle, GraduationCap, ArrowRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import { educationalProjects, studentIncludes } from '../data/content.js'

const WHATSAPP = 'https://wa.me/918500098088?text=' +
  encodeURIComponent("Hi Trimugo, I'm a student and need help with a college project.")

export default function Students() {
  return (
    <section id="students" className="relative py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="For Students"
          title="College & final-year projects, built to impress"
          subtitle="We help students design and build standout academic projects — with complete code, documentation, and one-on-one guidance so you truly understand what you submit."
        />

        {/* Project domains */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {educationalProjects.map((p, i) => (
            <Reveal i={i % 3} key={p.name}>
              <div className="group card flex h-full items-start gap-4 p-6 hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-200">
                  <Icon name={p.icon} size={22} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink-900 dark:text-white">{p.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* What's included */}
        <Reveal>
          <div className="relative mt-8 overflow-hidden rounded-3xl bg-brand-900 p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:36px_36px] opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-amber-500/15 blur-[110px]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                  <GraduationCap size={14} /> Every project includes
                </span>
                <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {studentIncludes.map((item) => (
                    <p key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-200">
                      <CheckCircle2 size={18} className="shrink-0 text-amber-400" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:w-64">
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                  <MessageCircle size={18} /> Chat on WhatsApp
                </a>
                <a href="#contact" className="btn w-full border border-white/30 text-white hover:bg-white/10">
                  Book a call <ArrowRight size={16} />
                </a>
                <p className="text-center text-xs text-slate-400">Student-friendly pricing • Fast turnaround</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
