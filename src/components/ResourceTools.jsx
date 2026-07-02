import { useEffect, useState } from 'react'
import { X, Calculator, ListChecks, ArrowRight, Calendar, RotateCcw } from 'lucide-react'

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

function Modal({ title, icon: Icon, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink-900/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative my-8 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/10 dark:bg-ink-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-amber-400">
              <Icon size={18} />
            </span>
            <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, min, max, step, suffix }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-ink-800 dark:text-slate-200">{label}</label>
        <span className="text-sm font-bold text-brand-700 dark:text-amber-400">
          {value.toLocaleString('en-IN')}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-amber-500"
      />
    </div>
  )
}

function RoiCalculator() {
  const [people, setPeople] = useState(5)
  const [hours, setHours] = useState(8)
  const [rate, setRate] = useState(300)
  const AUTOMATION = 0.6 // typical share of repetitive time recoverable

  const savedHoursMonth = people * hours * 4.33 * AUTOMATION
  const savedMonth = savedHoursMonth * rate
  const savedYear = savedMonth * 12

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Estimate how much time and money automation could save your team. Adjust the inputs to match your business.
      </p>
      <Field label="People doing repetitive work" value={people} onChange={setPeople} min={1} max={100} step={1} />
      <Field label="Hours/week each spends on it" value={hours} onChange={setHours} min={1} max={40} step={1} suffix=" hrs" />
      <Field label="Average hourly cost" value={rate} onChange={setRate} min={50} max={5000} step={50} suffix=" ₹" />

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-400/15 dark:bg-amber-400/[0.06]">
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Hours saved / mo</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-white">{Math.round(savedHoursMonth)}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Saved / month</p>
          <p className="mt-1 font-display text-lg font-bold text-amber-700 dark:text-amber-400">{inr(savedMonth)}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Saved / year</p>
          <p className="mt-1 font-display text-lg font-bold text-amber-700 dark:text-amber-400">{inr(savedYear)}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Estimate assumes ~60% of repetitive time is recoverable through automation. Actual results vary by process.
      </p>
      <a href="#contact" className="btn-primary w-full">
        <Calendar size={18} /> Get a tailored estimate
      </a>
    </div>
  )
}

const QUESTIONS = [
  'We have documented, repeatable processes.',
  'Our data is centralized and easy to access (not stuck in scattered spreadsheets).',
  'Our core systems are connected / talk to each other.',
  'We track key business metrics in real time.',
  "We've automated at least some repetitive workflows.",
  'There is leadership buy-in and budget for technology.',
]

function ReadinessChecklist() {
  const [answers, setAnswers] = useState({})
  const score = Object.values(answers).filter(Boolean).length
  const answered = Object.keys(answers).length
  const pct = Math.round((score / QUESTIONS.length) * 100)
  const done = answered === QUESTIONS.length

  const level = pct >= 67 ? 'Advanced' : pct >= 34 ? 'Developing' : 'Getting started'
  const advice =
    pct >= 67
      ? "You're in great shape. The next wins are AI and deeper automation — let's find the highest-ROI ones."
      : pct >= 34
        ? "Solid foundation with clear gaps. A focused roadmap will connect your systems and cut manual work fast."
        : "Lots of quick wins available. Start by centralizing data and automating one repetitive workflow."

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Answer 6 quick questions to score your digital readiness.
      </p>

      <ul className="space-y-2.5">
        {QUESTIONS.map((q, i) => (
          <li key={i} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
            <span className="text-sm text-ink-800 dark:text-slate-200">{q}</span>
            <div className="flex shrink-0 gap-1.5">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: val }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    answers[i] === val
                      ? val
                        ? 'bg-amber-500 text-ink-900'
                        : 'bg-slate-700 text-white dark:bg-white/15'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* live score */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-800 dark:text-slate-200">
            Readiness {done ? `· ${level}` : ''}
          </span>
          <span className="font-display text-lg font-bold text-amber-700 dark:text-amber-400">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {done && <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{advice}</p>}
      </div>

      {done ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href="#contact" className="btn-primary flex-1">
            <Calendar size={18} /> Book a free consultation
          </a>
          <button onClick={() => setAnswers({})} className="btn-ghost">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400">
          {answered}/{QUESTIONS.length} answered — finish to see your recommendation.
        </p>
      )}
    </div>
  )
}

export default function ResourceModal({ kind, onClose }) {
  if (kind === 'roi') {
    return (
      <Modal title="ROI Calculator" icon={Calculator} onClose={onClose}>
        <RoiCalculator />
      </Modal>
    )
  }
  if (kind === 'checklist') {
    return (
      <Modal title="Digital Readiness Checklist" icon={ListChecks} onClose={onClose}>
        <ReadinessChecklist />
      </Modal>
    )
  }
  return null
}
