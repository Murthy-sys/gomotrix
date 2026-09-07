// Narrative copy, one beat per scene.
//
// All typography lives in the DOM rather than in the WebGL canvas: it stays
// razor-sharp at any DPI, it is selectable, screen readers can reach it, and
// crawlers can index it. Only the world is rendered in 3D.
//
// `at` is the point within the scene's scroll range where the text is fully
// present; it fades in before and out after.
//
// Positioning note: the words carry the business story (idea or workflow →
// software → automation → AI where it earns its place); the world carries the
// demonstration. Neither duplicates the other, and the copy stays short enough
// that it never covers the thing it is describing.
//
// The opening beat names both entry points — an idea to build, a process to
// fix — because it is the only copy a bouncing visitor reads.

export const BEATS = [
  {
    scene: 'spark',
    at: 0.62,
    kicker: 'Product & Workflow Engineering',
    title: 'Turn an idea —\nor a broken process —\ninto working software.',
    body: 'One engineer building the web and mobile products businesses run on. Bring an idea that needs building, or an operation that still runs by hand — remote, worldwide, from first scope to shipped release.',
    meta: 'Idea To First Release · Web & Mobile Applications · Workflow Automation · AI On Request',
    // Primary flies the camera to the contact scene rather than leaving the
    // world — the CTA is part of the journey, not an exit from it.
    cta: { label: 'Discuss Your Project', to: 0.94 },
    secondary: { label: 'Explore Our Work', to: 0.71 },
    align: 'center',
  },
  {
    scene: 'ecosystem',
    at: 0.5,
    kicker: 'The Ecosystem',
    title: 'One core.\nFour disciplines.',
    body: 'Platforms, mobile, AI agents and automation built on one connected foundation — so a process stops living in six disconnected tools. Select one to travel into it.',
    align: 'left',
  },
  {
    scene: 'web',
    at: 0.5,
    kicker: '01 — Business Platforms',
    title: 'Software shaped\naround your process.',
    body: 'Operational portals, internal platforms and dashboards designed around how your business actually runs — not around a template.',
    steps: ['Idea', 'Research', 'Wireframe', 'Design', 'Development', 'Deployment'],
    align: 'left',
  },
  {
    scene: 'mobile',
    at: 0.5,
    kicker: '02 — Mobile Apps',
    title: 'The workflow,\nin their hand.',
    body: 'iOS and Android products for field teams, customers and operations — native quality on both platforms.',
    steps: ['Splash', 'Login', 'Dashboard', 'Booking', 'Payments', 'Analytics'],
    align: 'right',
  },
  {
    scene: 'agents',
    at: 0.5,
    kicker: '03 — AI Agents',
    title: 'Intelligence\nthat does the work.',
    body: 'Not chatbots that answer questions — agents that retrieve information, reason over your business data and complete defined tasks. Select one.',
    align: 'left',
  },
  {
    scene: 'showcase',
    at: 0.45,
    kicker: 'Selected Work',
    title: 'Shipped,\nnot mocked up.',
    body: 'Live products on the web, the App Store and Google Play. Open one for the full case study.',
    align: 'left',
  },
  {
    scene: 'tech',
    at: 0.42,
    kicker: 'Engineering Capability',
    title: 'Proven tools.\nNo experiments.',
    body: 'The stack we actually ship and support in production — not whatever is trending this quarter. Hover any mark.',
    align: 'left',
  },
]
