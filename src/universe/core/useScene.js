import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES, isActive, local, band } from './world'
import { state } from './store'

/**
 * Gates a scene to its slice of the journey.
 *
 * Nine scenes' worth of geometry cannot all animate at once and hold 60fps. This
 * hook flips `visible` off and — more importantly — exposes `d.active` so each
 * scene can bail out of its own `useFrame` the moment the camera is elsewhere.
 * Registered before the scene's own frame callback, so its values are always
 * fresh by the time the scene reads them.
 *
 * @returns {{ group: object, d: { current: { active: boolean, local: number, band: number, t: number } }, scene: object }}
 */
export default function useScene(id) {
  const scene = useMemo(() => SCENES.find((s) => s.id === id), [id])
  const group = useRef()
  const d = useRef({ active: false, local: 0, band: 0, t: 0 })

  useFrame((_, dt) => {
    const p = state.progress
    const active = isActive(p, scene.start, scene.end)

    d.current.active = active
    d.current.local = local(p, scene.start, scene.end)
    d.current.band = band(p, scene.start, scene.end, 0.035)
    // Scene-local clock: only advances while the scene is on screen, so nothing
    // is mid-way through an animation cycle when the camera arrives.
    if (active) d.current.t += dt

    if (group.current && group.current.visible !== active) group.current.visible = active
  })

  return { group, d, scene }
}
