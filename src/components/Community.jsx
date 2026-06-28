import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { communityEvents } from '../data/content.js'

const typeColor = {
  Webinar: 'text-brand-700 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-200',
  Workshop: 'text-amber-700 bg-amber-50 dark:bg-amber-400/10 dark:text-amber-300',
  Hackathon: 'text-brand-700 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-200',
  Meetup: 'text-amber-700 bg-amber-50 dark:bg-amber-400/10 dark:text-amber-300',
}

export default function Community() {
  return (
    <section id="community" className="relative py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Community"
          title="Learn, build, and grow with us"
          subtitle="Webinars, workshops, hackathons, campus programs, and meetups — join a network that ships."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communityEvents.map((e, i) => (
            <Reveal i={i % 4} key={e.title}>
              <a
                href="#contact"
                className="group card flex h-full flex-col p-6 hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow"
              >
                <span
                  className={`self-start rounded-full px-3 py-1 text-xs font-bold ${
                    typeColor[e.type] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {e.type}
                </span>
                <h3 className="mt-4 flex-1 text-base font-bold text-ink-900 dark:text-white">{e.title}</h3>
                <div className="mt-4 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-brand-500" /> {e.date}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={15} className="text-brand-500" /> {e.mode}
                  </p>
                </div>
                <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Register <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
