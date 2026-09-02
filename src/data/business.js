// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS CONTENT
//
// Everything the story track below the journey renders. Positioning copy for
// a specific audience — European operations, engineering and founder-level
// buyers. content.js holds the shorter project record that the 3D gallery and
// the "also shipped" list read from; this file holds the argument.
//
// RULE FOR THIS FILE: nothing here may be invented. No percentages, no revenue,
// no user counts, no client names, no testimonials, no awards, no productivity
// claims. Where a fact is not verified, the field is simply absent and the UI
// renders without it — see MISSING_FROM_CLIENT at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

// ── 01 · The business problem ───────────────────────────────────────────────

export const problem = {
  kicker: 'Section 01 — The Problem',
  title: 'Still managing critical processes manually?',
  body: 'Most operational work does not fail because people are careless. It fails because the process lives in seven places at once, and every handoff is a person copying something from one of them into another.',
  // The "before" chain. Rendered as a descending sequence, one link per step,
  // because the shape of the list is the point: it is a queue, not a system.
  before: [
    { step: 'Email', note: 'The request arrives' },
    { step: 'Spreadsheet', note: 'Someone logs it by hand' },
    { step: 'PDF documents', note: 'Details are re-read and re-typed' },
    { step: 'Manual data entry', note: 'The same values, a third time' },
    { step: 'Review', note: 'Waiting on one person' },
    { step: 'Approval', note: 'Waiting on another' },
    { step: 'Follow-up', note: 'Chasing, by hand' },
    { step: 'Reporting', note: 'Rebuilt from scratch each month' },
  ],
  costs: [
    'Disconnected systems that never agree with each other',
    'Work that stops the moment one person is unavailable',
    'No audit trail when someone asks what happened',
    'Reporting that is out of date before it is finished',
  ],
  after: 'Trimugo turns fragmented processes into connected, intelligent workflows.',
}

// ── 02 · The AI + workflow pipeline ─────────────────────────────────────────

export const pipeline = {
  kicker: 'Section 02 — AI + Workflow',
  title: 'What replaces the queue.',
  body: 'One connected path from the moment work arrives to the moment it is done and recorded. AI does the reading and the judgement it is genuinely good at; deterministic software does everything that has to be exact.',
  // Each stage names what it does AND what kind of component does it, because
  // the technical reader is checking whether we understand the difference.
  stages: [
    { id: 'input', label: 'Business input', kind: 'Ingest', note: 'Email, upload, form, API or scan — the work arrives once.' },
    { id: 'understand', label: 'AI understanding', kind: 'Model', note: 'The document or request is read and interpreted in context.' },
    { id: 'extract', label: 'Extraction & classification', kind: 'Model', note: 'Fields, entities and document type resolved into structured data.' },
    { id: 'validate', label: 'Validation', kind: 'Deterministic', note: 'Types, totals, references and required fields checked in code.' },
    { id: 'rules', label: 'Business rules', kind: 'Deterministic', note: 'Your thresholds, exceptions and routing logic — explicit, testable.' },
    { id: 'workflow', label: 'Workflow', kind: 'Orchestration', note: 'State, ownership, queues and SLAs held by the system.' },
    { id: 'approval', label: 'Approval / automation', kind: 'Orchestration', note: 'Cleared automatically, or routed to the person who decides.' },
    { id: 'action', label: 'Human or system action', kind: 'Execution', note: 'Written to the ERP, CRM or database. Or handed to a person, with context.' },
    { id: 'reporting', label: 'Reporting', kind: 'Output', note: 'Every step already recorded — the report is a read, not a rebuild.' },
  ],
  note: 'AI is used where meaning has to be understood. Everything that must be exact stays deterministic — that boundary is a design decision we make with you, not a default.',
}

// ── 03 · What we build ──────────────────────────────────────────────────────

