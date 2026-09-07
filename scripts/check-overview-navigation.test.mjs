import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import { transformWithEsbuild } from 'vite'
import * as stops from '../src/universe/core/stops.js'

// Run the real controller with deterministic browser/animation dependencies.
// Transform module syntax only; its handoff and reentry logic stays intact.
async function compile(relativePath) {
  const url = new URL(relativePath, import.meta.url)
  const source = await readFile(url, 'utf8')
  const { code } = await transformWithEsbuild(source, url.pathname, {
    format: 'cjs',
    define: { 'import.meta.env.DEV': 'false' },
  })
  return code
}

const snapCode = await compile('../src/universe/core/snap.js')
const engineCode = await compile('../src/universe/core/engine.js')

function evaluate(code, dependencies, globals = {}) {
  const module = { exports: {} }
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
      return dependencies[name]
    },
    ...globals,
  })
  return module.exports
}

function makeWindow(scrollY = 1200) {
  return {
    scrollY,
    innerHeight: 900,
    devicePixelRatio: 1,
    matchMedia: () => ({ matches: false }),
    scrollTo(_x, y) { this.scrollY = y },
    addEventListener() {},
    removeEventListener() {},
  }
}

function setupSnap() {
  const window = makeWindow()
  const tweens = []
  const observer = {
    enabled: true,
    enable() { this.enabled = true },
    disable() { this.enabled = false },
    kill() {},
  }
  const lenis = {
    isScrolling: false,
    stops: 0,
    start() {},
    stop() { this.stops++; this.isScrolling = false },
  }
  const { createSnap } = evaluate(snapCode, {
    gsap: {
      registerPlugin() {},
      to(_proxy, options) {
        const tween = { options, killed: false, kill() { this.killed = true } }
        tweens.push(tween)
        return tween
      },
      delayedCall(_delay, fn) { fn() },
    },
    'gsap/Observer': { Observer: { create: () => observer } },
    './stops': stops,
  }, { window })
  const snap = createSnap({ lenis, journeyMax: () => 8100, reduced: false })
  return { snap, window, lenis, observer, tweens }
}

test('overview navigation retains the story scroll while crossing the journey', () => {
  const { snap, window, lenis, observer, tweens } = setupSnap()
  snap.release({ programmatic: true })
  lenis.isScrolling = 'smooth'

  // This first frame reproduced the original failure: the controller stopped
  // Lenis and snapped to the finale before the overview could be reached.
  for (const y of [1200, 1800, 4600, 8000, 8400, 9300]) {
    window.scrollY = y
    snap.update(1 / 60)
    assert.equal(snap.mode, 'story', `Scroll ownership at ${y}px`)
    assert.equal(observer.enabled, false)
  }
  assert.equal(lenis.stops, 0)
  assert.equal(tweens.length, 0, 'No competing snap to the finale')

  lenis.isScrolling = false
  snap.update(1 / 60)
  assert.equal(snap.mode, 'story', 'Arrival leaves the overview readable')

  window.scrollY = 7900
  snap.update(1 / 60)
  assert.equal(snap.mode, 'journey', 'Scrolling back up restores journey gestures')
  assert.equal(observer.enabled, true)
  assert.equal(lenis.stops, 1)
})

test('canceling a trip before the story restores journey navigation', () => {
  const { snap, lenis, observer } = setupSnap()
  snap.release({ programmatic: true })
  lenis.isScrolling = 'smooth'
  snap.update(1 / 60)
  lenis.isScrolling = false
  snap.update(1 / 60)
  assert.equal(snap.mode, 'journey')
  assert.equal(observer.enabled, true)
  assert.equal(lenis.stops, 1)
})

test('programmatic handoff cancels a snap already in progress', () => {
  const { snap, tweens } = setupSnap()
  snap.toProgress(0.7)
  assert.equal(snap.locked, true)
  snap.release({ programmatic: true })
  assert.equal(tweens[0].killed, true)
  assert.equal(snap.locked, false)
})

test('ordinary upward reentry is unchanged without programmatic navigation', () => {
  const { snap, window } = setupSnap()
  window.scrollY = 8400
  snap.release()
  snap.update(1 / 60)
  assert.equal(snap.mode, 'story')
  window.scrollY = 7900
  snap.update(1 / 60)
  assert.equal(snap.mode, 'journey')
})

test('scrollToElement requests the guarded handoff for its actual DOM destination', () => {
  const calls = []
  const overview = { id: 'overview' }
  const window = makeWindow()
  class Lenis {
    scrollTo(target, options) { calls.push({ target, options }) }
    start() {}
    stop() {}
    destroy() {}
  }
  const { startEngine, scrollToElement } = evaluate(engineCode, {
    lenis: Lenis,
    './store': { state: { progress: 0.4 }, set() {} },
    './world': { sceneIndexAt: () => 0 },
    './snap': {
      STOPS: stops.STOPS,
      createSnap: () => ({
        release(options) { calls.push({ handoff: options }) },
        destroy() {},
      }),
    },
  }, {
    window,
    navigator: { hardwareConcurrency: 8, deviceMemory: 8 },
    document: { querySelector: (selector) => selector === '.uv-scroll' ? { offsetHeight: 9000 } : overview },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
  })
  const stop = startEngine()
  calls.length = 0
  scrollToElement('#overview', { duration: 1.2 })
  assert.equal(calls[0].handoff.programmatic, true)
  assert.equal(calls[1].target, overview)
  assert.equal(calls[1].options.duration, 1.2)
  assert.ok(calls[1].options.offset < 0, 'Fixed header retains its clearance')
  stop()
})
