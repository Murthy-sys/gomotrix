import { useEffect } from 'react'
import Hero from './hero/Hero.jsx'
import Chrome from './overlay/Chrome.jsx'
import Story from './story/Story.jsx'
import StudioBackdrop from './StudioBackdrop.jsx'
import { scrollToElement } from './core/engine.js'

import './styles/base.css'
import './styles/overlay.css'
import './styles/contact-form.css'
import './styles/story.css'
import './styles/product-studio.css'
import './styles/work-studio.css'

export default function Universe() {
  useEffect(() => {
    document.documentElement.classList.add('uv-active')
    // A direct section URL may arrive before the lazy homepage has mounted.
    const hash = window.location.hash
    const frame = /^#(?:hero|overview|work|process|team|faq|contact)$/.test(hash)
      ? requestAnimationFrame(() => scrollToElement(hash))
      : null
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      document.documentElement.classList.remove('uv-active')
    }
  }, [])

  return (
    <div className="uv-root">
      <StudioBackdrop />
      <Chrome />
      <main id="main-content">
        <Hero />
        <Story />
      </main>
    </div>
  )
}
