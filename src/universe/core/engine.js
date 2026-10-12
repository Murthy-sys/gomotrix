/** Detect what this machine can actually afford to render. */
export function detectQuality() {
  if (typeof window === 'undefined') return { quality: 'high', dpr: 1.5, reduced: false }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4

  let quality = 'high'
  if (mobile || cores <= 4 || mem <= 4) quality = 'medium'
  if ((mobile && cores <= 4) || cores <= 2 || mem <= 2) quality = 'low'

  // Cap the drawing buffer on high-density displays to limit GPU work.
  const cap = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1.25
  const dpr = Math.min(window.devicePixelRatio || 1, cap)

  return { quality, dpr, reduced, mobile }
}

/** Native document navigation. Negative offsets leave room above a section. */
export function scrollToElement(target, { offset } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false

  let element = target
  if (typeof target === 'string') {
    try {
      element = document.querySelector(target)
    } catch {
      return false
    }
  }
  if (!element || typeof element.getBoundingClientRect !== 'function') return false

  // A stacked card can already be stuck behind the current card. Its marker
  // keeps the original document position available for navigation in either direction.
  const marker = element.previousElementSibling
  const destinationElement = marker?.classList?.contains('st-stack-anchor') ? marker : element
  const header = document.querySelector('.uv-chrome')?.getBoundingClientRect()
  const headerBottom = header ? Math.max(0, header.bottom ?? header.height) : 72
  const clearance = Math.min(headerBottom + 12, 112, window.innerHeight * 0.2)
  const adjustedOffset = Number.isFinite(offset) ? offset : -clearance
  const documentHeight = document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight
  const maximumScroll = Math.max(0, documentHeight - window.innerHeight)
  const destination = destinationElement.getBoundingClientRect().top + window.scrollY + adjustedOffset

  window.scrollTo({
    top: Math.min(maximumScroll, Math.max(0, destination)),
    // Read this at interaction time so a preference change takes effect immediately.
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
  return true
}
