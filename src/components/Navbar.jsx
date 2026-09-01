import { useEffect, useState } from 'react'
import { Menu, X, Moon, Sun, Calendar } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { navLinks } from '../data/content.js'
import BrandLockup from './BrandLockup.jsx'

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Which section is "current" — a thin detection band a fifth of the way
  // down the viewport, so the active link updates around where the reader's
  // eye actually is, not the instant a section's top pixel appears.
  useEffect(() => {
    const sections = navLinks.map((l) => document.getElementById(l.href.slice(1))).filter(Boolean)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (!visible.length) return
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        )
        setActive(`#${topMost.target.id}`)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/80'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-20">
        <a href="#top" aria-label="Trimugo home">
          <BrandLockup markClass="h-10 w-10" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? 'true' : undefined}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active === l.href
                    ? 'text-brand-700 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                {l.label}
                {active === l.href && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-amber-500" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href="#contact" className="btn-primary hidden sm:inline-flex">
            <Calendar size={16} />
            Book Consultation
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200/70 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/95 lg:hidden">
          <ul className="container-x flex flex-col gap-1 py-4">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="btn-primary w-full">
                <Calendar size={16} />
                Book Free Consultation
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
