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
  'Business Chatbots',
  'Voice Assistants',
  'Document AI',
  'OCR',
  'Knowledge Base AI',
  'Customer Support AI',
  'Sales Assistant',
  'HR Assistant',
  'Workflow Automation',
  'Business Intelligence',
  'Predictive Analytics',
  'Generative AI Integration',
  'Large Language Model Integration',
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

export const products = [
  { name: 'Hospital Management System', icon: 'Hospital', tag: 'Healthcare', price: 'from ₹4,999/mo' },
  { name: 'School ERP', icon: 'School', tag: 'Education', price: 'from ₹1,999/mo' },
  { name: 'College Management', icon: 'GraduationCap', tag: 'Education', price: 'from ₹2,999/mo' },
  { name: 'Builder CRM', icon: 'Building2', tag: 'Real Estate', price: 'from ₹1,499/mo' },
  { name: 'Retail POS', icon: 'ShoppingCart', tag: 'Retail', price: 'from ₹799/mo' },
  { name: 'Inventory Management', icon: 'PackageSearch', tag: 'Operations', price: 'from ₹999/mo' },
  { name: 'HR Management', icon: 'Users', tag: 'Workforce', price: 'from ₹1,299/mo' },
  { name: 'Attendance System', icon: 'CalendarCheck', tag: 'Workforce', price: 'from ₹499/mo' },
  { name: 'Appointment Management', icon: 'CalendarClock', tag: 'Operations', price: 'from ₹599/mo' },
  { name: 'Learning Management', icon: 'BookOpen', tag: 'Education', price: 'from ₹1,499/mo' },
  { name: 'Visitor Management', icon: 'UserCheck', tag: 'Security', price: 'from ₹499/mo' },
  { name: 'Digital Forms', icon: 'ClipboardList', tag: 'Operations', price: 'from ₹399/mo' },
  { name: 'Asset Management', icon: 'Boxes', tag: 'Operations', price: 'from ₹899/mo' },
  { name: 'AI Knowledge Portal', icon: 'Brain', tag: 'AI', price: 'from ₹2,499/mo' },
]

export const caseStudies = [
  {
    industry: 'Healthcare',
    problem: 'A 200-bed hospital lost hours daily to paper records and double-booked appointments.',
    solution: 'Unified Hospital Management System with patient portal and AI scheduling.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'AI Scheduling'],
    results: [
      { metric: '63%', label: 'less admin time' },
      { metric: '4.8/5', label: 'patient satisfaction' },
    ],
    quote: 'Trimugo gave our staff their time back. It transformed how we run the hospital.',
    author: 'Dr. A. Mehta, Medical Director',
  },
  {
    industry: 'Retail',
    problem: 'A 30-store retail chain had no real-time visibility into stock or sales.',
    solution: 'Cloud Retail POS + Inventory with live analytics dashboards across all stores.',
    tech: ['Next.js', 'Cloud', 'Analytics', 'API Integrations'],
    results: [
      { metric: '28%', label: 'revenue growth' },
      { metric: '41%', label: 'fewer stockouts' },
    ],
    quote: 'We finally run the business on data, not guesswork. Game changer.',
    author: 'R. Khanna, Operations Head',
  },
  {
    industry: 'Logistics',
    problem: 'Manual dispatch and customer calls overwhelmed a growing logistics firm.',
    solution: 'WhatsApp automation + AI chatbot + workflow automation for live tracking.',
    tech: ['AI Chatbot', 'WhatsApp API', 'Automation', 'Cloud'],
    results: [
      { metric: '5x', label: 'faster support' },
      { metric: '70%', label: 'tickets automated' },
    ],
    quote: 'Our customers get instant answers and our team focuses on real work.',
    author: 'S. Iyer, Founder',
  },
]

export const articles = [
  {
    category: 'AI Insights',
    title: 'How Generative AI Is Quietly Rewiring Mid-Market Operations',
    excerpt: 'Practical, ROI-first ways businesses are deploying LLMs beyond the hype cycle.',
    read: '7 min read',
    featured: true,
  },
  {
    category: 'Automation',
    title: 'The Hidden Cost of Manual Workflows (And How to Kill It)',
    excerpt: 'A simple framework to find and automate the work draining your margins.',
    read: '5 min read',
  },
  {
    category: 'Digital Transformation',
    title: 'A CIO Playbook for Modernizing Without the Big-Bang Risk',
    excerpt: 'Incremental modernization strategies that de-risk legacy migration.',
    read: '9 min read',
  },
  {
    category: 'Technology Trends',
    title: '2026 Enterprise Tech Trends Worth Your Budget',
    excerpt: 'The signals separating durable shifts from passing fads this year.',
    read: '6 min read',
  },
]

export const resources = [
  { name: 'ROI Calculator', icon: 'Calculator', desc: 'Estimate savings before you invest.' },
  { name: 'Digital Readiness Checklist', icon: 'ListChecks', desc: 'Score your readiness in 5 minutes.' },
  { name: 'Free Templates', icon: 'FileText', desc: 'Requirement & project templates.' },
  { name: 'Business Assessment Tools', icon: 'Gauge', desc: 'Diagnose operational gaps fast.' },
  { name: 'Technology Comparison Guides', icon: 'GitCompare', desc: 'Pick the right stack with confidence.' },
  { name: 'Downloadable PDFs', icon: 'Download', desc: 'Guides and reports, ready offline.' },
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
  { label: 'Why Trimugo', href: '#why' },
  { label: 'Industries', href: '#industries' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'AI', href: '#ai' },
  { label: 'Products', href: '#products' },
  { label: 'Case Studies', href: '#cases' },
  { label: 'Resources', href: '#resources' },
]
