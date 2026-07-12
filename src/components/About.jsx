import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import { aboutValues, stats } from '../data/content.js'

export default function About() {
  return (
    <section id="about" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="About Trimugo"
          title="Your long-term technology partner"
          subtitle="We exist to make serious technology accessible to every business — affordable, scalable, and intelligent solutions delivered by a team that stays with you."
        />

        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Story + stats */}
          <Reveal>
            <div className="space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Trimugo was built on a simple idea: businesses don&apos;t need more software — they need
                the right technology applied to real problems. So we start with your operations, your
                bottlenecks, and your goals, and only then choose the tools.
              </p>
              <p>
                Today we partner with startups, SMEs, hospitals, schools, and enterprises to design,
                build, and run custom software, AI, and cloud solutions — and we invest in the next
                generation of builders through our student programs.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="card p-5 text-center">
                  <div className="font-display text-2xl font-bold text-brand-700 dark:text-brand-300">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Values */}
          <div className="grid gap-4 sm:grid-cols-2">
            {aboutValues.map((v, i) => (
              <Reveal i={i} key={v.title}>
                <div className="card h-full p-6 transition-transform hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white shadow-glow ring-1 ring-amber-400/40">
                    <Icon name={v.icon} size={20} />
                  </div>
                  <h3 className="mt-4 font-bold text-ink-900 dark:text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
