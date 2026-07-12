// Centralised content for Trimugo — keeps components clean and data-driven.

export const principles = [
  {
    title: 'Understand Business',
    desc: 'We start by deeply understanding your operations, goals, and the people behind them.',
  },
  {
    title: 'Identify Problems',
    desc: 'We pinpoint the real bottlenecks costing you time, money, and growth.',
  },
  {
    title: 'Recommend Technology',
    desc: 'We map the right technology to the problem — never the other way around.',
  },
  {
    title: 'Build Solutions',
    desc: 'We design and engineer scalable, reliable solutions tailored to your business.',
  },
  {
    title: 'Provide Continuous Support',
    desc: 'We stay on as a long-term partner, improving and evolving your systems over time.',
  },
]

export const industries = [
  { name: 'Healthcare', icon: 'HeartPulse' },
  { name: 'Hospitals', icon: 'Stethoscope' },
  { name: 'Schools', icon: 'School' },
  { name: 'Colleges', icon: 'GraduationCap' },
  { name: 'Construction', icon: 'HardHat' },
  { name: 'Real Estate', icon: 'Building2' },
  { name: 'Retail', icon: 'ShoppingBag' },
  { name: 'Manufacturing', icon: 'Factory' },
  { name: 'Agriculture', icon: 'Sprout' },
  { name: 'Logistics', icon: 'Truck' },
  { name: 'Hospitality', icon: 'UtensilsCrossed' },
  { name: 'Finance', icon: 'Landmark' },
  { name: 'Startups', icon: 'Rocket' },
  { name: 'SMEs', icon: 'Store' },
  { name: 'Government', icon: 'Building' },
]

export const solutions = [
  { name: 'Business Websites', icon: 'Globe', desc: 'High-converting, fast, SEO-ready marketing sites.' },
  { name: 'Enterprise Portals', icon: 'LayoutDashboard', desc: 'Secure internal & client-facing portals.' },
  { name: 'Mobile Applications', icon: 'Smartphone', desc: 'Native-quality iOS & Android apps.' },
  { name: 'AI Chatbots', icon: 'Bot', desc: '24/7 intelligent conversational support.' },
  { name: 'Voice AI', icon: 'Mic', desc: 'Voice assistants and call automation.' },
  { name: 'WhatsApp Automation', icon: 'MessageCircle', desc: 'Automated chat, sales & notifications.' },
  { name: 'CRM', icon: 'Users', desc: 'Manage leads, customers & pipelines.' },
  { name: 'ERP', icon: 'Boxes', desc: 'Unify operations into one platform.' },
  { name: 'Inventory Systems', icon: 'PackageSearch', desc: 'Real-time stock & supply tracking.' },
  { name: 'Billing Systems', icon: 'ReceiptText', desc: 'Invoicing, payments & reconciliation.' },
  { name: 'Analytics Dashboards', icon: 'BarChart3', desc: 'Decisions backed by live data.' },
  { name: 'Cloud Solutions', icon: 'Cloud', desc: 'Scalable, secure cloud infrastructure.' },
  { name: 'Workflow Automation', icon: 'Workflow', desc: 'Eliminate repetitive manual work.' },
  { name: 'API Integrations', icon: 'Webhook', desc: 'Connect every tool you rely on.' },
  { name: 'Custom Software', icon: 'Code2', desc: 'Bespoke systems for unique needs.' },
  { name: 'Digital Transformation', icon: 'Sparkles', desc: 'Strategy-led modernization consulting.' },
  { name: 'Cybersecurity', icon: 'ShieldCheck', desc: 'Protect data, systems & customers.' },
  { name: 'Maintenance & Support', icon: 'Wrench', desc: 'Reliable ongoing care for your stack.' },
]

