import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '../../lib/motion.js'

// Sticky sections keep native scrolling. Only the outgoing glass surface
// recedes; the stationary markers own navigation and animation measurements.
export default function useStoryTransition(track) {
  useEffect(() => {
    const element = track.current
    const stack = element?.querySelector('.st-stack')
    if (!stack) return

    const media = gsap.matchMedia()
    media.add({
      desktop: '(min-width: 851px)',
      mobile: '(max-width: 850px)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      if (context.conditions.reduced) return

      const cards = [...stack.children]
        .filter((node) => node.matches('.st-section, .st-foot'))
        .map((node) => ({
          node,
          panel: node.querySelector('.st-wrap'),
          anchor: node.previousElementSibling,
          inset: 0,
          top: 0,
        }))
      const position = (card) => card.anchor.getBoundingClientRect().top + window.scrollY
      let clearance = 0
      let alive = true
      let refreshFrame
      const transitions = []

      const measure = () => {
        const header = document.querySelector('.uv-chrome')?.getBoundingClientRect()
        clearance = Math.min((header?.bottom ?? 72) + 12, 112, window.innerHeight * 0.2)
        cards.forEach((card, index) => {
          // The work card has a padded studio wrapper; other cards are direct.
          card.inset = parseFloat(getComputedStyle(card.panel.parentElement).paddingTop) || 0
          // Oversized cards scroll to their bottom before sticking. This keeps
          // long disclosures and the mobile form readable without inner scroll.
          card.top = Math.min(
            clearance - card.inset,
            window.innerHeight - 24 - card.panel.offsetHeight - card.inset,
          )
          card.node.style.setProperty('--stack-top', `${card.top}px`)
          card.node.style.setProperty('--stack-layer', index + 1)
        })
        const last = cards.at(-1)
        const tail = Math.max(0, window.innerHeight - last.node.offsetHeight - last.top)
        stack.style.setProperty('--stack-tail', `${Math.ceil(tail)}px`)
      }

      stack.classList.add('is-stacking')
      measure()

      cards.slice(0, -1).forEach((card, index) => {
        const next = cards[index + 1]
        const timeline = gsap.timeline({
          scrollTrigger: {
            id: `story-stack-${index}`,
            trigger: next.anchor,
            start: () => Math.max(0, position(next) + next.inset - window.innerHeight * 0.86),
            end: () => position(next) + next.inset - clearance,
            scrub: context.conditions.mobile ? 0.3 : 0.45,
            invalidateOnRefresh: true,
          },
          onUpdate: () => card.node.classList.toggle('is-covered', timeline.progress() > 0.995),
        })
        timeline.fromTo(card.panel, {
          scale: 1, y: 0, opacity: 1, transformOrigin: '50% 0%',
        }, {
          scale: context.conditions.mobile ? 0.975 : 0.95,
          y: context.conditions.mobile ? -6 : -12,
          duration: 1,
          ease: 'none',
        }, 0)
        // Let the incoming card visibly overlap before hiding the buried copy.
        timeline.to(card.panel, { opacity: 0, duration: 0.55, ease: 'power1.inOut' }, 0.45)
        transitions.push(timeline)
      })

      const overview = element.querySelector('.st-overview__copy')
      const intro = gsap.fromTo(overview, { y: 28, opacity: 0.65 }, {
        y: 0, opacity: 1, ease: 'power1.out',
        scrollTrigger: {
          id: 'story-overview', trigger: overview.parentElement,
          start: 'clamp(top 96%)', end: 'clamp(top 40%)', scrub: 0.5,
        },
      })
      transitions.push(intro)

      const refresh = () => {
        cancelAnimationFrame(refreshFrame)
        refreshFrame = requestAnimationFrame(() => {
          if (!alive) return
          measure()
          transitions.forEach((animation) => animation.scrollTrigger.refresh())
        })
      }
      const onFocus = (event) => {
        const index = cards.findIndex((card) => card.node.contains(event.target))
        if (index < 0 || index === cards.length - 1) return
        if (transitions[index].progress() < 0.05) return
        // A covered card stays keyboard accessible. Bring it back into the
        // document's reading position before showing its focused control.
        window.scrollTo({ top: Math.max(0, position(cards[index]) - clearance), behavior: 'instant' })
        ScrollTrigger.update()
        transitions.forEach((animation) => animation.scrollTrigger.getTween()?.progress(1))
        const bounds = event.target.getBoundingClientRect()
        const safeBottom = window.innerHeight - 24
        const shift = bounds.height > safeBottom - clearance
          ? bounds.top - clearance
          : bounds.bottom > safeBottom
            ? bounds.bottom - safeBottom
            : bounds.top < clearance ? bounds.top - clearance : 0
        if (shift) {
          window.scrollBy({ top: shift, behavior: 'instant' })
          ScrollTrigger.update()
          transitions.forEach((animation) => animation.scrollTrigger.getTween()?.progress(1))
        }
      }
      stack.addEventListener('focusin', onFocus)
      window.addEventListener('resize', refresh, { passive: true })
      const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(refresh) : null
      cards.forEach(({ node }) => resize?.observe(node))
      resize?.observe(element.querySelector('.st-overview'))
      const header = document.querySelector('.uv-chrome')
      if (header) resize?.observe(header)
      document.fonts?.ready.then(() => { if (alive) refresh() })
      refresh()

      return () => {
        alive = false
        cancelAnimationFrame(refreshFrame)
        resize?.disconnect()
        stack.removeEventListener('focusin', onFocus)
        window.removeEventListener('resize', refresh)
        stack.classList.remove('is-stacking')
        stack.style.removeProperty('--stack-tail')
        cards.forEach(({ node }) => {
          node.classList.remove('is-covered')
          node.style.removeProperty('--stack-top')
          node.style.removeProperty('--stack-layer')
        })
      }
    }, element)

    return () => media.revert()
  }, [track])
}
