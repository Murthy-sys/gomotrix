import { useState } from 'react'
import { ArrowRight, MessageCircle } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import ResourceModal from './ResourceTools.jsx'
import { resources } from '../data/content.js'

const WHATSAPP = '918500098088'
const requestLink = (name) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi Trimugo, I'd like the "${name}".`)}`

export default function Resources() {
  const [tool, setTool] = useState(null)

  return (
    <section id="resources" className="relative bg-slate-50 py-24 dark:bg-ink-800/40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Resources"
          title="Free tools to kickstart your transformation"
          subtitle="Calculators, checklists, and templates to assess your readiness and plan with confidence."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r, i) => {
            const isTool = r.tool === 'roi' || r.tool === 'checklist'
            const inner = (
              <>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-200">
                  <Icon name={r.icon} size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-ink-900 dark:text-white">{r.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{r.desc}</p>
                </div>
                {isTool ? (
                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500 dark:text-slate-600"
                  />
                ) : (
                  <MessageCircle
                    size={18}
                    className="text-slate-300 transition-colors group-hover:text-amber-500 dark:text-slate-600"
                  />
                )}
              </>
            )
            const cls =
              'group card flex h-full w-full items-center gap-4 p-6 text-left hover:-translate-y-1 hover:border-amber-300 hover:shadow-glow'

            return (
              <Reveal i={i % 3} key={r.name}>
                {isTool ? (
                  <button type="button" onClick={() => setTool(r.tool)} className={cls}>
                    {inner}
                  </button>
                ) : (
                  <a href={requestLink(r.name)} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                )}
              </Reveal>
            )
          })}
        </div>
      </div>

      {tool && <ResourceModal kind={tool} onClose={() => setTool(null)} />}
    </section>
  )
}
