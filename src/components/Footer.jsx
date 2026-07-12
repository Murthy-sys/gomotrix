import { Github, Linkedin, Twitter, Youtube, ArrowUp } from 'lucide-react'
import BrandLockup from './BrandLockup.jsx'

const columns = [
  {
    title: 'Company',
    links: ['About', 'Careers', 'Community', 'Contact', 'Privacy Policy', 'Terms'],
  },
  {
    title: 'Solutions',
    links: ['Custom Software', 'AI Chatbots', 'Cloud Solutions', 'Automation', 'Cybersecurity'],
  },
  {
    title: 'Industries',
    links: ['Healthcare', 'Retail', 'Finance', 'Logistics', 'Government'],
  },
  {
    title: 'Resources',
    links: ['Knowledge Center', 'Our Work', 'ROI Calculator', 'Readiness Checklist', 'Students'],
  },
]

// Anchors for links whose section exists on the page; the rest fall back to #top.
const hrefs = {
  About: '#about',
  Contact: '#contact',
  'Custom Software': '#solutions',
  'AI Chatbots': '#ai',
  'Cloud Solutions': '#solutions',
  Automation: '#solutions',
  Cybersecurity: '#solutions',
  Healthcare: '#industries',
  Retail: '#industries',
  Finance: '#industries',
  Logistics: '#industries',
  Government: '#industries',
  'Knowledge Center': '#knowledge',
  'Our Work': '#cases',
  'ROI Calculator': '#resources',
  'Readiness Checklist': '#resources',
  Students: '#students',
}

const socials = [
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Github, label: 'GitHub' },
  { icon: Youtube, label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-900">
      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <a href="#top" className="inline-flex">
              <BrandLockup markClass="h-10 w-10" />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Your long-term technology partner — delivering affordable, scalable, and intelligent solutions
              for businesses of all sizes.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#top"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-ink-900 dark:text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href={hrefs[l] || '#top'}
                      className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {2026} Trimugo. All rights reserved.
          </p>
          <a
            href="#top"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-white"
          >
            Back to top <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  )
}
