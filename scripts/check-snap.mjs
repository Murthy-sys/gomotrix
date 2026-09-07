// ─────────────────────────────────────────────────────────────────────────────
// Section snapping — contract validation.
//
// The thing the reader asked for is a guarantee, not a feel: one gesture moves
// exactly one scene, and never two. That is arithmetic over the stop table, so
// it can be proved here rather than eyeballed in a browser — which matters,
// because the failure mode (a flick that skips a scene) is intermittent by
// nature and easy to miss by hand.
//
// Run after changing SCENES, REST_AT, or the beat `at` values in copy.js.
// ─────────────────────────────────────────────────────────────────────────────
import { STOPS, EPS, STORY, resolveStop, nearestStop } from '../src/universe/core/stops.js'
import { SCENES } from '../src/universe/core/world.js'
import { BEATS } from '../src/universe/overlay/copy.js'

const MAX = 8100 // a 900px viewport × the 1000vh spacer — the shape, not the value
const px = STOPS.map((p) => p * MAX)

let failed = 0
const ok = (cond, msg) => {
  if (!cond) {
    failed++
    console.log(`  FAIL  ${msg}`)
  }
  return cond
}

console.log(`\nStops (progress → px @ ${MAX}px journey):`)
SCENES.forEach((s, i) => {
  console.log(
    `  ${String(i).padStart(2)}  ${s.id.padEnd(10)} ${STOPS[i].toFixed(4)}  ${String(Math.round(px[i])).padStart(5)}px`,
  )
})

// ── 1. The table itself ─────────────────────────────────────────────────────
console.log('\n1 · stop table')
ok(STOPS.length === SCENES.length, 'one stop per scene')
for (let i = 0; i < STOPS.length; i++) {
  ok(STOPS[i] > (STOPS[i - 1] ?? -1), `stop ${i} is after stop ${i - 1}`)
  ok(STOPS[i] >= 0 && STOPS[i] <= 1, `stop ${i} inside 0..1`)
  ok(
    STOPS[i] >= SCENES[i].start && STOPS[i] <= SCENES[i].end,
    `stop ${i} sits inside scene "${SCENES[i].id}" (${SCENES[i].start}..${SCENES[i].end})`,
  )
}
// Two stops closer together than the epsilon would be unreachable.
for (let i = 1; i < px.length; i++) {
  ok(px[i] - px[i - 1] > EPS * 4, `stops ${i - 1}→${i} are far enough apart to be distinct`)
}

// ── 2. A stop is where the scene's headline is composed ─────────────────────
// The whole point of parking here rather than at a scene's midpoint.
console.log('\n2 · stops land on their beat')
for (const b of BEATS) {
  const i = SCENES.findIndex((s) => s.id === b.scene)
  const centre = SCENES[i].start + (SCENES[i].end - SCENES[i].start) * b.at
  ok(Math.abs(STOPS[i] - centre) < 1e-9, `"${b.scene}" parks on its beat centre (${centre.toFixed(4)})`)
}

// ── 3. One gesture, one scene — from a stop ─────────────────────────────────
console.log('\n3 · stepping from a stop never skips')
for (let i = 0; i < px.length; i++) {
  const down = resolveStop(px[i], 1, px)
  const up = resolveStop(px[i], -1, px)
  if (i < px.length - 1) ok(down === i + 1, `from stop ${i}, down → ${i + 1} (got ${down})`)
  else ok(down === STORY, `from the last stop, down hands off to the story (got ${down})`)
  ok(up === Math.max(0, i - 1), `from stop ${i}, up → ${Math.max(0, i - 1)} (got ${up})`)
}

// ── 4. One gesture, one scene — from anywhere at all ────────────────────────
// A dragged scrollbar or a resize can leave the reader between stops. Sweep
// every pixel of the journey and assert no gesture ever moves more than one
// stop away from where it started.
console.log('\n4 · stepping from between stops never skips')
let worstDown = 0
let worstUp = 0
for (let y = 0; y <= MAX; y += 7) {
  const start = nearestStop(y, px)

  const down = resolveStop(y, 1, px)
  if (down !== STORY) {
    ok(down > start - 1, `y=${y}: a downward gesture never goes backwards`)
    worstDown = Math.max(worstDown, down - start)
  }

  const up = resolveStop(y, -1, px)
  ok(up < start + 1, `y=${y}: an upward gesture never goes forwards`)
  worstUp = Math.max(worstUp, start - up)
}
ok(worstDown <= 1, `a downward gesture moves at most one stop (worst: ${worstDown})`)
ok(worstUp <= 1, `an upward gesture moves at most one stop (worst: ${worstUp})`)

// ── 5. The ends ─────────────────────────────────────────────────────────────
console.log('\n5 · boundaries')
ok(resolveStop(0, -1, px) === 0, 'above the first stop, up clamps to the first stop')
ok(resolveStop(px[0], -1, px) === 0, 'at the first stop, up stays put')
ok(resolveStop(MAX, 1, px) === STORY, 'at the very end, down hands off to the story')
ok(
  resolveStop(px[px.length - 1], 1, px) === STORY,
  'at the last stop, down hands off to the story',
)

// The regression this file was written for. A position just outside the "you
// are parked here" epsilon used to satisfy neither branch of the old single-
// expression resolver, and a downward gesture skipped the scene it was sitting
// under. Sweep the whole one-to-three-epsilon window below every stop.
console.log('\n6 · the sub-epsilon window below a stop')
for (let i = 0; i < px.length; i++) {
  for (let d = EPS + 1; d <= EPS * 3; d++) {
    const got = resolveStop(px[i] - d, 1, px)
    ok(got === i, `${d}px below stop ${i}, down lands on stop ${i} (got ${got})`)
  }
}

console.log(
  failed
    ? `\n${failed} check(s) FAILED\n`
    : '\nAll snapping checks clear — one gesture is exactly one scene.\n',
)
process.exit(failed ? 1 : 0)
