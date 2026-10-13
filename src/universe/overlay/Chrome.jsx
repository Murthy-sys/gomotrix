import Logo from '../../components/Logo.jsx'
import { scrollToElement } from '../core/engine.js'

export default function Chrome() {
  const go = (event, target, options) => {
    event.preventDefault()
    scrollToElement(target, options)
  }

  return (
    <>
      <a className="uv-skip" href="#overview" onClick={(event) => {
        document.getElementById('overview')?.focus({ preventScroll: true })
        go(event, '#overview')
      }}>Skip to main content</a>
      <header className="uv-chrome uv-chrome--top">
        <a className="uv-brand" href="#hero" onClick={(event) => go(event, '#hero', { offset: 0 })} aria-label="Trimugo home">
          <Logo className="uv-brand__mark" />
          <span className="uv-brand__text">
            <span className="uv-brand__word">Trimugo</span>
            <span className="uv-brand__tag">Smart Solutions</span>
          </span>
        </a>
        <nav className="uv-nav" aria-label="Primary">
          <ul className="uv-nav__links"><li><a className="uv-nav__link" href="#work" onClick={(event) => go(event, '#work')}>Work</a></li></ul>
          <a className="uv-btn uv-btn--sm" href="#contact" onClick={(event) => go(event, '#contact')}><span className="uv-btn__label">Start a project</span></a>
        </nav>
      </header>
    </>
  )
}