export const solutions = [
  {
    id: 'workflow-systems',
    n: '01',
    title: 'AI Workflow Systems',
    body: 'Custom workflow platforms that automate complex operational processes end to end — intake, routing, approval, execution and audit.',
  },
  {
    id: 'agents',
    n: '02',
    title: 'AI Agents',
    body: 'Agents that retrieve information, reason over your business data and assist or execute defined business tasks — with the boundaries of what they may do set explicitly.',
  },
  {
    id: 'document-intelligence',
    n: '03',
    title: 'Document Intelligence',
    body: 'AI-powered extraction, classification, validation and processing of invoices, contracts, forms and operational paperwork.',
  },
  {
    id: 'applications',
    n: '04',
    title: 'Business Applications',
    body: 'Custom web applications designed around a specific business workflow rather than around a generic template.',
  },
  {
    id: 'automation',
    n: '05',
    title: 'Process Automation',
    body: 'Automation of the repetitive operational tasks and manual coordination that currently consume a person’s week.',
  },
  {
    id: 'integration',
    n: '06',
    title: 'System Integration',
    body: 'Integration with the APIs, databases, CRM, ERP and third-party systems you already run — so the new workflow joins the estate instead of adding to it.',
  },
]

// ── 05 · How we work ────────────────────────────────────────────────────────

export const process = [
  { n: '01', title: 'Discover', body: 'Understand the business process as it actually runs today, and identify where it stalls.' },
  { n: '02', title: 'Design', body: 'Map the target workflow and define the product, the data model and the architecture.' },
  { n: '03', title: 'Build', body: 'Develop the application, the AI capability and the automation, in reviewable increments.' },
  { n: '04', title: 'Deploy', body: 'Integrate with your existing systems and put it into production.' },
  { n: '05', title: 'Improve', body: 'Maintain, monitor and continue developing the system after launch.' },
]

// ── 06 · Engineering capabilities ───────────────────────────────────────────
// Only what is genuinely shipped with. Cross-checked against the stacks
// listed on the delivered projects in content.js.

export const capabilities = [
  { group: 'Frontend', items: ['React', 'Vue', 'TypeScript'] },
  { group: 'Backend', items: ['Node.js', 'Python', 'APIs', 'Databases'] },
  {
    group: 'AI',
    items: [
      'LLM integrations',
      'RAG',
      'AI agents',
      'Document intelligence',
      'Prompt engineering',
      'AI-powered workflows',
    ],
  },
  { group: 'Mobile', items: ['React Native'] },
  {
    group: 'Infrastructure',
    items: ['Cloud deployment', 'Authentication', 'Authorization', 'Logging', 'Monitoring', 'CI/CD'],
  },
]

// ── 07 · Why Trimugo ────────────────────────────────────────────────────────

export const differentiators = [
  {
    title: 'Business-first engineering',
    body: 'We understand the workflow before choosing the technology. The architecture follows the process, not the other way round.',
  },
  {
    title: 'AI with purpose',
    body: 'We use AI where it creates meaningful business value, and deterministic software everywhere that has to be exact.',
  },
  {
    title: 'Custom-built systems',
    body: 'We build around your actual process — including the exceptions that a configurable product would force you to abandon.',
  },
  {
    title: 'Direct engineering communication',
    body: 'You talk to the engineer building the system. There is no account layer, no delivery manager and no relay between you and the work.',
  },
  {
    title: 'Long-term partnership',
    body: 'We can keep developing and supporting the system after launch, rather than handing over a repository and leaving.',
  },
]

// ── 08 · Team ───────────────────────────────────────────────────────────────

export const team = {
  line: 'One engineer. No handoffs.',
  body: 'Trimugo is run by a single full-stack engineer. The person on the first call is the person who designs the system, writes the code, ships the release and answers the message afterwards.',
  person: {
    name: 'Malisetti Obulamurthy',
    role: 'Founder · Full-Stack Engineer',
    body: 'Process discovery, architecture, implementation and delivery ownership — the web application, the mobile app, the API and the AI layer are all built by the same person.',
    // Named as disciplines rather than as job titles: this is what one person
    // covers, not four people pretending to be one.
    focus: [
      'Discovery, architecture and delivery ownership',
      'Application, API and data layer',
      'AI integration, retrieval and document extraction',
      'React and React Native interfaces',
    ],
    hours:
      'Working hours are flexible across Indian and European time — IST and CET/CEST — so a full European working day is covered, including your morning stand-up and your afternoon review.',
    // Rendered as brand marks, so `label` is what a screen reader announces and
    // what the tooltip shows — it is the accessible name, not decoration.
    //
    // TODO(trimugo): the LinkedIn href below is a *messaging thread* URL. It
    // only resolves for someone already in that conversation; every other
    // visitor lands in their own inbox. Replace it with the public profile
    // (linkedin.com/in/…) before this goes out.
    links: [
      { id: 'github', label: 'GitHub', href: 'https://github.com/Murthy-sys?tab=repositories' },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/messaging/thread/2-ZDdiN2JlN2YtNjVjOC00MTc0LWI4YTMtM2EyNjE1MTA5MDM5XzEwMA==/',
      },
    ],
  },
}

