// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS CONTENT
//
// Everything the story track below the journey renders. Kept apart from
// content.js (which serves the classic route) because this is positioning copy
// for a specific audience — European operations, engineering and founder-level
// buyers — and it should be editable without touching the marketing site.
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
// Only what the team genuinely ships with. Cross-checked against the stacks
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
    body: 'You talk to the people building the system. There is no account layer between you and the work.',
  },
  {
    title: 'Long-term partnership',
    body: 'We can keep developing and supporting the system after launch, rather than handing over a repository and leaving.',
  },
]

// ── 08 · Team ───────────────────────────────────────────────────────────────

export const team = {
  line: 'Small team. Senior execution. Direct communication.',
  body: 'Trimugo is a focused engineering team, not a resourcing pool. The people in the first call are the people who build the system.',
  roles: [
    { title: 'Founder / Solution Architect', body: 'Process discovery, architecture and delivery ownership.' },
    { title: 'Full-Stack Engineer', body: 'Application, API and data layer.' },
    { title: 'AI / Backend Engineer', body: 'Model integration, retrieval, extraction and workflow services.' },
    { title: 'Frontend / Mobile Engineer', body: 'Web interfaces and React Native applications.' },
  ],
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
    { title: 'Milestone-based delivery', body: 'Scope agreed and invoiced against defined milestones.' },
    { title: 'Regular demos', body: 'Working software shown on a fixed cadence, not slides.' },
    { title: 'Documentation', body: 'Architecture, integrations and operational runbooks written down.' },
    { title: 'Transparent communication', body: 'Progress, blockers and estimates reported as they change.' },
    { title: 'Direct engineering access', body: 'Your team can talk to ours without an intermediary.' },
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
    a: 'Yes. We work as an engineering partner inside your process — your repositories, your review standards, your release cadence — or as a self-contained delivery team, whichever fits.',
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
    a: 'Yes. Delivery is remote and structured around milestones, scheduled demos and written documentation, with direct access to the engineers doing the work.',
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
// Two real systems, written up as case studies. Every claim below is derived
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
  {
    id: 'profile-evaluator',
    name: 'Profile Evaluator',
    initials: 'PE',
    status: 'In active development',
    category: 'Career assessment platform · Web',
    year: '2026',
    summary:
      'A career platform where a candidate’s profile is scored, their resume is built, learning material is delivered, and assessments and certifications are taken — in one portal instead of four tools.',
    challenge:
      'Assessing readiness, delivering the material that closes the gap, and certifying the result are normally three disconnected systems. Nothing carries a candidate’s state from one to the next, so the evaluation has to be repeated by hand at every stage.',
    existingWorkflow: null,
    solution:
      'One portal that holds the candidate’s state end to end: profile scoring, resume building, learning material, assessment delivery and certification, all against the same record.',
    ai: 'Automated evaluation — profiles and assessment submissions are scored by the system rather than reviewed manually, so the result is immediate and consistent across candidates.',
    aiNote: null,
    automation: [
      'Profile scoring produced by the system instead of assessed by hand',
      'Assessment delivery and grading run without manual intervention',
      'Certification issued from the assessment result rather than tracked separately',
    ],
    engineering: [
      'JWT authentication with role separation across candidate and administrative access',
      'Assessment engine with scoring and certification issuance',
      'Node.js and Express API over MongoDB',
      'Resume builder generating structured, exportable output',
    ],
    outcome: [
      'Live and in active development',
      'Scoring, learning, assessment and certification share one candidate record',
      'Evaluation is consistent between candidates rather than reviewer-dependent',
    ],
    outcomeMetrics: null,
    flow: ['Profile', 'Scoring', 'Learning', 'Assessment', 'Grading', 'Certification'],
    stack: ['React.js', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Tailwind'],
    links: { live: 'https://profile-evalutor-ui.onrender.com/' },
  },
]

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