export const aiSolutions = [
  { name: 'Business Chatbots', icon: 'Bot', desc: '24/7 AI chat that answers questions, qualifies leads, and routes conversations.' },
  { name: 'Voice Assistants', icon: 'Mic', desc: 'Natural voice AI for calls, IVR, and hands-free workflows.' },
  { name: 'Document AI', icon: 'FileText', desc: 'Extract, classify, and summarize documents automatically.' },
  { name: 'OCR', icon: 'ScanText', desc: 'Turn scanned files and images into searchable, structured data.' },
  { name: 'Knowledge Base AI', icon: 'BookOpen', desc: 'Instant answers grounded in your own docs, policies, and data.' },
  { name: 'Customer Support AI', icon: 'MessageCircle', desc: 'Deflect tickets and assist agents with AI copilots.' },
  { name: 'Sales Assistant', icon: 'TrendingUp', desc: 'AI that drafts outreach, scores leads, and books meetings.' },
  { name: 'HR Assistant', icon: 'Users', desc: 'Automate FAQs, onboarding, and policy questions for staff.' },
  { name: 'Workflow Automation', icon: 'Workflow', desc: 'Connect your apps and let AI handle repetitive steps end to end.' },
  { name: 'Business Intelligence', icon: 'BarChart3', desc: 'Ask questions in plain English and get answers from live data.' },
  { name: 'Predictive Analytics', icon: 'LineChart', desc: 'Forecast demand, churn, and risk from your historical data.' },
  { name: 'Generative AI', icon: 'Sparkles', desc: 'Embed GPT-class models into your products and internal tools.' },
  { name: 'LLM Integration', icon: 'Brain', desc: 'Fine-tune and deploy large language models securely on your stack.' },
]

export const processSteps = [
  { title: 'Discovery', desc: 'Workshops to align on vision, scope and success metrics.' },
  { title: 'Business Analysis', desc: 'Map workflows, data and the real cost of every problem.' },
  { title: 'Technology Strategy', desc: 'Choose the architecture and stack that fits your future.' },
  { title: 'Design', desc: 'UX, UI and system design that people love to use.' },
  { title: 'Development', desc: 'Agile engineering with continuous demos and feedback.' },
  { title: 'Deployment', desc: 'Smooth, secure go-live with zero-downtime rollout.' },
  { title: 'Training', desc: 'Enable your team to own and operate the solution.' },
  { title: 'Continuous Improvement', desc: 'Iterate, optimize and scale as you grow.' },
]

// Real projects delivered by the Trimugo team.
export const projects = [
  {
    name: 'Lumo Rentals',
    initials: 'LR',
    category: 'Full-Stack · Mobile',
    year: '2025',
    desc: 'A travel platform for booking bikes, cars, and tempo vehicles — with web and mobile apps live on Android and iOS.',
    tags: ['React.js', 'React Native', 'Java', 'Postgres', 'Payments'],
    links: {
      live: 'https://www.lumo.rentals/',
      playstore: 'https://play.google.com/store/apps/details?id=com.lumo&pcampaignid=web_share',
      appstore: 'https://apps.apple.com/in/app/lumo-rentals/id6747010129',
    },
  },
  {
    name: 'Profile Evaluator',
    initials: 'PE',
    category: 'Web Application',
    year: '2026',
    desc: 'A career platform where users check scores, build resumes, access learning material, and take assessments and certifications — all in one portal.',
    tags: ['React.js', 'Node.js', 'MongoDB', 'Express', 'JWT', 'Tailwind'],
    links: { live: 'https://profile-evalutor-ui.onrender.com/' },
  },
  {
    name: 'Good Plastics',
    initials: 'GP',
    category: 'Web Application',
    year: '2026',
    desc: 'A website for a bioplastic manufacturer making biodegradable PHA alternatives to regular plastic — covering products, services, and consulting.',
    tags: ['React.js', 'TypeScript', 'Tailwind', 'Vite'],
    links: { live: 'https://good-plastics.onrender.com' },
  },
  {
    name: 'Spark',
    initials: 'SP',
    category: 'Mobile App',
    year: '2026',
    desc: 'A dating mobile app with swipe-based matching, chat, profile management, and location-based suggestions.',
    tags: ['React Native', 'Node.js', 'MongoDB', 'Tailwind'],
    links: {},
  },
]