// ── 09 · Security & privacy ─────────────────────────────────────────────────
// Deliberately worded as design practice, not certification. Trimugo holds no
// audited compliance certification, and this section must never imply one.

export const security = {
  statement:
    'We design systems with security, privacy and applicable data-protection requirements in mind.',
  practices: [
    'Authentication',
    'Authorization',
    'Role-based access',
    'Audit logs',
    'Secure API integration',
    'Data validation',
    'Encryption where applicable',
    'Logging',
    'Monitoring',
    'Cloud deployment',
  ],
  caveat:
    'Where a project carries a specific regulatory obligation, we scope it explicitly with you and involve your compliance advisors — we do not claim certification we do not hold.',
}

// ── 10 · European delivery ──────────────────────────────────────────────────

export const delivery = {
  line: 'Remote delivery. Structured communication. Direct engineering access.',
  body: 'We work with European companies remotely, on a rhythm that makes progress visible without turning into a meeting schedule.',
  points: [
    {
      title: 'European working hours',
      body: 'Available across Indian and European time — IST and CET/CEST. A full European working day is covered, so stand-ups, reviews and calls run at your hours, not ours.',
    },
    { title: 'Milestone-based delivery', body: 'Scope agreed and invoiced against defined milestones.' },
    { title: 'Regular demos', body: 'Working software shown on a fixed cadence, not slides.' },
    { title: 'Documentation', body: 'Architecture, integrations and operational runbooks written down.' },
    { title: 'Transparent communication', body: 'Progress, blockers and estimates reported as they change.' },
    { title: 'Direct engineering access', body: 'You talk to the engineer doing the work, with no intermediary.' },
    { title: 'Post-launch support', body: 'Maintenance and continued development after go-live.' },
  ],
}

// ── 11 · FAQ ────────────────────────────────────────────────────────────────

export const faq = [
  {
    q: 'Can you work with our existing software?',
    a: 'Yes. Most of what we build joins an existing estate rather than replacing it — we integrate with the systems you already run and only replace what is genuinely holding the process back.',
  },
  {
    q: 'Can you integrate with our CRM or ERP?',
    a: 'Yes, where the system exposes an API, a database connection or a supported export. We scope the integration surface during discovery so the constraints are known before the build starts.',
  },
  {
    q: 'Can you work alongside our internal development team?',
    a: 'Yes. We work as an engineering partner inside your process — your repositories, your review standards, your release cadence — or take a scope end to end, whichever fits.',
  },
  {
    q: 'Who actually does the work?',
    a: 'Malisetti Obulamurthy — the founder and engineer behind Trimugo. There is no team behind the name and no subcontracting: the person you scope the project with is the person who writes the code, ships the release and supports it afterwards.',
  },
  {
    q: 'What hours do you work, and how does that overlap with Europe?',
    a: 'Working hours are flexible across Indian and European time — IST and CET/CEST. A full European working day is covered, so stand-ups, reviews and calls run at your hours rather than at the edge of them.',
  },
  {
    q: 'Do you build MVPs or production systems?',
    a: 'Both, but we build MVPs as the first increment of a production system rather than as a throwaway. The architecture is chosen so the prototype can survive if it succeeds.',
  },
  {
    q: 'Can you maintain the software after launch?',
    a: 'Yes. Maintenance, monitoring and continued development after go-live are part of what we offer, on an ongoing arrangement.',
  },
  {
    q: 'How does an AI workflow project start?',
    a: 'With a conversation about how the process runs today — who touches it, where it waits, and what the exceptions are. That is usually enough to identify whether AI, automation, integration or plain software is the right answer, and where the value actually sits.',
  },
  {
    q: 'Can you work remotely with European companies?',
    a: 'Yes. Delivery is remote and structured around milestones, scheduled demos and written documentation, with direct access to the engineer doing the work.',
  },
]

// ── Contact ─────────────────────────────────────────────────────────────────

