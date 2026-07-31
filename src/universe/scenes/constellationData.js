import { industries, projects } from '../../data/content'

// The constellation is built from what Trimugo actually has: real delivered
// projects as the bright anchor stars, and the sectors it serves as the field
// around them. Nothing here is invented — no placeholder client logos.

const golden = Math.PI * (3 - Math.sqrt(5))

/** Deterministic layout: the sky must look identical on every visit. */
export function buildStars() {
  const stars = []

  // Anchors: real shipped work, placed on a wide inner ring.
  projects.forEach((p, i) => {
    const a = (i / projects.length) * Math.PI * 2 + 0.4
    stars.push({
      id: p.name,
      label: p.name,
      sub: p.category,
      bright: true,
      pos: [Math.cos(a) * 6.2, Math.sin(a) * 3.6 + 0.6, Math.sin(a * 1.7) * 3.4],
    })
  })

  // Field: sectors served, distributed on a fibonacci shell so the sky has no
  // visible clumping or seams.
  industries.forEach((ind, i) => {
    const y = 1 - (i / (industries.length - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const th = golden * i
    const rad = 11 + (i % 4) * 1.5
    stars.push({
      id: ind.name,
      label: ind.name,
      bright: false,
      pos: [Math.cos(th) * r * rad, y * rad * 0.6, Math.sin(th) * r * rad * 0.8],
    })
  })

  return stars
}

/**
 * Links every sector to its nearest anchor project, then chains the anchors
 * together. The result reads as a growing network rather than a starburst.
 */
export function buildLinks(stars) {
  const anchors = stars.filter((s) => s.bright)
  const field = stars.filter((s) => !s.bright)
  const links = []

  const d2 = (a, b) =>
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2

  field.forEach((f) => {
    let best = anchors[0]
    let bd = Infinity
    anchors.forEach((a) => {
      const d = d2(f.pos, a.pos)
      if (d < bd) { bd = d; best = a }
    })
    links.push([f, best])
  })

  anchors.forEach((a, i) => links.push([a, anchors[(i + 1) % anchors.length]]))

  return links
}
