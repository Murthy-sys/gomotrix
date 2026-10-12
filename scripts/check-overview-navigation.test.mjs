import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import { transformWithEsbuild } from 'vite'

// Evaluate the real navigation module against a small browser boundary. Any
// reintroduced scrolling dependency or startup listener fails this harness.
const url = new URL('../src/universe/core/engine.js', import.meta.url)
const source = await readFile(url, 'utf8')
const { code } = await transformWithEsbuild(source, url.pathname, { format: 'cjs' })

function setup({ scrollY = 300, innerHeight = 900, headerBottom = 76, documentHeight = 6000 } = {}) {
  const calls = []
  const overview = { getBoundingClientRect: () => ({ top: 600 }) }
  const header = headerBottom === null ? null : {
    getBoundingClientRect: () => ({ height: headerBottom, bottom: headerBottom }),
  }
  let reduced = false
  const window = {
    scrollY,
    innerHeight,
    devicePixelRatio: 3,
    matchMedia: (query) => ({ matches: query.includes('reduced-motion') && reduced }),
    scrollTo: (options) => calls.push(options),
  }
  const document = {
    scrollingElement: { scrollHeight: documentHeight },
    documentElement: { scrollHeight: documentHeight },
    querySelector(selector) {
      if (selector === '[') throw new SyntaxError('Invalid selector')
      return selector === '#overview' ? overview : selector === '.uv-chrome' ? header : null
    },
  }
  const module = { exports: {} }
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window,
    document,
    navigator: { hardwareConcurrency: 8, deviceMemory: 8 },
    require(name) { assert.fail(`Navigation must not import a scroll controller: ${name}`) },
  })
  return { ...module.exports, calls, overview, setReduced(value) { reduced = value } }
}

test('module startup preserves restored scroll and never takes scroll ownership', () => {
  const { calls } = setup({ scrollY: 2400 })
  assert.equal(calls.length, 0)
})

test('section selector resolves to its document position below the measured fixed header', () => {
  const { scrollToElement, calls } = setup()
  assert.equal(scrollToElement('#overview'), true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].top, 812)
  assert.equal(calls[0].behavior, 'smooth')
})

test('direct element navigation accepts an explicit additive offset, including zero', () => {
  const { scrollToElement, calls, overview } = setup()
  scrollToElement(overview, { offset: -24 })
  scrollToElement(overview, { offset: 0 })
  assert.deepEqual(calls.map(({ top }) => top), [876, 900])
})

test('forward navigation uses the stack marker before the next card reaches its resting position', () => {
  const { scrollToElement, calls, overview } = setup({ scrollY: 1400 })
  overview.getBoundingClientRect = () => ({ top: 900 })
  overview.previousElementSibling = {
    classList: { contains: (name) => name === 'st-stack-anchor' },
    getBoundingClientRect: () => ({ top: 800 }),
  }

  scrollToElement('#overview')
  assert.equal(calls[0].top, 2112)
  assert.equal(calls[0].behavior, 'smooth')
})

test('backward navigation returns to a covered card instead of its stuck viewport position', () => {
  const { scrollToElement, calls, overview } = setup({ scrollY: 3800 })
  overview.getBoundingClientRect = () => ({ top: 88 })
  overview.previousElementSibling = {
    classList: { contains: (name) => name === 'st-stack-anchor' },
    getBoundingClientRect: () => ({ top: -2100 }),
  }

  scrollToElement(overview)
  assert.equal(calls[0].top, 1612)
})

test('stack navigation preserves explicit offsets and live reduced-motion preferences', () => {
  const { scrollToElement, calls, overview, setReduced } = setup({ scrollY: 2400 })
  overview.getBoundingClientRect = () => ({ top: 88 })
  overview.previousElementSibling = {
    classList: { contains: (name) => name === 'st-stack-anchor' },
    getBoundingClientRect: () => ({ top: -1000 }),
  }

  setReduced(true)
  scrollToElement(overview, { offset: 0 })
  setReduced(false)
  scrollToElement('#overview', { offset: -24 })
  assert.deepEqual(calls.map(({ top }) => top), [1400, 1376])
  assert.deepEqual(calls.map(({ behavior }) => behavior), ['instant', 'smooth'])
})

test('ordinary preceding siblings do not change a section destination', () => {
  const { scrollToElement, calls, overview } = setup()
  overview.previousElementSibling = {
    classList: { contains: () => false },
    getBoundingClientRect: () => ({ top: -200 }),
  }

  scrollToElement('#overview')
  assert.equal(calls[0].top, 812)
})

test('header clearance stays bounded in a short viewport and when the header is absent', () => {
  const small = setup({ innerHeight: 400, headerBottom: 300 })
  small.scrollToElement('#overview')
  assert.equal(small.calls[0].top, 820)

  const tall = setup({ headerBottom: 300 })
  tall.scrollToElement('#overview')
  assert.equal(tall.calls[0].top, 788)

  const noHeader = setup({ headerBottom: null })
  noHeader.scrollToElement('#overview')
  assert.equal(noHeader.calls[0].top, 816)
})

test('navigation clamps positions to the scrollable document', () => {
  const { scrollToElement, calls } = setup({ scrollY: 0, documentHeight: 1500 })
  scrollToElement({ getBoundingClientRect: () => ({ top: -200 }) })
  scrollToElement({ getBoundingClientRect: () => ({ top: 4000 }) })
  assert.deepEqual(calls.map(({ top }) => top), [0, 600])
})

test('reduced motion is honored at every navigation, including preference changes', () => {
  const { scrollToElement, calls, setReduced } = setup()
  setReduced(true)
  scrollToElement('#overview')
  setReduced(false)
  scrollToElement('#overview')
  assert.deepEqual(calls.map(({ behavior }) => behavior), ['instant', 'smooth'])
})

test('missing, malformed and invalid destinations leave the current scroll untouched', () => {
  const { scrollToElement, calls } = setup()
  for (const target of ['#missing', '[', null, undefined, {}]) {
    assert.equal(scrollToElement(target), false)
  }
  assert.equal(calls.length, 0)
})

test('render quality still caps pixel density for the retained particle hero', () => {
  const { detectQuality, setReduced } = setup()
  const quality = detectQuality()
  assert.equal(quality.quality, 'high')
  assert.equal(quality.dpr, 2)
  assert.equal(quality.reduced, false)
  setReduced(true)
  assert.equal(detectQuality().reduced, true)
})
