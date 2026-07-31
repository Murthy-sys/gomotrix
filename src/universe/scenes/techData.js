import {
  siReact,
  siNextdotjs,
  siTypescript,
  siNodedotjs,
  siPython,
  siPostgresql,
  siMongodb,
  siExpress,
  siDocker,
  siKubernetes,
  siTailwindcss,
  siVite,
  siFlutter,
  siFirebase,
  siGraphql,
} from 'simple-icons'

// The stack, shown as marks rather than words.
//
// Paths come from simple-icons so every logo is the official geometry, not a
// hand-traced approximation. Two notes on what is *not* here: AWS, Azure and
// OpenAI were removed from simple-icons over trademark policy, so there is no
// accurate mark to ship. Rather than draw wrong ones, this list is built from
// tooling that appears in Trimugo's own delivered projects.
//
// `hex` is each brand's real colour — used at low opacity for the idle tile and
// at full strength on hover, so the wall reads as brand-accurate on contact but
// stays inside the green palette at rest.

const rows = [
  ['React', siReact, 'UI'],
  ['Next.js', siNextdotjs, 'Framework'],
  ['TypeScript', siTypescript, 'Language'],
  ['Node.js', siNodedotjs, 'Runtime'],
  ['Python', siPython, 'Language'],
  ['PostgreSQL', siPostgresql, 'Database'],
  ['MongoDB', siMongodb, 'Database'],
  ['Express', siExpress, 'API'],
  ['GraphQL', siGraphql, 'API'],
  ['Docker', siDocker, 'Infra'],
  ['Kubernetes', siKubernetes, 'Infra'],
  ['Firebase', siFirebase, 'Platform'],
  ['Flutter', siFlutter, 'Mobile'],
  ['Tailwind CSS', siTailwindcss, 'Styling'],
  ['Vite', siVite, 'Build'],
]

export const TECH = rows.map(([name, icon, group], i) => ({
  name,
  group,
  path: icon.path,
  // Some marks are pure black (Next.js, Express) and would vanish on #050505.
  hex: /^0{6}$|^0a0a0a$/i.test(icon.hex) ? 'FFFFFF' : icon.hex,
  index: i,
}))

/**
 * Lays the marks out as a gently curved wall rather than a flat grid — the
 * camera arrives at an angle, and a curve keeps the far tiles facing the lens.
 */
export function techLayout(cols = 4) {
  const gapX = 3.15
  const gapY = 3.0
  const radius = 17 // curvature of the wall
  // Pushed right of centre: this scene's copy is left-aligned, and a centred
  // grid puts two columns straight through the headline.
  const shiftX = 5.2

  return TECH.map((t, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const rows_ = Math.ceil(TECH.length / cols)

    // Curvature is measured from the wall's own centre, not the world origin.
    // Using the shifted x bowed the whole grid away from the camera, so the
    // right-hand columns sat metres further back and rendered smaller.
    const cx = (col - (cols - 1) / 2) * gapX
    const x = cx + shiftX
    const y = ((rows_ - 1) / 2 - row) * gapY
    const z = -(cx * cx) / radius
    const yaw = cx / radius

    return { ...t, pos: [x, y, z], yaw }
  })
}
