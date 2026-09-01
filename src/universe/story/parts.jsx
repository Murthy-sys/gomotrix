import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Shared building blocks for the business story track.
//
// The track sits below a live WebGL canvas that is still holding a render loop.
// Everything here is therefore built to cost as close to nothing as possible:
// one shared IntersectionObserver for the whole page, CSS transitions rather
// than animated JS, and no scroll listeners of its own.
// ─────────────────────────────────────────────────────────────────────────────

let observer = null

function sharedObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-in')
        // Reveal is a one-way door. Un-observing keeps the callback list short
        // as the reader moves down a very long page.
        observer.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  )
  return observer
}

/** Adds `is-in` the first time the node enters the viewport. */
export function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reduced motion, and any browser without IntersectionObserver, get the end
    // state immediately — never a hidden element waiting on an animation the
    // user asked not to see, or on an API that is not there.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.classList.add('is-in')
      return
    }
    const o = sharedObserver()
    o.observe(el)
    return () => o.unobserve(el)
  }, [])
  return ref
}

/**
 * Dead-man's switch for the reveal.
 *
 * This site has already shipped one bug where scroll-reveal left content
 * invisible on mobile (see the "content could stay hidden behind scroll-reveal"
 * fix in the history), so the reveal is not allowed to be the only thing
 * standing between a visitor and the copy. If revealable content is sitting in
 * the viewport and nothing has been revealed, the observer is not delivering —
 * so we drop the animation entirely and show the page.
 *
 * Returns a teardown.
 */
export function armRevealFallback(track, every = 2000) {
  if (!track) return () => {}

  // A poll rather than a single timer: the reader is usually still inside the
  // journey when a one-shot would fire, so it would look at an empty viewport,
  // find nothing wrong, and never check again. This keeps checking until it can
  // actually answer the question, then stops.
  const id = setInterval(() => {
    if (track.querySelector('.st-reveal.is-in')) {
      clearInterval(id) // the observer is delivering; nothing to guard against
      return
    }
    const onScreen = [...track.querySelectorAll('.st-reveal')].some((el) => {
      const r = el.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    })
    if (!onScreen) return // reader has not reached the track yet — keep waiting

    // Revealable content is sitting in the viewport and none of it has been
    // revealed. The observer is not delivering, so the animation is dropped
    // and the page is shown.
    track.classList.remove('st-anim')
    clearInterval(id)
  }, every)

  return () => clearInterval(id)
}

/**
 * A revealing block. `delay` staggers siblings via a custom property so the
 * stagger costs one style write, not a timer per child.
 */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useReveal()
  return (
    <Tag
      ref={ref}
      className={`st-reveal ${className}`.trim()}
      style={delay ? { '--d': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** The standard section opener: kicker, display heading, optional lead. */
export function Head({ kicker, title, body, align = 'left' }) {
  return (
    <Reveal className={`st-head st-head--${align}`}>
      {kicker && <p className="st-kicker">{kicker}</p>}
      <h2 className="st-title">{title}</h2>
      {body && <p className="st-lead">{body}</p>}
    </Reveal>
  )
}

/** A titled region of the track. `id` is the scroll/nav target. */
export function Section({ id, className = '', children, label }) {
  return (
    <section id={id} className={`st-section ${className}`.trim()} aria-label={label}>
      <div className="st-wrap">{children}</div>
    </section>
  )
}
