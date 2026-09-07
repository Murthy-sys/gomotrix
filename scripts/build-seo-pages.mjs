// ─────────────────────────────────────────────────────────────────────────────
// STATIC PAGE GENERATION
//
// The journey is one URL, and one URL ranks for one cluster of intent. This
// emits the rest of the site as REAL static HTML files — dist/<slug>/index.html
// — so every service and every shipped project is its own indexable page with
// its own title, description, canonical and structured data.
//
// Why static files rather than client routes: no host rewrite rule is needed
// and no JavaScript has to run for the content to exist. A crawler gets the
// full page on the first pass, on any host, which is the entire point.
//
// Every fact below is read from src/data — the same source the site renders
// from — so a page cannot drift from what the site says. The repo rule applies
// here as it does in business.js: nothing invented. No metrics, no client
// names, no claims that are not already true somewhere in the data.
//
// Runs as part of `npm run build`. Validated by `npm run check:seo`.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const out = path.join(root, 'dist')
const ORIGIN = 'https://www.trimugo.in'

const { projects } = await import(`${root}/src/data/content.js`)
const { capabilities, process: steps, faq, caseStudies } = await import(`${root}/src/data/business.js`)

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// ── Shared chrome ───────────────────────────────────────────────────────────

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#050505;color:#f2f2f2;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:#b7ff6a}
.wrap{max-width:46rem;margin:0 auto;padding:clamp(2rem,6vw,4.5rem) clamp(1.2rem,5vw,2rem) 5rem}
header.bar{display:flex;align-items:baseline;gap:.9rem;flex-wrap:wrap;padding-bottom:2.4rem;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:2.8rem}
header.bar strong{font-size:1.05rem;letter-spacing:-.01em}
header.bar em{font-style:normal;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:#8a8a8a}
nav.crumbs{font-size:.78rem;color:#8a8a8a;margin:0 0 1.6rem}
nav.crumbs a{color:#8a8a8a}
h1{font-size:clamp(1.9rem,4.6vw,2.9rem);line-height:1.12;font-weight:500;letter-spacing:-.025em;margin:0 0 1.2rem}
h2{font-size:clamp(1.15rem,2.4vw,1.45rem);font-weight:500;letter-spacing:-.02em;margin:2.8rem 0 .9rem}
h3{font-size:1rem;font-weight:500;margin:1.8rem 0 .5rem}
p,li{color:#a8a8a8}
.lead{font-size:1.06rem;color:#cfcfcf}
ul{padding-left:1.1rem}
li{margin:.35rem 0}
.chips{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:.4rem;margin:.8rem 0 0}
.chips li{margin:0;font-size:.76rem;color:#cfcfcf;border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:.28rem .7rem}
.facts{border-top:1px solid rgba(255,255,255,.1);margin-top:2rem;padding-top:1.2rem;font-size:.9rem}
.facts div{display:flex;gap:1rem;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.facts dt{color:#8a8a8a;min-width:9rem;margin:0}
.facts dd{margin:0;color:#e4e4e4}
.cta{margin-top:3rem;padding:1.6rem;border:1px solid rgba(183,255,106,.22);border-radius:14px;background:rgba(183,255,106,.04)}
.cta p{margin:0 0 .6rem;color:#cfcfcf}
footer{margin-top:4rem;padding-top:1.6rem;border-top:1px solid rgba(255,255,255,.1);font-size:.85rem;color:#8a8a8a}
footer a{margin-right:.9rem;display:inline-block}
`.trim()

function layout({ url, title, description, h1, crumbs, body, schema }) {
  const canonical = `${ORIGIN}${url}`
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: `${ORIGIN}${c.url}`,
      })),
    },
    ...schema,
  ]

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="author" content="Malisetti Obulamurthy" />
<meta name="theme-color" content="#050505" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Trimugo" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${ORIGIN}/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${ORIGIN}/og-image.png" />
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<div class="wrap">
<header class="bar"><strong>Trimugo</strong><em>Smart Solutions</em></header>
<nav class="crumbs">${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? esc(c.name) : `<a href="${c.url}">${esc(c.name)}</a>`))
    .join(' &rsaquo; ')}</nav>
<h1>${esc(h1)}</h1>
${body}
<div class="cta">
<p>Trimugo is one engineer — Malisetti Obulamurthy. You talk to the person who writes the code.</p>
<p><a href="mailto:murthy@trimugo.in">murthy@trimugo.in</a> &nbsp;·&nbsp; <a href="tel:+918500098088">+91 85000 98088</a> &nbsp;·&nbsp; <a href="/">See the full journey and case studies</a></p>
</div>
<footer>
<a href="/">Home</a><a href="/work/">Selected work</a><a href="/hire-freelance-react-developer/">Freelance developer</a><a href="/contract-developer-for-hire/">Contract developer</a><a href="/ai-agents-document-automation/">AI solutions</a><a href="/#/privacy">Privacy</a>
</footer>
</div>
</body>
</html>
`
}

const capList = capabilities
  .map((c) => `<h3>${esc(c.group)}</h3><ul class="chips">${c.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`)
  .join('')

const processList = steps
  .map((s) => `<li><strong style="color:#e4e4e4">${esc(s.title)}.</strong> ${esc(s.body)}</li>`)
  .join('')

const pickFaq = (needles) =>
  faq
    .filter((f) => needles.some((n) => f.q.toLowerCase().includes(n)))
    .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
    .join('')

const faqSchema = (needles) => {
  const picked = faq.filter((f) => needles.some((n) => f.q.toLowerCase().includes(n)))
  if (!picked.length) return []
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: picked.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]
}

const service = (name, description) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  serviceType: name,
  provider: { '@type': 'ProfessionalService', '@id': `${ORIGIN}/#organization`, name: 'Trimugo' },
  areaServed: ['Worldwide', 'Europe', 'United Kingdom', 'United States', 'India', 'Asia Pacific'],
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: ORIGIN,
    servicePhone: '+91-85000-98088',
  },
})

// ── The service pages ───────────────────────────────────────────────────────

const SERVICE_PAGES = [
  {
    url: '/hire-freelance-react-developer/',
    title: 'Hire a Freelance React, Vue & React Native Developer — Trimugo',
    description:
      'Freelance React, Vue and React Native developer for hire, remote and worldwide. Eight years of production web and mobile delivery, four hours a day, USD 15–18/hour, billed hourly or against milestones. You work with the engineer who writes the code.',
    h1: 'Hire a freelance React, Vue and React Native developer',
    crumbs: [
      { name: 'Trimugo', url: '/' },
      { name: 'Freelance developer', url: '/hire-freelance-react-developer/' },
    ],
    schema: [
      service(
        'Freelance Front-End and Mobile Development',
        'Freelance React, Vue and React Native development for web and mobile products, engaged project by project against defined milestones.',
      ),
      ...faqSchema(['freelance developer', 'idea but no technical', 'who actually does']),
    ],
    body: `
<p class="lead">One named engineer, engaged directly. No agency margin, no account manager, and no relay between you and the person writing the code.</p>

<p>Trimugo is the practice of Malisetti Obulamurthy — eight years building production web and mobile applications in React, Vue and React Native, integrated against the APIs and services behind them. A freelance engagement here means the person you scope the project with is the person who designs the system, writes the code, ships the release and answers the message afterwards.</p>

<h2>What a freelance engagement covers</h2>
<p>Discovery, architecture, implementation and delivery, as one continuous piece of work rather than a handover between roles:</p>
<ul>
  <li>React, Vue and TypeScript interfaces — operational portals, internal platforms and dashboards built around a real workflow rather than a template</li>
  <li>React Native applications, shipped through App Store and Google Play review and maintained afterwards</li>
  <li>API integration, application state and data flow across web and mobile clients</li>
  <li>Node.js and PostgreSQL services where the product needs a backend of its own</li>
  <li>Continued development and maintenance after launch, rather than a repository handover</li>
</ul>

<h2>Two ways a project starts</h2>
<p><strong style="color:#e4e4e4">You have an idea.</strong> A product you can describe but cannot build, with no engineering team to hand it to. It is taken from the first conversation to a live release — scope, architecture, build, launch — as a freelance engagement rather than a hire. The first release is built as the first increment of the real system, so it survives if the idea works.</p>
<p><strong style="color:#e4e4e4">You have a process.</strong> Work that already happens every week, held together by email, spreadsheets and people re-typing the same values into three systems. That becomes a connected workflow with state and ownership held by software instead of by a person.</p>

<h2>How the work runs</h2>
<ul>${processList}</ul>

<h2>Engagement terms, stated up front</h2>
<dl class="facts">
<div><dt>Availability</dt><dd>4 hours per day</dd></div>
<div><dt>Rate</dt><dd>USD 15–18 / hour</dd></div>
<div><dt>Engagement</dt><dd>Remote, part-time, milestone or hourly</dd></div>
<div><dt>Based in</dt><dd>Bangalore, India · works remotely, worldwide</dd></div>
<div><dt>Hours</dt><dd>Scheduled inside your working day — a full European day in CET/CEST, the US Eastern morning, or all of India and APAC</dd></div>
</dl>

<h2>What the stack actually is</h2>
<p>Only what is shipped and supported in production. Nothing here is aspirational.</p>
${capList}

<h2>Questions</h2>
${pickFaq(['freelance developer', 'idea but no technical', 'who actually does'])}

<h2>Work delivered</h2>
<p>Live products on the web, the App Store and Google Play — <a href="/work/">see the full list of shipped projects</a>, each with its stack and a link you can open.</p>
`,
  },

  {
    url: '/contract-developer-for-hire/',
    title: 'Contract Developer for Hire — Remote Front-End & Mobile | Trimugo',
    description:
      'Contract developer for hire, working inside your team, your repositories and your release process. Remote across Europe, the UK, the US and APAC, four hours a day, billed hourly or per milestone. No agency, no subcontracting.',
    h1: 'Contract developer for hire, inside your team',
    crumbs: [
      { name: 'Trimugo', url: '/' },
      { name: 'Contract developer', url: '/contract-developer-for-hire/' },
    ],
    schema: [
      service(
        'Contract Software Engineering',
        'Ongoing contract engineering inside an existing team — your repositories, your review standards, your release cadence.',
      ),
      ...faqSchema(['freelance developer', 'alongside our internal', 'existing software', 'crm or erp']),
    ],
    body: `
<p class="lead">An ongoing block of engineering hours inside your process — your repositories, your review standards, your release cadence — rather than a scope thrown over a wall.</p>

<p>A contract engagement differs from a project engagement in one way: the work is continuous and the direction is yours. You get an engineer in your stand-ups and your pull requests, not a vendor sending status reports. It is the same person either way, and there is no subcontracting behind the name.</p>

<h2>Where a contract engineer fits</h2>
<ul>
  <li><strong style="color:#e4e4e4">Extra front-end capacity</strong> on an existing React or Vue product, working to your conventions rather than importing new ones</li>
  <li><strong style="color:#e4e4e4">A mobile surface</strong> your team has not staffed — React Native, taken through both app stores</li>
  <li><strong style="color:#e4e4e4">Integration work</strong> against the CRM, ERP, databases and third-party APIs already in the estate, where the system exposes an API, a database connection or a supported export</li>
  <li><strong style="color:#e4e4e4">A workflow nobody owns</strong> — the manual coordination between two systems that consumes a person's week</li>
</ul>

<h2>How delivery is structured</h2>
<p>Remote, with the rhythm made explicit so progress is visible without turning into a meeting schedule:</p>
<ul>
  <li>Scope agreed and invoiced against defined milestones</li>
  <li>Working software demonstrated on a fixed cadence, not slides</li>
  <li>Architecture, integrations and operational runbooks written down</li>
  <li>Progress, blockers and estimates reported as they change</li>
  <li>Direct access to the engineer doing the work, with no intermediary</li>
</ul>

<h2>Timezones, stated honestly</h2>
<p>The daily block is four hours and it is scheduled inside one client's working day rather than split across three. From India (IST) that block reaches a full European day in CET/CEST, the US Eastern morning, and all of India and the wider APAC region; US Pacific works by arrangement. Stand-ups, reviews and calls run at your hours.</p>

<h2>The stack on offer</h2>
${capList}

<h2>Questions</h2>
${pickFaq(['freelance developer', 'alongside our internal', 'existing software', 'crm or erp'])}

<h2>Related</h2>
<p><a href="/hire-freelance-react-developer/">Freelance, project-based engagement</a> · <a href="/ai-agents-document-automation/">AI agents and document automation</a> · <a href="/work/">Shipped projects</a></p>
`,
  },

  {
    url: '/ai-agents-document-automation/',
    title: 'AI Solutions: Agents, RAG & Document Extraction — Trimugo',
    description:
      'AI solutions built into real workflows: agents that reason over your business data inside explicit boundaries, retrieval over your own documents, and extraction and classification of invoices, contracts and forms. Added where they earn their place, not by default.',
    h1: 'AI solutions, built where they earn their place',
    crumbs: [
      { name: 'Trimugo', url: '/' },
      { name: 'AI solutions', url: '/ai-agents-document-automation/' },
    ],
    schema: [
      service(
        'AI Agents and Document Intelligence',
        'AI agents, retrieval over business documents, and extraction and classification of invoices, contracts and forms, built into production workflows.',
      ),
      ...faqSchema(['ai solutions', 'ai company', 'ai workflow project']),
    ],
    body: `
<p class="lead">Three things, and only where they are the right answer: agents that reason over your business data inside explicit boundaries, retrieval over your own documents, and extraction and classification of invoices, contracts and forms.</p>

<p>Most of what gets sold as an AI solution is a workflow problem with a model bolted onto the front. The useful version is narrower and more honest: in a typical nine-stage pipeline — intake, understanding, extraction, validation, business rules, workflow, approval, action, reporting — seven stages are ordinary deterministic code, and they should stay that way. A model belongs at exactly the points where meaning has to be read out of something unstructured.</p>

<h2>Where a model genuinely helps</h2>
<ul>
  <li><strong style="color:#e4e4e4">Unstructured intake.</strong> A scanned invoice, a free-text request, a PDF contract. A structured form skips this entirely and should.</li>
  <li><strong style="color:#e4e4e4">Extraction and classification.</strong> Fields, entities and document type resolved into structured data that the rest of the system can validate in code.</li>
  <li><strong style="color:#e4e4e4">Retrieval over your own material.</strong> Answers grounded in your documents rather than in a model's memory.</li>
  <li><strong style="color:#e4e4e4">Agents with a defined job.</strong> Not a chatbot that answers questions — a component that retrieves information, reasons over business data and completes a defined task within stated boundaries.</li>
</ul>

<h2>Where it does not, and we will say so</h2>
<p>Totals, thresholds, routing rules and audit trails have to be exact, and exactness is what deterministic code is for. Putting a model in that path adds risk without adding capability. One of the systems written up on this site contains no AI at all, and that was the right call — the value there was in removing manual coordination, not in adding inference.</p>

<h2>How an AI project starts</h2>
<p>With a conversation about how the process runs today: who touches it, where it waits, and what the exceptions are. That is usually enough to identify whether AI, automation, integration or plain software is the right answer, and where the value actually sits. The boundary between the model and the deterministic parts is a decision made with you at design time, not a default that ships.</p>

<h2>Security and honesty about scope</h2>
<p>Systems are designed with security, privacy and applicable data-protection requirements in mind — authentication, authorisation, role-based access, audit logs, secure API integration, data validation and encryption where applicable. Trimugo holds no audited compliance certification and does not claim one; where a project carries a specific regulatory obligation it is scoped explicitly with you and your compliance advisors.</p>

<h2>The engineering underneath</h2>
${capList}

<h2>Questions</h2>
${pickFaq(['ai solutions', 'ai company', 'ai workflow project'])}

<h2>Related</h2>
<p><a href="/work/">Shipped projects</a> · <a href="/hire-freelance-react-developer/">Freelance engagement</a> · <a href="/contract-developer-for-hire/">Contract engagement</a></p>
`,
  },
]

// ── Project pages ───────────────────────────────────────────────────────────

const projectPages = projects.map((p) => {
  const s = slug(p.name)
  const url = `/work/${s}/`
  // business.js carries a full written case study for some projects. Where one
  // exists it is the page — real detail about a real system beats anything a
  // template can say. Where it does not, the page is a portfolio entry and says
  // only what is verifiably true; see MISSING_FROM_CLIENT in business.js.
  const cs = caseStudies.find((c) => c.id === s || c.name === p.name)
  const bullets = (title, items) =>
    items?.length
      ? `<h2>${esc(title)}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
      : ''
  const study = cs
    ? `
<h2>The problem</h2>
<p>${esc(cs.challenge)}</p>

<h2>What was built</h2>
<p>${esc(cs.solution)}</p>
${bullets('Engineering', cs.engineering)}
${bullets('What the system now handles by itself', cs.automation)}
${cs.aiNote ? `<h2>On AI in this build</h2><p>${esc(cs.aiNote)}</p>` : ''}
${bullets('Where it stands', cs.outcome)}
${cs.flow?.length ? `<h2>The flow, end to end</h2><ul class="chips">${cs.flow.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
`
    : ''
  const live = p.links?.live
  const links = [
    live && `<a href="${live}" rel="noopener">Open the live site</a>`,
    p.links?.playstore && `<a href="${p.links.playstore}" rel="noopener">Google Play</a>`,
    p.links?.appstore && `<a href="${p.links.appstore}" rel="noopener">App Store</a>`,
  ].filter(Boolean)

  return {
    url,
    title: `${p.name} — ${p.category} built by Trimugo`,
    description: `${p.desc} Built with ${p.tags.join(', ')}${live ? '. Live and open to view.' : '.'}`,
    h1: p.name,
    crumbs: [
      { name: 'Trimugo', url: '/' },
      { name: 'Selected work', url: '/work/' },
      { name: p.name, url },
    ],
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: p.name,
        description: p.desc,
        dateCreated: p.year,
        ...(live ? { url: live } : {}),
        keywords: p.tags.join(', '),
        creator: {
          '@type': 'ProfessionalService',
          '@id': `${ORIGIN}/#organization`,
          name: 'Trimugo',
        },
        author: { '@type': 'Person', name: 'Malisetti Obulamurthy' },
      },
    ],
    body: `
<p class="lead">${esc(p.desc)}</p>

<dl class="facts">
<div><dt>Category</dt><dd>${esc(p.category)}</dd></div>
<div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
<div><dt>Status</dt><dd>${esc(p.status || 'Delivered')}</dd></div>
<div><dt>Built by</dt><dd>Trimugo — Malisetti Obulamurthy</dd></div>
</dl>

<h2>Stack</h2>
<ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>

${links.length ? `<h2>See it</h2><p>${links.join(' &nbsp;·&nbsp; ')}</p>` : ''}
${study}
<h2>How it was built</h2>
<p>Designed, built and delivered by one engineer — discovery, architecture, implementation and release were the same person, with no handoff between roles and no subcontracting. ${
      live
        ? 'The link above goes to the running product rather than to a mockup or a case-study screenshot.'
        : 'This one is still in development; it is listed here because the work is real, not because it is finished.'
    }</p>

<h2>Work with the same engineer</h2>
<p><a href="/hire-freelance-react-developer/">Freelance engagement</a> · <a href="/contract-developer-for-hire/">Contract engagement</a> · <a href="/ai-agents-document-automation/">AI solutions</a></p>
`,
  }
})

// ── The work index ──────────────────────────────────────────────────────────

const workIndex = {
  url: '/work/',
  title: 'Selected Work — Shipped Web & Mobile Projects | Trimugo',
  description: `${projects.length} products designed and built by Trimugo — web applications, React Native apps on both stores and scroll-driven 3D sites. Every one links to something you can open.`,
  h1: 'Selected work',
  crumbs: [
    { name: 'Trimugo', url: '/' },
    { name: 'Selected work', url: '/work/' },
  ],
  schema: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Selected work by Trimugo',
      hasPart: projects.map((p) => ({
        '@type': 'CreativeWork',
        name: p.name,
        description: p.desc,
        url: `${ORIGIN}/work/${slug(p.name)}/`,
      })),
    },
  ],
  body: `
<p class="lead">Live products on the web, the App Store and Google Play. Every entry below links to something a visitor can actually open — a dead link here would be worse than an absent project.</p>
${projects
  .map(
    (p) => `<h2><a href="/work/${slug(p.name)}/">${esc(p.name)}</a></h2>
<p>${esc(p.desc)}</p>
<p style="font-size:.85rem;color:#8a8a8a">${esc(p.category)} · ${esc(p.year)}${p.status ? ` · ${esc(p.status)}` : ''} · ${p.tags.map(esc).join(', ')}</p>`,
  )
  .join('\n')}
`,
}

// ── Emit ────────────────────────────────────────────────────────────────────

const pages = [...SERVICE_PAGES, workIndex, ...projectPages]

if (!fs.existsSync(out)) {
  console.error('dist/ does not exist — run `vite build` first.')
  process.exit(1)
}

for (const p of pages) {
  const dir = path.join(out, p.url)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), layout(p))
}

// The sitemap is generated, not hand-maintained, so it can never fall behind
// the pages that actually exist.
const today = new Date().toISOString().slice(0, 10)
const urls = [{ url: '/', priority: '1.0', freq: 'weekly' }, ...pages.map((p) => ({ url: p.url, priority: '0.8', freq: 'monthly' }))]
fs.writeFileSync(
  path.join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/build-seo-pages.mjs. Do not edit by hand. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${ORIGIN}${u.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`,
)

console.log(`\nGenerated ${pages.length} static pages + sitemap:`)
for (const p of pages) console.log(`  ${p.url}`)
console.log()
