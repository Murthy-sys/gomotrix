import { useState } from 'react'
import { Search, Clock, ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import { articles } from '../data/content.js'

export default function KnowledgeCenter() {
  const [query, setQuery] = useState('')
  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase()),
  )
  const featured = filtered.find((a) => a.featured)
  const rest = filtered.filter((a) => a !== featured)

  return (
    <section id="knowledge" className="relative py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Knowledge Center"
          title="Insights to help you make smarter decisions"
          subtitle="Articles, guides, and industry reports on AI, automation, digital transformation, and technology trends."
        />

        {/* Search */}
        <div className="mx-auto mb-10 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles & guides…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-ink-900 shadow-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-ink-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Featured */}
          {featured && (
            <Reveal>
              <a
                href="#knowledge"
                className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl border border-slate-200 p-7 dark:border-white/10"
              >
                <div className="absolute inset-0 bg-brand-900" />
                <div className="absolute inset-0 bg-grid-dark bg-[size:30px_30px] opacity-30" />
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl" />
                <div className="relative">
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">
                    Featured · {featured.category}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white">{featured.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-slate-300">{featured.excerpt}</p>
                  <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Clock size={14} /> {featured.read}
                    <ArrowUpRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </a>
            </Reveal>
          )}

          {/* List */}
          <div className="grid gap-4">
            {rest.map((a, i) => (
              <Reveal i={i} key={a.title}>
                <a
                  href="#knowledge"
                  className="group card flex items-center justify-between gap-4 p-5 hover:-translate-y-0.5 hover:border-amber-400"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{a.category}</span>
                    <h3 className="mt-1 font-bold text-ink-900 dark:text-white">{a.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{a.excerpt}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Clock size={13} /> {a.read}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-500 dark:text-slate-600"
                  />
                </a>
              </Reveal>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-white/10">
                No articles match “{query}”.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
