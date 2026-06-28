import Reveal from './Reveal.jsx'

export default function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`mb-12 ${center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      {eyebrow && (
        <Reveal>
          <span className="section-eyebrow">{eyebrow}</span>
        </Reveal>
      )}
      <Reveal i={1}>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-[2.5rem] sm:leading-[1.12]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal i={2}>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}
