import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

/**
 * A label that lives in 3D space but is rendered as real DOM text.
 *
 * drei's <Html> portals its content outside the canvas, so it inherits nothing
 * from the scene graph — not the parent's `visible` flag, and certainly not a
 * shader's opacity uniform. Left alone, every label in the experience would be
 * legible at all times, including the ones belonging to scenes that are eleven
 * seconds of travel away.
 *
 * This gates the DOM on a plain number ref the owning scene writes each frame,
 * and takes the node out of the accessibility tree entirely once faded, so a
 * screen reader never announces a label from a scene nobody is looking at.
 */
export default function WorldLabel({ fade, children, className = '', ...html }) {
  const ref = useRef()
  const shown = useRef(true)

  useFrame(() => {
    const el = ref.current
    if (!el) return

    const v = fade ? Math.max(0, Math.min(1, fade.current)) : 1
    const visible = v > 0.012

    if (visible !== shown.current) {
      shown.current = visible
      el.style.visibility = visible ? 'visible' : 'hidden'
      if (visible) el.removeAttribute('aria-hidden')
      else el.setAttribute('aria-hidden', 'true')
    }
    if (visible) el.style.opacity = String(v)
  })

  return (
    <Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }} {...html}>
      <div ref={ref} className={className} style={{ willChange: 'opacity' }}>
        {children}
      </div>
    </Html>
  )
}
