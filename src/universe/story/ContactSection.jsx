import { useState } from 'react'
import { Reveal, Section } from './parts.jsx'
import { buildOptions, contactChannels, timelines } from '../../data/business.js'

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT
//
// The single form on the site. Qualification fields, not a comment box: what
// the company is, what they want built, how the process runs today, and when.
// Those four answers are what make the reply useful instead of a request for
// more information.
//
// Posts to the same Web3Forms endpoint the classic route uses, so every lead —
// whichever surface it came from — lands in one inbox.
// ─────────────────────────────────────────────────────────────────────────────

const WEB3FORMS_KEY = '992dcaed-fdcf-4e47-a033-c6e23ac6a9c8'

const EMPTY = {
  name: '',
  company: '',
  website: '',
  email: '',
  build: '',
  processNow: '',
  timeline: '',
  botcheck: '',
}

export default function ContactSection() {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

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
          subject: `New enquiry: ${form.build || 'Project'} — ${form.company || form.name || 'website visitor'}`,
          from_name: 'Trimugo',
          name: form.name,
          company: form.company,
          company_website: form.website,
          email: form.email,
          looking_to_build: form.build,
          current_process: form.processNow,
          timeline: form.timeline,
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
    <Section id="contact" className="st-section--contact" label="Contact Trimugo">
      <div className="st-contact">
        <Reveal className="st-contact__intro">
          <p className="st-kicker">Start a conversation</p>
          <h2 className="st-title">Tell us how your process works today.</h2>
          <p className="st-lead">
            Four answers are enough for a useful first reply — what you run, what you want built,
            how it works now, and when you need it.
          </p>

          <ul className="st-contact__channels">
            {contactChannels.map((c) => (
              <li key={c.label}>
                <a href={c.href} target="_blank" rel="noreferrer noopener">
                  <em>{c.label}</em>
                  {c.value}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="st-contact__panel">
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
                  <span>Name</span>
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
                  <span>Company</span>
                  <input
                    name="company"
                    value={form.company}
                    onChange={onChange}
                    required
                    placeholder="Cooper Logistics GmbH"
                    autoComplete="organization"
                  />
                </label>
              </div>

              <div className="uv-form__row">
                <label className="uv-field">
                  <span>
                    Company website <em>optional</em>
                  </span>
                  <input
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={onChange}
                    placeholder="https://"
                    autoComplete="url"
                  />
                </label>
                <label className="uv-field">
                  <span>Work email</span>
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
                  <span>What are you looking to build?</span>
                  <select name="build" value={form.build} onChange={onChange} required>
                    <option value="">Select…</option>
                    {buildOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="uv-field">
                  <span>Expected timeline</span>
                  <select name="timeline" value={form.timeline} onChange={onChange} required>
                    <option value="">Select…</option>
                    {timelines.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="uv-field">
                <span>How does the process work today?</span>
                <textarea
                  name="processNow"
                  rows={4}
                  value={form.processNow}
                  onChange={onChange}
                  required
                  placeholder="Who touches it, where it waits, which systems it crosses…"
                />
              </label>

              {error && (
                <p className="uv-form__error" role="alert">
                  {error}
                </p>
              )}

              <div className="st-form__foot">
                <button type="submit" className="uv-btn" disabled={sending}>
                  <span>{sending ? 'Sending…' : 'Discuss Your Workflow'}</span>
                </button>
                <p className="st-form__note">We reply within one business day.</p>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  )
}
