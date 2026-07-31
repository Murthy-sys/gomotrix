import { useEffect, useRef, useState } from 'react'
import { state } from '../core/store'
import { SCENES, band } from '../core/world'

// The form that closes the journey.
//
// Real inputs, real submit — it posts to the same Web3Forms endpoint the classic
// site uses, so leads land in one place. Fields mirror src/components/Contact.jsx
// exactly; only the skin is different.

const WEB3FORMS_KEY = '992dcaed-fdcf-4e47-a033-c6e23ac6a9c8'

const PROJECT_TYPES = [
  'Website / Web app',
  'Mobile app',
  'AI / Automation',
  'ERP / CRM',
  'College / Student project',
  'Free tech audit',
  'Something else',
]
const BUDGETS = ['Under ₹25k', '₹25k – ₹1L', '₹1L – ₹5L', '₹5L+', 'Not sure yet']

const CONTACTS = [
  { label: 'Email', value: 'trimugoitsolutions@gmail.com', href: 'mailto:trimugoitsolutions@gmail.com' },
  { label: 'Phone', value: '+91 85000 98088', href: 'tel:+918500098088' },
  { label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/918500098088' },
]

export default function ContactForm() {
  const shell = useRef()
  const [form, setForm] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
    botcheck: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Fades with the contact scene's own scroll band, written straight to the
  // node so scrolling never re-renders a form the user might be typing in.
  useEffect(() => {
    const scene = SCENES.find((s) => s.id === 'contact')
    let raf
    let shown = true
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const el = shell.current
      if (!el) return
      const b = band(state.progress, scene.start, scene.end + 0.02, 0.045)
      const visible = b > 0.02
      if (visible !== shown) {
        shown = visible
        el.style.visibility = visible ? 'visible' : 'hidden'
        el.style.pointerEvents = visible ? 'auto' : 'none'
        el.setAttribute('aria-hidden', visible ? 'false' : 'true')
      }
      if (visible) {
        el.style.opacity = String(b)
        el.style.transform = `translate3d(0, ${((1 - b) * 26).toFixed(1)}px, 0)`
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

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
          subject: `New lead: ${form.projectType || 'Project'} — ${form.name || 'website visitor'}`,
          from_name: 'Trimugo Universe',
          name: form.name,
          email: form.email,
          project_type: form.projectType,
          budget: form.budget,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (data.success) setSent(true)
      else setError(data.message || 'Something went wrong. Please try again.')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section
      ref={shell}
      className="uv-contact"
      style={{ visibility: 'hidden', opacity: 0 }}
      aria-label="Start your project"
    >
      <div className="uv-contact__inner">
        <header className="uv-contact__head">
          <p className="uv-contact__kicker">Start Your Project</p>
          <h2 className="uv-contact__title">Tell us what you want to build.</h2>
          <p className="uv-contact__sub">
            We reply within one business day — with a scope and a straight answer on cost.
          </p>
        </header>

        {sent ? (
          <div className="uv-contact__done" role="status">
            <span className="uv-contact__tick" aria-hidden="true" />
            <h3>Message received.</h3>
            <p>We&apos;ll be in touch within one business day.</p>
          </div>
        ) : (
          <form className="uv-form" onSubmit={onSubmit}>
            {/* Honeypot — hidden from people, irresistible to bots. */}
            <input
              type="checkbox"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              onChange={onChange}
              style={{ display: 'none' }}
            />

            <div className="uv-form__row">
              <label className="uv-field">
                <span>Full name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="Jane Cooper"
                  autoComplete="name"
                />
              </label>
              <label className="uv-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="jane@company.com"
                  autoComplete="email"
                />
              </label>
            </div>

            <div className="uv-form__row">
              <label className="uv-field">
                <span>Project type</span>
                <select name="projectType" value={form.projectType} onChange={onChange} required>
                  <option value="">Select…</option>
                  {PROJECT_TYPES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label className="uv-field">
                <span>
                  Budget <em>optional</em>
                </span>
                <select name="budget" value={form.budget} onChange={onChange}>
                  <option value="">Select…</option>
                  {BUDGETS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="uv-field">
              <span>
                Anything else? <em>optional</em>
              </span>
              <textarea
                name="message"
                rows={3}
                value={form.message}
                onChange={onChange}
                placeholder="Tell us about your goals or challenge…"
              />
            </label>

            {error && (
              <p className="uv-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="uv-form__foot">
              <button type="submit" className="uv-btn" disabled={sending}>
                <span>{sending ? 'Sending…' : 'Send it'}</span>
              </button>
              <ul className="uv-contact__links">
                {CONTACTS.map((c) => (
                  <li key={c.label}>
                    <a href={c.href} target="_blank" rel="noreferrer noopener">
                      <em>{c.label}</em>
                      {c.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
