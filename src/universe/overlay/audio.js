// The soundtrack: Eliho — "Elevated Perspective".
//
// Loaded lazily and only ever started from a user gesture, because every browser
// blocks autoplay with sound. The 5 MB file is never fetched for visitors who
// enter silently or who never reach the toggle.

// An 8-second loop cut from the track, not the full 5 MB file: at 127 KB it
// starts instantly and costs nothing on mobile data. Trimmed with short fades
// at both ends so the seam doesn't click.
const SRC = '/ambient-loop.mp3'
const TARGET_VOLUME = 0.42
const FADE_MS = 2600

let el = null
let fadeTimer = null
let playing = false
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn(playing))
}

/** Subscribe to play/pause changes so UI can stay in sync. */
export function onChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function isPlaying() {
  return playing
}

function ensure() {
  if (el) return el
  el = new Audio()
  el.src = SRC
  el.loop = true
  el.preload = 'auto'
  el.volume = 0
  // Browsers pause media when a tab is hidden; keep our flag honest.
  if (import.meta.env.DEV) window.__uvAudioEl = el
  el.addEventListener('pause', () => {
    if (playing && !el.ended) {
      playing = false
      notify()
    }
  })
  return el
}

/** Ramp volume without Web Audio — a simple interval keeps this dependency-free. */
function fadeTo(target, ms, done) {
  clearInterval(fadeTimer)
  const from = el.volume
  const start = performance.now()
  fadeTimer = setInterval(() => {
    const k = Math.min(1, (performance.now() - start) / ms)
    // Perceptual-ish curve: linear gain ramps sound abrupt at the quiet end.
    el.volume = Math.max(0, Math.min(1, from + (target - from) * (k * k)))
    if (k >= 1) {
      clearInterval(fadeTimer)
      done?.()
    }
  }, 40)
}

/** Must be called from a user gesture (the Enter button or the sound toggle). */
export async function start() {
  if (playing) return true
  const a = ensure()
  try {
    a.volume = 0
    await a.play()
    playing = true
    notify()
    fadeTo(TARGET_VOLUME, FADE_MS)
    return true
  } catch {
    // Autoplay refused — leave the UI showing "muted" so the user can retry.
    playing = false
    notify()
    return false
  }
}

export function stop() {
  if (!el || !playing) return
  playing = false
  notify()
  fadeTo(0, 600, () => el.pause())
}

export function toggle() {
  if (playing) {
    stop()
    return false
  }
  start()
  // Optimistic: `start` resolves async, and subscribers get the truth via notify.
  return true
}

/** Duck the music while something else needs attention (e.g. a modal). */
export function duck(on) {
  if (!el || !playing) return
  fadeTo(on ? TARGET_VOLUME * 0.25 : TARGET_VOLUME, 500)
}