export const articles = [
  {
    slug: 'generative-ai-mid-market-operations',
    category: 'AI Insights',
    title: 'How Generative AI Is Quietly Rewiring Mid-Market Operations',
    excerpt: 'Practical, ROI-first ways businesses are deploying LLMs beyond the hype cycle.',
    read: '7 min read',
    date: 'June 12, 2026',
    featured: true,
    body: [
      { type: 'p', text: 'The loudest AI stories are about frontier models and billion-dollar labs. The quieter — and more useful — story is what mid-market companies are doing right now: wiring generative AI into everyday operations to remove busywork and speed up decisions. No moonshots, just measurable gains.' },
      { type: 'h2', text: 'Where it is actually landing' },
      { type: 'p', text: 'The highest-ROI deployments are rarely glamorous. They cluster around a few repeatable jobs:' },
      { type: 'ul', items: [
        'Customer support: AI drafts replies and deflects repetitive tickets, so agents handle the hard 20%.',
        'Documents: contracts, invoices, and forms get read, classified, and summarized in seconds.',
        'Sales: outreach drafts, call summaries, and CRM updates that used to eat hours are automated.',
        'Analytics: teams ask questions in plain English instead of waiting on a report backlog.',
      ] },
      { type: 'h2', text: 'Why mid-market, and why now' },
      { type: 'p', text: 'Two barriers fell at once. Capable models are now available as pay-as-you-go APIs, so you no longer need a research team. And the tooling around them — retrieval, orchestration, evaluation — matured enough that a focused build takes weeks, not years. That puts serious capability within reach of a 50-person company, not just a 50,000-person one.' },
      { type: 'h2', text: 'An ROI-first playbook' },
      { type: 'p', text: 'The teams getting value share a pattern: they start narrow and measure hard.' },
      { type: 'ul', items: [
        'Pick one workflow with a clear cost (hours, error rate, or response time).',
        'Ship a thin slice to a small group and measure against a baseline.',
        'Keep a human in the loop until quality is proven, then widen scope.',
        'Expand only when the numbers justify it — never because the demo looked cool.',
      ] },
      { type: 'h2', text: 'The pitfalls to avoid' },
      { type: 'p', text: 'Most failures are not model failures. They are “science projects” with no owner and no metric, launches on messy data that was never cleaned, and rollouts that ignore change management. Generative AI amplifies whatever process it touches — so fix the process first, then let the model make it faster.' },
      { type: 'p', text: 'Done this way, GenAI is not a gamble. It is a series of small, compounding wins that quietly reshape how the business runs.' },
    ],
  },
  {
    slug: 'hidden-cost-of-manual-workflows',
    category: 'Automation',
    title: 'The Hidden Cost of Manual Workflows (And How to Kill It)',
    excerpt: 'A simple framework to find and automate the work draining your margins.',
    read: '5 min read',
    date: 'May 28, 2026',
    body: [
      { type: 'p', text: 'Manual work rarely shows up as a line item, which is exactly why it is so expensive. It hides inside salaries, delays, and mistakes — a tax you pay every day without ever seeing the invoice.' },
      { type: 'h2', text: 'The invisible tax' },
      { type: 'p', text: 'Every manual step carries three costs: the time someone spends doing it, the errors it introduces, and the morale it drains. A five-minute copy-paste task done 40 times a day is over 200 hours a year — for one person, on one task. Multiply that across a team and the number gets uncomfortable fast.' },
      { type: 'h2', text: 'Find your costliest workflows' },
      { type: 'p', text: 'You cannot automate what you cannot see. Run a quick audit:' },
      { type: 'ul', items: [
        'List the tasks people repeat daily or weekly.',
        'For each, estimate volume × time × people. That is your annual cost.',
        'Flag anything rules-based (no judgement call needed) and high-volume.',
        'Note where errors are frequent or expensive — those are prime targets.',
      ] },
      { type: 'h2', text: 'What to automate first' },
      { type: 'p', text: 'Start where the rules are clear and the volume is high: data entry between systems, notifications and reminders, report generation, invoice and form processing, and status updates. These are low-risk, high-return, and build momentum for bigger projects.' },
      { type: 'h2', text: 'A simple four-step approach' },
      { type: 'ul', items: [
        'Map the workflow exactly as it happens today — every click and hand-off.',
        'Remove steps that add no value before automating anything.',
        'Connect the systems (APIs or an automation layer) so data flows without a human relay.',
        'Measure the hours saved and the error drop, then reinvest that time.',
      ] },
      { type: 'p', text: 'The goal is not to automate everything. It is to stop paying an invisible tax on the work that never needed a human in the first place.' },
    ],
  },
  {
    slug: 'cio-playbook-modernizing-without-big-bang',
    category: 'Digital Transformation',
    title: 'A CIO Playbook for Modernizing Without the Big-Bang Risk',
    excerpt: 'Incremental modernization strategies that de-risk legacy migration.',
    read: '9 min read',
    date: 'May 9, 2026',
    body: [
      { type: 'p', text: 'The instinct with aging systems is to rip and replace — a clean rewrite, a hard cutover, a new era. It is also how most modernization budgets get burned. Big-bang rewrites are risky because they ask you to deliver everything before you deliver anything.' },
      { type: 'h2', text: 'Why big-bang fails' },
      { type: 'p', text: 'A full rewrite freezes value for months or years, competes with the old system it must eventually match feature-for-feature, and concentrates all the risk into a single cutover night. If the estimate slips — and it always does — the business feels nothing but cost until the very end.' },
      { type: 'h2', text: 'The strangler-fig approach' },
      { type: 'p', text: 'A safer pattern borrowed from nature: grow the new system around the old one, route traffic piece by piece, and retire the legacy parts only once their replacements are proven. The old system keeps running the whole time. Value ships continuously instead of all at once.' },
      { type: 'h2', text: 'How to sequence it' },
      { type: 'ul', items: [
        'Instrument first: measure what the current system does and where it hurts most.',
        'Find the seams: identify modules with clean boundaries you can peel off.',
        'Ship thin slices: replace one capability end to end, behind a feature flag.',
        'Route gradually: send a small percentage of traffic, watch, then increase.',
        'Retire deliberately: decommission legacy only after the new path is stable.',
      ] },
      { type: 'h2', text: 'Guardrails that keep it safe' },
      { type: 'p', text: 'Incremental does not mean unmanaged. Keep a rollback path for every slice, agree on success metrics before you start, and protect data integrity with parallel-run checks that compare old and new outputs. Governance here is not bureaucracy — it is what lets you move fast without breaking trust.' },
      { type: 'p', text: 'Modernization is not a single heroic launch. It is a disciplined sequence of small, reversible steps — each one delivering value and reducing risk on the way to a system you are proud of.' },
    ],
  },
  {
    slug: '2026-enterprise-tech-trends',
    category: 'Technology Trends',
    title: '2026 Enterprise Tech Trends Worth Your Budget',
    excerpt: 'The signals separating durable shifts from passing fads this year.',
    read: '6 min read',
    date: 'April 22, 2026',
    body: [
      { type: 'p', text: 'Every year brings a fresh wave of “must-have” technology. Most of it is noise. Here are the shifts in 2026 that are durable enough to plan and budget around — and why they matter for a growing business.' },
      { type: 'h2', text: 'AI agents that do work, not just chat' },
      { type: 'p', text: 'The conversation is moving from chatbots that answer questions to agents that complete tasks — booking, updating records, and coordinating across tools. The winners will be narrow, well-guarded agents pointed at a single high-value workflow, not open-ended “do anything” assistants.' },
      { type: 'h2', text: 'Retrieval over retraining' },
      { type: 'p', text: 'Instead of expensive fine-tuning, most teams get better results by connecting models to their own documents and data (retrieval-augmented generation). It is cheaper, easier to keep current, and keeps answers grounded in your reality.' },
      { type: 'h2', text: 'Automation as default plumbing' },
      { type: 'p', text: 'Workflow automation is shifting from a project to an expectation. New processes are being designed automation-first, with humans handling exceptions rather than the routine. This is where the fastest, safest ROI still lives.' },
      { type: 'h2', text: 'Cloud cost discipline' },
      { type: 'p', text: 'After years of “ship first, worry later,” finance and engineering are converging on cost visibility. Right-sizing, usage-based architectures, and killing idle resources are back in fashion — and they pay for themselves.' },
      { type: 'h2', text: 'Security moves left' },
      { type: 'p', text: 'Security is becoming a build-time concern, not a launch-day checklist: dependency scanning, least-privilege access, and secrets hygiene baked into the pipeline. For any business handling customer data, this is now table stakes, not a differentiator.' },
      { type: 'p', text: 'The through-line for 2026: favor durable, measurable capability over hype. Budget for the shifts that make your operations cheaper, faster, and safer — and let the rest prove itself before you pay for it.' },
    ],
  },
]

