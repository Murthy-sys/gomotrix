import { TrendingUp, Bot, Zap, ArrowUpRight } from 'lucide-react'

const bars = [42, 58, 50, 72, 64, 88, 78]

export default function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      {/* soft navy panel behind for depth */}
      <div className="absolute inset-0 translate-x-5 translate-y-6 rounded-[1.75rem] bg-brand-700/10 dark:bg-brand-500/10" />

      <div className="relative animate-float rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-ink-800">
        {/* window chrome */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
            </div>
            <p className="text-sm font-bold text-ink-900 dark:text-white">Operations Overview</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Live
          </span>
        </div>

        {/* KPI tiles */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Revenue', value: '₹8.4Cr', delta: '+28%' },
            { label: 'Workflows', value: '1', delta: '98% acc' },
            { label: 'Uptime', value: '99.9%', delta: 'SLA' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/5 dark:bg-white/5">
              <p className="text-[10px] font-medium text-slate-400">{k.label}</p>
              <p className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-white">{k.value}</p>
              <p className="mt-0.5 flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <ArrowUpRight size={11} /> {k.delta}
              </p>
            </div>
          ))}
        </div>

        {/* chart */}
        <div className="mt-4 rounded-xl border border-slate-100 p-4 dark:border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-ink-900 dark:text-white">Workflow throughput</p>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <TrendingUp size={13} /> Trending up
            </span>
          </div>
          <div className="mt-4 flex h-28 items-end gap-2.5">
            {bars.map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%`, animationDelay: `${0.3 + i * 0.08}s` }}
                className={`flex-1 origin-bottom animate-draw-bar rounded-md ${
                  i === bars.length - 1 ? 'bg-amber-400' : 'bg-brand-600/85 dark:bg-brand-400/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* floating chips */}
      <div className="absolute -left-5 top-24 hidden animate-float items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-card dark:border-white/10 dark:bg-ink-700 sm:flex" style={{ animationDelay: '0.5s' }}>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white">
          <Bot size={17} />
        </span>
        <div>
          <p className="text-[10px] font-medium text-slate-400">AI tickets resolved</p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">3</p>
        </div>
      </div>

      <div className="absolute -right-4 bottom-10 hidden animate-float items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-card dark:border-white/10 dark:bg-ink-700 sm:flex" style={{ animationDelay: '1.2s' }}>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500 text-ink-900">
          <Zap size={17} />
        </span>
        <div>
          <p className="text-[10px] font-medium text-slate-400">Efficiency</p>
          <p className="text-sm font-bold text-ink-900 dark:text-white">98%</p>
        </div>
      </div>
    </div>
  )
}
