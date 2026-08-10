import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { state } from './store'
import { camCurve, lookCurve, curveT, ANCHORS } from './world'

// Scratch vectors — allocating inside useFrame would hand the GC a sawtooth.
const vPos = new THREE.Vector3()
const vLook = new THREE.Vector3()
const vFwd = new THREE.Vector3()
const vRight = new THREE.Vector3()
const vUp = new THREE.Vector3()
const UP = new THREE.Vector3(0, 1, 0)
const qTarget = new THREE.Quaternion()
const mLook = new THREE.Matrix4()

/**
 * The only thing in this experience that is truly "animated" is the camera.
 *
 * Position and orientation are sampled from the spline, then damped — so the
 * camera always has weight and never arrives instantly. On top of that sit two
 * small offsets: pointer parallax, and a permanent idle drift that keeps the
 * shot alive even when the user is completely still.
 */
export default function CameraRig() {
  const { camera, scene } = useThree()

  const started = useRef(false)

  // Dev-only handle so automated checks can inspect the live scene graph and
  // teleport the camera instead of waiting out the damping.
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__uv = Object.assign(window.__uv || {}, {
      scene,
      camera,
      snap: () => (started.current = false),
    })
  }
  const pos = useRef(new THREE.Vector3(0, 0.4, 30))
  const look = useRef(new THREE.Vector3(0, 0, 0))
  const roll = useRef(0)

  useFrame((_, dt) => {
    // Guards against the huge dt a backgrounded tab produces, but generously.
    // Clamping tight (say 0.05) silently makes the damping frame-rate dependent:
    // a device running at 5fps would advance the camera as though only 50ms had
    // passed each frame, so it would crawl through the journey minutes behind
    // the scrollbar. 0.25 only kicks in below 4fps, where nothing is salvageable.
    const d = Math.min(dt, 0.25)
    const t = curveT(state.progress)

    camCurve.getPoint(t, vPos)
    lookCurve.getPoint(t, vLook)

    // Build a camera-local basis so parallax pushes sideways/up relative to the
    // shot, not relative to world axes. Without this the offset would feel wrong
    // every time the camera banks.
    vFwd.subVectors(vLook, vPos).normalize()
    vRight.crossVectors(vFwd, UP).normalize()
    vUp.crossVectors(vRight, vFwd).normalize()

    const time = performance.now() * 0.001
    const amp = state.reduced ? 0 : 1

    // Pointer parallax — subtle. The world should feel like it notices you,
    // not like it is being dragged around.
    const px = state.smooth.x * 1.15 * amp
    const py = state.smooth.y * 0.75 * amp

    // Idle drift. Two incommensurate frequencies so it never visibly loops.
    const driftX = (Math.sin(time * 0.21) * 0.5 + Math.sin(time * 0.37) * 0.22) * amp
    const driftY = (Math.cos(time * 0.17) * 0.36 + Math.sin(time * 0.29) * 0.16) * amp

    vPos.addScaledVector(vRight, px + driftX)
    vPos.addScaledVector(vUp, py + driftY)

    // The look target moves *less* than the camera, which produces a gentle
    // counter-rotation — the signature of a real camera operator easing a head.
    vLook.addScaledVector(vRight, px * 0.22)
    vLook.addScaledVector(vUp, py * 0.16)

    if (!started.current) {
      pos.current.copy(vPos)
      look.current.copy(vLook)
      started.current = true
    }

    // Exponential damping, frame-rate independent. Look lags position slightly
    // so turns read as "the camera arrives, then finds its subject". Lower
    // rate constants = more inertia = a heavier, more deliberate camera.
    const kPos = 1 - Math.exp(-2.2 * d)
    const kLook = 1 - Math.exp(-1.7 * d)
    pos.current.lerp(vPos, kPos)
    look.current.lerp(vLook, kLook)

    camera.position.copy(pos.current)

    // Published for anything that wants to know the current subject.
    state.look.x = look.current.x
    state.look.y = look.current.y
    state.look.z = look.current.z

    // Banking: lean into lateral scroll velocity like an aircraft in a turn.
    const targetRoll = state.reduced ? 0 : THREE.MathUtils.clamp(state.velocity * 0.09, -0.06, 0.06)
    roll.current += (targetRoll - roll.current) * (1 - Math.exp(-2.4 * d))

    mLook.lookAt(camera.position, look.current, UP)
    qTarget.setFromRotationMatrix(mLook)
    camera.quaternion.copy(qTarget)
    camera.rotateZ(roll.current)

    // Focal length is fixed. It used to widen with scroll velocity as a speed
    // cue, but any FOV change during scroll reads as an unwanted zoom — and it
    // fires on every wheel tick. Speed is communicated by the camera path.
  })

  return null
}

/** Distance from the live camera to a world anchor — used for cheap LOD. */
export function distanceTo(camera, key) {
  return camera.position.distanceTo(ANCHORS[key])
}
