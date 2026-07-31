// Narrative copy, one beat per scene.
//
// All typography lives in the DOM rather than in the WebGL canvas: it stays
// razor-sharp at any DPI, it is selectable, screen readers can reach it, and
// crawlers can index it. Only the world is rendered in 3D.
//
// `at` is the point within the scene's scroll range where the text is fully
// present; it fades in before and out after.

export const BEATS = [
  {
    scene: 'spark',
    at: 0.62,
    kicker: 'Trimugo',
    title: 'Ideas Become\nIntelligent Products',
    body: 'We build AI-powered Web, Mobile, Enterprise and Automation platforms.',
    cta: { label: 'Explore Our Universe', to: 0.115 },
    align: 'center',
  },
  {
    scene: 'ecosystem',
    at: 0.5,
    kicker: 'The Ecosystem',
    title: 'One core.\nFour disciplines.',
    body: 'Every capability orbits the same intelligence. Choose one to travel into it.',
    align: 'left',
  },
  {
    scene: 'web',
    at: 0.5,
    kicker: '01 — Web Platforms',
    title: 'Watch it\nbuild itself.',
    body: 'Business sites, enterprise portals and dashboards — from idea to deployment.',
    steps: ['Idea', 'Research', 'Wireframe', 'Design', 'Development', 'Deployment'],
    align: 'left',
  },
  {
    scene: 'mobile',
    at: 0.5,
    kicker: '02 — Mobile Apps',
    title: 'Native quality.\nBoth platforms.',
    body: 'iOS and Android products people actually keep on their home screen.',
    steps: ['Splash', 'Login', 'Dashboard', 'Booking', 'Payments', 'Analytics'],
    align: 'right',
  },
  {
    scene: 'agents',
    at: 0.5,
    kicker: '03 — AI Agents',
    title: 'Intelligence\nthat does the work.',
    body: 'Not chatbots that answer questions — agents that complete tasks. Select one.',
    align: 'left',
  },
  {
    scene: 'showcase',
    at: 0.45,
    kicker: 'Selected Work',
    title: 'Shipped,\nnot mocked up.',
    body: 'Live products on the web, the App Store and Google Play. Open one.',
    align: 'left',
  },
  {
    scene: 'tech',
    at: 0.42,
    kicker: 'The Stack',
    title: 'Proven tools.\nNo experiments.',
    body: 'The stack we actually ship with — not whatever is trending. Hover any mark.',
    align: 'left',
  },
]