export const educationalProjects = [
  { name: 'Web Development', icon: 'Globe', desc: 'Full-stack web apps with modern frameworks and a clean UI.' },
  { name: 'Mobile Applications', icon: 'Smartphone', desc: 'Android & iOS apps built with React Native or Flutter.' },
  { name: 'AI & Machine Learning', icon: 'Brain', desc: 'Prediction, classification, NLP and computer-vision models.' },
  { name: 'Data Science & Analytics', icon: 'BarChart3', desc: 'Dashboards and data-driven mini and major projects.' },
  { name: 'IoT Projects', icon: 'Cpu', desc: 'Sensor-based hardware integrated with a software dashboard.' },
  { name: 'Cloud & DevOps', icon: 'Cloud', desc: 'Deployment, CI/CD, and cloud-hosted project setups.' },
  { name: 'Cybersecurity', icon: 'ShieldCheck', desc: 'Security tools, encryption, and vulnerability demos.' },
  { name: 'Blockchain', icon: 'Boxes', desc: 'Smart contracts and decentralized app (dApp) projects.' },
  { name: 'Chatbots & Generative AI', icon: 'Bot', desc: 'LLM-powered chatbots and GenAI-based applications.' },
]

export const studentIncludes = [
  'Complete source code',
  'Project report & documentation',
  'Live demo & deployment',
  '1:1 guidance & code walkthrough',
  'Viva & presentation prep',
  'Original, plagiarism-free work',
]

