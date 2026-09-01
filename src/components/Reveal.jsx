import { useLayoutEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/motion.js'

// Scroll-triggered reveal via GSAP + ScrollTrigger.
//
// The previous version used a CSS animation that started the moment the
// element mounted — not when it scrolled into view. Since this whole site
// mounts every section up front, everything below the fold had already
// finished "revealing" (invisibly, off-screen) within about a second of page
// load, long before a visitor actually scrolled down to see it. This now
// genuinely plays on arrival, once, and never again on the way back up.
//
// Progressive enhancement still isn't negotiable: children render visible by
// default. GSAP only pushes opacity to 0 once it has actually taken over the
// node, so a script that fails to load can never leave content stuck hidden
// — and reduced-motion visitors skip the animation entirely.
export default function Reveal({ children, i = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (reducedMotion || !ref.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay: Math.min(i * 0.06, 0.3),
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            once: true,
          },
        },
      )
    }, ref)

    return () => ctx.revert()
    // Mount-only: `i` sets the initial stagger delay and isn't meant to
    // re-trigger the reveal if it changes later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
