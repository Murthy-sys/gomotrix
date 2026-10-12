// Section motion is owned by useStoryTransition. These semantic groups stay
// visible without JavaScript and do not create additional scroll observers.
export function Reveal({ as: Tag = 'div', className = '', delay: _delay, children, ...rest }) {
  return <Tag className={`st-reveal ${className}`.trim()} {...rest}>{children}</Tag>
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
    <>
      <span className="st-stack-anchor" aria-hidden="true" />
      <section id={id} className={`st-section ${className}`.trim()} aria-label={label}>
        <div className="st-wrap">{children}</div>
      </section>
    </>
  )
}