export const resources = [
  { name: 'ROI Calculator', icon: 'Calculator', desc: 'Estimate savings before you invest.', tool: 'roi' },
  { name: 'Digital Readiness Checklist', icon: 'ListChecks', desc: 'Score your readiness in 5 minutes.', tool: 'checklist' },
  { name: 'Business Assessment Tools', icon: 'Gauge', desc: 'Diagnose operational gaps fast.', tool: 'checklist' },
]

export const communityEvents = [
  { type: 'Webinar', title: 'AI for Operations: Live Build', date: 'Jul 18, 2026', mode: 'Online' },
  { type: 'Workshop', title: 'Automation Bootcamp for SMEs', date: 'Aug 02, 2026', mode: 'Hybrid' },
  { type: 'Hackathon', title: 'Trimugo Campus Hack 2026', date: 'Sep 14, 2026', mode: 'On-site' },
  { type: 'Meetup', title: 'Cloud & DevOps Community Night', date: 'Sep 28, 2026', mode: 'Online' },
]

export const careers = [
  { role: 'Senior Full-Stack Engineer', type: 'Full-time', location: 'Remote' },
  { role: 'AI/ML Engineer', type: 'Full-time', location: 'Hybrid' },
  { role: 'Product Designer (UX/UI)', type: 'Full-time', location: 'Remote' },
  { role: 'Frontend Intern', type: 'Internship', location: 'Remote' },
  { role: 'Solutions Consultant', type: 'Full-time', location: 'On-site' },
]

export const aboutValues = [
  {
    icon: 'Target',
    title: 'Outcomes first',
    desc: 'We measure success by business results — time saved, costs cut, and quality improved — not by lines of code shipped.',
  },
  {
    icon: 'Handshake',
    title: 'Long-term partnership',
    desc: 'We stay after launch with support, training, and continuous improvement, so your systems keep getting better.',
  },
  {
    icon: 'Coins',
    title: 'Affordable & transparent',
    desc: 'Clear scopes and honest pricing designed for startups, SMEs, and institutions — no surprise invoices.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Built to last',
    desc: 'Security, reliability, and scalability engineered in from day one — not bolted on later.',
  },
]

export const stats = [
  { value: '6', label: 'Projects delivered' },
  { value: '98%', label: 'Client retention' },
  { value: '24/7', label: 'Support & monitoring' },
]

export const techStack = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Python',
  'AWS',
  'Azure',
  'PostgreSQL',
  'OpenAI',
  'Docker',
  'Kubernetes',
  'Tailwind CSS',
]

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Why Trimugo', href: '#why' },
  { label: 'Industries', href: '#industries' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'AI', href: '#ai' },
  { label: 'Work', href: '#cases' },
  { label: 'Students', href: '#students' },
  { label: 'Resources', href: '#resources' },
]
