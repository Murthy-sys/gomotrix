import assert from 'node:assert/strict'
import test from 'node:test'
import { advanceOrbit, EARTH_RADIUS, fitOrbitCamera, orbitPoint, orbitScale, SERVICE_ORBITS } from '../src/universe/hero/orbitMath.js'

test('each service completes a continuous circle outside the Earth surface', () => {
  for (const orbit of SERVICE_ORBITS) {
    const position = {}
    for (let step = 0; step <= 360; step += 1) {
      orbitPoint(orbit, step * Math.PI / 180, position)
      assert.ok(Math.abs(Math.hypot(position.x, position.y, position.z) - orbit.radius) < 1e-12)
      assert.ok(Math.hypot(position.x, position.y, position.z) > EARTH_RADIUS)
    }
    const start = orbitPoint(orbit, orbit.phase, {})
    const finish = orbitPoint(orbit, orbit.phase + Math.PI * 2, {})
    for (const axis of ['x', 'y', 'z']) assert.ok(Math.abs(start[axis] - finish[axis]) < 1e-12)
  }
})

test('perspective makes services smaller behind Earth and restores original size in front', () => {
  for (const orbit of SERVICE_ORBITS) {
    const depth = orbit.radius * Math.sin(orbit.tilt)
    assert.equal(orbitScale(9, depth, depth), 1)
    const back = orbitScale(9, -depth, depth)
    assert.ok(back > 0.5 && back < 0.6)
    assert.ok(orbitScale(9, 0, depth) > back)
    assert.ok(orbitScale(9, 0, depth) < 1)
  }
})

test('every service travels both behind and in front of the Earth', () => {
  for (const orbit of SERVICE_ORBITS) {
    assert.ok(orbitPoint(orbit, Math.PI / 2, {}).z > 0)
    assert.ok(orbitPoint(orbit, Math.PI * 1.5, {}).z < 0)
  }
})

test('the reduced-motion pose leaves all services in front and visible', () => {
  const poses = []
  for (const orbit of SERVICE_ORBITS) {
    const point = orbitPoint(orbit, orbit.staticPhase, {})
    assert.ok(point.z > 0)
    poses.push(point)
  }
  for (let index = 0; index < poses.length; index += 1) {
    for (let other = index + 1; other < poses.length; other += 1) {
      const first = poses[index]
      const second = poses[other]
      assert.ok(Math.hypot(first.x - second.x, first.y - second.y) > 1.4)
    }
  }
})

test('seven live services remain evenly spaced and always leave several in front', () => {
  assert.equal(SERVICE_ORBITS.length, 7)
  const spacing = Math.PI * 2 / SERVICE_ORBITS.length
  const phases = SERVICE_ORBITS.map((orbit) => orbit.phase).sort((a, b) => a - b)
  for (let index = 1; index < phases.length; index += 1) {
    assert.ok(Math.abs(phases[index] - phases[index - 1] - spacing) < 1e-12)
  }
  for (let step = 0; step < 720; step += 1) {
    const phase = step * Math.PI / 360
    assert.ok(SERVICE_ORBITS.filter((orbit) => orbitPoint(orbit, orbit.phase + phase, {}).z > 0).length >= 3)
  }
})

test('orbital motion depends on elapsed time and wraps without changing the position', () => {
  const orbit = SERVICE_ORBITS[0]
  assert.equal(advanceOrbit(0), 0)
  assert.equal(advanceOrbit(45), 0)
  assert.equal(advanceOrbit(22.5), Math.PI)
  const before = orbitPoint(orbit, advanceOrbit(44.999), {})
  const after = orbitPoint(orbit, advanceOrbit(45.001), {})
  assert.ok(Math.hypot(before.x - after.x, before.y - after.y, before.z - after.z) < 0.001)
})

test('camera fitting contains full badge widths throughout an orbit at mobile and desktop sizes', () => {
  for (const [width, height, badgeWidth] of [[320, 440, 144], [390, 440, 150], [900, 900, 210], [1024, 800, 224]]) {
    const distance = fitOrbitCamera({ width, height, labelWidths: SERVICE_ORBITS.map(() => badgeWidth) })
    const focalPixels = height / (2 * Math.tan(42 * Math.PI / 360))
    for (const orbit of SERVICE_ORBITS) {
      for (let step = 0; step < 720; step += 1) {
        const point = orbitPoint(orbit, step * Math.PI / 360, {})
        const halfBadge = badgeWidth / 2 * orbitScale(distance, point.z, orbit.radius * Math.sin(orbit.tilt))
        const center = Math.abs(point.x) * focalPixels / (distance - point.z)
        assert.ok(center + halfBadge < width / 2 - 8, `${width}px scene clips at ${step / 2} degrees`)
      }
    }
  }
})
