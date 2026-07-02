import { ArrowLeft, Clock, CalendarDays, Calendar } from 'lucide-react'
import { articles } from '../data/content.js'

function Block({ block }) {
  if (block.type === 'h2') {
    return (
      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
        {block.text}
      </h2>
    )
  }
  if (block.type === 'ul') {
    return (
      <ul className="mt-4 space-y-2.5">
        {block.items.map((it, i) => (
          <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    )
  }
  return <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{block.text}</p>
}

export default function Article({ article }) {
  // Related: other articles in a different or same category
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <article className="relative pt-28 md:pt-32">
      {/* header */}
      <header className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[130px] dark:bg-brand-500/20" />
        </div>
        <div className="container-x max-w-3xl">
          <a
            href="#knowledge"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-amber-400"
          >
            <ArrowLeft size={16} /> Back to insights
          </a>

          <span className="mt-6 block text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {article.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{article.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 pb-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            {article.date && (
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} className="text-brand-500" /> {article.date}
              </span>
            )}
            {article.read && (
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-brand-500" /> {article.read}
              </span>
            )}
            <span className="flex items-center gap-1.5">By the Trimugo team</span>
          </div>
        </div>
      </header>

      {/* body */}
      <div className="container-x max-w-3xl pb-16">
        {article.body?.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center dark:border-white/10 dark:bg-ink-800 sm:p-9">
          <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">
            Want this working in your business?
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-300">
            Book a free consultation and we'll map the fastest, lowest-risk path to results for your team.
          </p>
          <a href="#contact" className="btn-primary mt-6 text-base">
            <Calendar size={18} /> Book Free Consultation
          </a>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-ink-800/40">
          <div className="container-x max-w-4xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((a) => (
                <a
                  key={a.slug}
                  href={`#/insights/${a.slug}`}
                  className="group card p-5 hover:-translate-y-0.5 hover:border-amber-300"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {a.category}
                  </span>
                  <h3 className="mt-1.5 font-bold leading-snug text-ink-900 dark:text-white">{a.title}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock size={13} /> {a.read}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
