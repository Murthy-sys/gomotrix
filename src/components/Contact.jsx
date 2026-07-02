import { useState } from 'react'
import { Mail, Phone, MessageCircle, MapPin, Calendar, CheckCircle2, Send } from 'lucide-react'
import Reveal from './Reveal.jsx'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@trimugo.io', href: 'mailto:hello@trimugo.io' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 012-3456', href: 'tel:+15550123456' },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: '#contact' },
  { icon: MapPin, label: 'Office', value: '100 Innovation Ave, Tech City', href: '#contact' },
]

// Web3Forms access key — routes submissions to the configured inbox.
const WEB3FORMS_KEY = '992dcaed-fdcf-4e47-a033-c6e23ac6a9c8'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', botcheck: '' })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.botcheck) return // honeypot: silently ignore bots
    setSending(true)
    setError('')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New consultation request from ${form.name || 'website visitor'}`,
          from_name: 'Trimugo Website',
          name: form.name,
          email: form.email,
          company: form.company,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-brand-500/[0.08] blur-[130px]" />
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-amber-400/[0.08] blur-[130px]" />
      </div>

      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: pitch + info */}
          <div>
            <span className="section-eyebrow">Contact</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-[2.5rem] sm:leading-[1.12]">
              Let's build something that <span className="accent-text">moves your business</span>
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Book a free consultation. We'll understand your goals, identify opportunities, and recommend
              exactly the right technology — no obligation.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {contactInfo.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-400 dark:border-white/10 dark:bg-ink-800"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300">
                    <c.icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-400">{c.label}</p>
                    <p className="text-sm font-bold text-ink-900 dark:text-white">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-4 flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 p-4 dark:border-white/10 dark:from-ink-800 dark:to-ink-700">
              <MapPin size={20} className="text-brand-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Find us on Google Maps — 100 Innovation Ave, Tech City
              </p>
            </div>
          </div>

          {/* Right: form */}
          <Reveal>
            <div className="card p-7 sm:p-8">
              {sent ? (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
                    <CheckCircle2 size={32} />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-ink-900 dark:text-white">Thank you, {form.name || 'there'}!</h3>
                  <p className="mt-2 max-w-sm text-slate-600 dark:text-slate-300">
                    Your request is in. A Trimugo consultant will reach out within one business day to schedule
                    your free consultation.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false)
                      setForm({ name: '', email: '', company: '', message: '', botcheck: '' })
                    }}
                    className="btn-ghost mt-6"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <h3 className="text-lg font-extrabold text-ink-900 dark:text-white">Schedule a consultation</h3>
                  {/* honeypot — hidden from users, catches bots */}
                  <input
                    type="checkbox"
                    name="botcheck"
                    tabIndex={-1}
                    autoComplete="off"
                    checked={!!form.botcheck}
                    onChange={(e) => setForm({ ...form, botcheck: e.target.checked ? '1' : '' })}
                    className="hidden"
                    aria-hidden="true"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full name" name="name" value={form.name} onChange={onChange} required placeholder="Jane Cooper" />
                    <Input
                      label="Work email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      placeholder="jane@company.com"
                    />
                  </div>
                  <Input label="Company" name="company" value={form.company} onChange={onChange} placeholder="Company Inc." />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-800 dark:text-slate-200">
                      How can we help?
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={4}
                      required
                      placeholder="Tell us about your business challenge…"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-ink-700 dark:text-white"
                    />
                  </div>
                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={sending} className="btn-primary w-full text-base disabled:cursor-not-allowed disabled:opacity-70">
                    {sending ? (
                      <>
                        <Send size={18} className="animate-pulse" /> Sending…
                      </>
                    ) : (
                      <>
                        <Calendar size={18} /> Book Free Consultation
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    We reply within one business day. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-800 dark:text-slate-200">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-white/10 dark:bg-ink-700 dark:text-white"
      />
    </div>
  )
}
