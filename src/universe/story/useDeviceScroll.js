import { useEffect } from 'react'
import { gsap } from '../../lib/motion.js'

// Keep the options object stable (for example, at module scope). GSAP owns
// only the outer motion layers, leaving each device's CSS pose intact.
export default function useDeviceScroll(scene, options) {
  useEffect(() => {
    const element = scene.current
    if (!element) return
    const { id, layers, connectionsSelector, resizeSelector } = options
    const media = gsap.matchMedia()
    const card = element.closest('.st-stack > .st-section')
    const marker = card?.previousElementSibling
    const stackAnchor = marker?.classList.contains('st-stack-anchor') ? marker : null
    // Ignore entry transforms and the card's sticky displacement. Offsets below
    // the card retain layout geometry; its marker retains the document origin.
    const layoutTop = () => {
      let top = 0
      for (let node = element; node; node = node.offsetParent) {
        if (node === card && stackAnchor) {
          return top + stackAnchor.getBoundingClientRect().top + window.scrollY
        }
        // offsetTop starts at the offset parent's padding edge, so account
        // for each intervening border once, including the card's own border.
        top += node.offsetTop + (node.offsetParent?.clientTop || 0)
      }
      return top
    }

    media.add({
      desktop: '(min-width: 851px)',
      mobile: '(max-width: 850px)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const { mobile, reduced } = context.conditions
      element.dataset.motion = reduced ? 'static' : 'scroll'
      if (reduced) return

      const travel = mobile ? 0.42 : 1
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id,
          trigger: element,
          start: () => layoutTop() - window.innerHeight,
          end: () => layoutTop() + element.offsetHeight,
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      })

      layers.forEach(({ selector, lift, spread, turn, depth }, index) => {
        const layer = element.querySelector(selector)
        if (!layer) return
        const offset = index * 0.025
        timeline.fromTo(layer, {
          y: lift * travel,
          x: spread * travel,
          rotation: turn,
          rotationX: mobile ? 0 : 12,
          scale: depth,
          transformPerspective: 1000,
        }, {
          y: 0, x: 0, rotation: 0, rotationX: 0, scale: 1,
          duration: 0.36,
          ease: 'power1.out',
        }, offset)
        // Hold a readable composition at the centre, then separate the layers
        // at different depths. Native scroll reverses the same sequence.
        timeline.to(layer, {
          y: (index - (layers.length - 1) / 2) * 8 * travel,
          duration: 0.22,
        }, 0.435)
        timeline.to(layer, {
          y: -lift * 0.68 * travel,
          x: -spread * travel,
          rotation: -turn * 0.65,
          rotationX: mobile ? 0 : -8,
          scale: 1.06,
          duration: 0.345,
          ease: 'power1.in',
        }, 0.655)
      })

      const connections = connectionsSelector ? element.querySelector(connectionsSelector) : null
      if (connections) {
        timeline.fromTo(connections, { opacity: 0 }, { opacity: 0.6, duration: 0.2 }, 0.2)
        timeline.to(connections, { opacity: 0, duration: 0.2 }, 0.7)
      }

      let alive = true
      let refreshFrame
      const refresh = () => {
        cancelAnimationFrame(refreshFrame)
        refreshFrame = requestAnimationFrame(() => timeline.scrollTrigger.refresh())
      }
      const resize = 'ResizeObserver' in window ? new ResizeObserver(refresh) : null
      const resizeTarget = resizeSelector ? element.closest(resizeSelector) : null
      resize?.observe(resizeTarget || element)
      document.fonts?.ready.then(() => { if (alive) refresh() })
      timeline.scrollTrigger.refresh()

      return () => {
        alive = false
        cancelAnimationFrame(refreshFrame)
        resize?.disconnect()
      }
    }, element)

    return () => {
      media.revert()
      delete element.dataset.motion
    }
  }, [scene, options])
}