export const buildOptions = [
  'Automate an existing workflow',
  'Build an AI-powered application',
  'Build an AI agent',
  'Build a business platform',
  'Integrate existing systems',
  'Other',
]

export const timelines = ['As soon as possible', 'Within 1–3 months', 'Within 3–6 months', 'Exploring / no fixed date']

export const contactChannels = [
  {
    label: 'Email',
    value: 'trimugoitsolutions@gmail.com',
    href: 'mailto:trimugoitsolutions@gmail.com',
  },
  { label: 'Phone', value: '+91 85000 98088', href: 'tel:+918500098088' },
  { label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/918500098088' },
]

// ── 04 · Selected work · case studies ───────────────────────────────────────
//
// One real system, written up as a case study. Every claim below is derived
// from the delivered product itself — the platforms it runs on, the stack it
// was built with, and what it does. Nothing is quantified, because nothing has
// been measured and verified. `existingWorkflow` and `outcomeMetrics` are left
// null on purpose (see MISSING_FROM_CLIENT); the UI omits them until they are
// confirmed rather than filling the space with something plausible.

export const caseStudies = [
  {
    id: 'lumo-rentals',
    name: 'Lumo Rentals',
    initials: 'LR',
    status: 'Delivered',
    category: 'Vehicle rental platform · Web + iOS + Android',
    year: '2025',
    summary:
      'A vehicle rental business running bookings for bikes, cars and tempo vehicles across three surfaces — a public web app and native apps on both stores — from a single backend.',
    challenge:
      'Renting vehicles is a coordination problem before it is a software problem: what is available, for which dates, at what price, paid for by whom. Handling that across separate channels means availability is only ever correct in one person’s head.',
    existingWorkflow: null,
    solution:
      'A booking platform with one API behind three clients. Vehicle catalogue, availability, reservations, customer accounts and payment all live in one system, so a booking made on a phone and a booking made on the web are the same record.',
    ai: null,
    aiNote:
      'No AI in this build. The value here was in removing manual coordination, and adding a model would have added risk without adding capability — the same judgement we apply to every project.',
    automation: [
      'Availability and reservation state maintained by the system rather than reconciled by hand',
      'Payment capture and booking confirmation handled in-flow instead of chased afterwards',
      'One booking record shared across web and both mobile apps',
    ],
    engineering: [
      'A single Java service and PostgreSQL data model serving three clients',
      'React Native application shipped through both App Store and Google Play review',
      'Payment provider integration',
      'Availability modelling across vehicle classes and date ranges',
    ],
    outcome: [
      'Live in production on the web, the App Store and Google Play',
      'Bookings run through one system rather than across separate channels',
      'Customers self-serve on the surface they already use',
    ],
    outcomeMetrics: null,
    flow: ['Customer', 'Availability', 'Reservation', 'Payment', 'Confirmation', 'Operations'],
    stack: ['React.js', 'React Native', 'Java', 'PostgreSQL', 'Payments'],
    links: {
      live: 'https://www.lumo.rentals/',
      playstore: 'https://play.google.com/store/apps/details?id=com.lumo&pcampaignid=web_share',
      appstore: 'https://apps.apple.com/in/app/lumo-rentals/id6747010129',
    },
  },
]

// ── Privacy policy ──────────────────────────────────────────────────────────
//
// Rendered at #/privacy. Written to be accurate about THIS site rather than
// copied from a generator: the site sets no cookies, runs no analytics and has
// no tracking of any kind, and the only personal data it ever receives is what
// somebody types into the contact form. The two honest disclosures a European
// reader is actually looking for are the Google Fonts request and the fact that
// the enquiry is read in India — both are stated plainly below.
//
// TODO(trimugo): `controller.postal` is the one field that cannot be derived
// from this repository. Fill in the registered postal address — Germany and
// Austria expect one (Impressum), and EU procurement will ask for it on the
// vendor form. The section renders correctly without it until then.

export const privacy = {
  updated: '3 September 2026',
  intro:
    'This site sets no cookies, runs no analytics, and contains no tracking or advertising technology of any kind. The only personal data it receives is what you choose to type into the contact form. This page explains what happens to it.',
  controller: {
    name: 'Trimugo — Malisetti Obulamurthy',
    role: 'Data controller',
    postal: null,
    email: 'trimugoitsolutions@gmail.com',
    phone: '+91 85000 98088',
  },
  sections: [
    {
      title: 'What we collect, and when',
      body: 'Only through the contact form. Nothing is collected from you by simply reading the site.',
      items: [
        'Your name, and the company you are writing on behalf of',
        'Your work email address, and your company website if you choose to give it',
        'What you are looking to build, and your expected timeline',
        'The description of how your process works today, in your own words',
      ],
      note: 'Please do not put confidential business detail, personal data about third parties, or anything commercially sensitive into the form. A first message only needs enough to make the reply useful — the detail belongs in a conversation under an NDA.',
    },
    {
      title: 'Why we process it, and on what legal basis',
      body: 'To read your enquiry and reply to it, and to carry out any work that follows from it. Under the GDPR the basis is Article 6(1)(b) — steps taken at your request before entering into a contract — and, where an enquiry does not lead to a contract, Article 6(1)(f), our legitimate interest in answering people who contact us about our work. Your data is never used for marketing, never profiled, and never sold or shared for anyone else’s purposes.',
    },
    {
      title: 'Who else touches it',
      items: [
        'Web3Forms (web3forms.com) — receives the form submission and relays it to our email inbox. It is a processor acting on our instructions.',
        'Google Workspace — the inbox the enquiry is delivered to and stored in.',
        'Vercel — hosts this website and keeps short-lived technical server logs, including the IP address of every request, for security and diagnostics.',
        'Google Fonts — the two typefaces on this site are requested from fonts.googleapis.com and fonts.gstatic.com when the page loads, which discloses your IP address to Google. No cookie is set by this request. If you would rather not make it, a content blocker or a browser that blocks third-party requests will stop it, and the site remains fully usable in a fallback typeface.',
      ],
      note: 'There are no other recipients. No analytics provider, no advertising network, no session recorder, no chat widget, no A/B testing tool, and no social media pixel.',
    },
    {
      title: 'Where it goes — transfer outside the EEA',
      body: 'Stated plainly because it matters to a European client: Trimugo operates from India, which is a third country without an EU adequacy decision. When you send the form, your enquiry is read and answered in India. For an enquiry you send us yourself, the transfer relies on Article 49(1)(b) of the GDPR — it is necessary to take steps at your request before a contract. Where we go on to work together and personal data is processed as part of that work, the transfer is put on a proper footing in the contract, with Standard Contractual Clauses and a data processing agreement, before any such processing begins.',
    },
    {
      title: 'How long it is kept',
      body: 'An enquiry that does not lead to work is deleted once it is clear there is nothing to follow up — in any case within twelve months. An enquiry that does lead to work is kept for the duration of the engagement and afterwards only for as long as we have a legal or contractual reason to keep it. Server logs at the host are short-lived and rotate automatically.',
    },
    {
      title: 'Your rights',
      body: 'If you are in the EU or the EEA, the GDPR gives you the right to ask for a copy of the personal data we hold about you, to have it corrected, to have it erased, to restrict or object to how it is processed, and to receive it in a portable form. Ask by email and we will act on it within one month, free of charge. You also have the right to complain to the data protection authority in your own country if you are not satisfied with how we have handled it.',
    },
    {
      title: 'Security',
      body: 'The site is served over HTTPS only. The contact form is submitted over an encrypted connection and posted straight to the relay — it is never written to a database on this site, because this site has no database and no server-side storage of its own. Access to the inbox holding enquiries is protected by two-factor authentication.',
    },
    {
      title: 'Children',
      body: 'This is a business-to-business site. It is not directed at children and we do not knowingly collect personal data from anyone under 16.',
    },
    {
      title: 'Changes',
      body: 'If this policy changes, the date at the top of the page changes with it. There is no mailing list to notify, because we do not run one.',
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// NOT YET VERIFIED — do not render, do not guess.
//
// The case studies below deliberately omit the two fields that cannot be
// derived from anything in this repository: how each client ran the process
// BEFORE the build, and any quantified outcome. Both are real facts that only
// Trimugo and the client know. Fill `existingWorkflow` and `outcomeMetrics` in
// `caseStudies` when they are confirmed; the section renders correctly without
// them and will pick them up automatically.
// ─────────────────────────────────────────────────────────────────────────────

export const MISSING_FROM_CLIENT = ['existingWorkflow', 'outcomeMetrics']
