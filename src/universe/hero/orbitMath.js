const TAU = Math.PI * 2
export const EARTH_RADIUS = 2.45

// Service order matches the semantic badge list. A seventh-turn phase spacing
// keeps several services in front throughout a full cycle. Static poses use
// the perimeter, leaving the globe and the other badges readable.
const ORBIT_LAYOUT = [
  { radius: 3.05, tiltDegrees: 70, staticDegrees: 180, phaseSlot: 0 },
  { radius: 3.1, tiltDegrees: 55, staticDegrees: 90, phaseSlot: 4 },
  { radius: 3.02, tiltDegrees: 70, staticDegrees: 0, phaseSlot: 1 },
  { radius: 3.08, tiltDegrees: 65, staticDegrees: 220, phaseSlot: 5 },
  { radius: 3.03, tiltDegrees: 60, staticDegrees: 30, phaseSlot: 6 },
  { radius: 3.07, tiltDegrees: 65, staticDegrees: 320, phaseSlot: 3 },
  { radius: 3.05, tiltDegrees: 60, staticDegrees: 150, phaseSlot: 2 },
]
export const SERVICE_ORBITS = ORBIT_LAYOUT.map(({ radius, tiltDegrees, staticDegrees, phaseSlot }) => {
  const tilt = tiltDegrees * Math.PI / 180
  const staticPhase = 0.24
  const staticAngle = Math.atan2(Math.sin(staticPhase) * Math.cos(tilt), Math.cos(staticPhase))
  return {
    radius,
    tilt,
    rotation: staticDegrees * Math.PI / 180 - staticAngle,
    // Assign the evenly spaced slots to planes that minimize front crossings.
    phase: 2.55 + phaseSlot * TAU / ORBIT_LAYOUT.length,
    staticPhase,
  }
})

/** Write into a reusable vector so the render loop creates no temporary objects. */
export function orbitPoint(orbit, angle, target) {
  const x = Math.cos(angle) * orbit.radius
  const y = Math.sin(angle) * Math.cos(orbit.tilt) * orbit.radius
  const cosine = Math.cos(orbit.rotation)
  const sine = Math.sin(orbit.rotation)
  target.x = x * cosine - y * sine
  target.y = x * sine + y * cosine
  target.z = Math.sin(angle) * Math.sin(orbit.tilt) * orbit.radius
  return target
}

/** Normalized projected size: nearest point is 1, distant points are smaller. */
export function orbitScale(cameraDistance, worldZ, nearestZ) {
  return (cameraDistance - nearestZ) / (cameraDistance - worldZ)
}

export function advanceOrbit(elapsed, secondsPerTurn = 45) {
  return (elapsed / secondsPerTurn * TAU) % TAU
}

/** Find the closest camera that contains entire projected badge boxes. */
export function fitOrbitCamera({ width, height, labelWidths, fov = 42, minimum = 9, padding = 8 }) {
  const available = Math.max(1, width / 2 - padding)
  const focalPixels = height / (2 * Math.tan(fov * Math.PI / 360))
  const samples = []
  for (let index = 0; index < SERVICE_ORBITS.length; index += 1) {
    const orbit = SERVICE_ORBITS[index]
    const halfWidth = (labelWidths[index] || 0) / 2
    const nearest = orbit.radius * Math.sin(orbit.tilt)
    for (let step = 0; step < 360; step += 1) {
      const point = orbitPoint(orbit, step * Math.PI / 180, {})
      samples.push({ x: Math.abs(point.x), z: point.z, halfWidth, nearest })
    }
  }
  const fits = (distance) => samples.every(({ x, z, halfWidth, nearest }) => {
    const projectedCenter = x * focalPixels / (distance - z)
    const projectedHalfWidth = halfWidth * orbitScale(distance, z, nearest)
    // A fractional-pixel reserve covers maxima between the sampled angles.
    return projectedCenter + projectedHalfWidth <= available - 0.5
  })
  if (fits(minimum)) return minimum
  let low = minimum
  let high = minimum * 2
  while (!fits(high) && high < 144) high *= 2
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const middle = (low + high) / 2
    if (fits(middle)) high = middle
    else low = middle
  }
  return high
}
