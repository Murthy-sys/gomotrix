// The shipped-project record.
//
// Read by the 3D gallery (universe/scenes/Showcase), the case-study overlay and
// the "also shipped" list under the case studies. Kept separate from
// business.js: that file holds the argument, this one holds the facts about
// what exists. Every entry must point at something a visitor can actually open
// — a dead link here is worse than an absent project.

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
    name: 'WanderLux Journeys',
    initials: 'WJ',
    category: 'Tourism · 3D Experience',
    year: '2026',
    desc: 'A scroll-driven 3D site for a travel and tourist-management brand — a five-chapter journey through India rendered in WebGL.',
    tags: ['React.js', 'Three.js', 'WebGL', 'Vite'],
    links: { live: 'https://tourism-3d.onrender.com' },
  },
  {
    name: 'Lisno India',
    initials: 'LI',
    category: 'Full-Stack · Mobile',
    year: '2026',
    status: 'In development',
    desc: 'A full-stack platform with a mobile app for a Bangalore interiors and engineering studio, in development alongside the live public site — services, a filterable project portfolio and 3D room walkthroughs.',
    // The application stack (React, Redux Toolkit, Node, Express) is confirmed
    // by Trimugo; the rest is what the live site at lisno.co.in demonstrably
    // loads. 'JavaScript' was dropped when React was added — naming both reads
    // as padding, and React already answers the question.
    //
    // TODO(trimugo): the mobile side is still unconfirmed. The description
    // mentions an app, but nothing here names what it is built with, so no
    // framework has been guessed on its behalf.
    tags: ['React', 'Redux Toolkit', 'Node.js', 'Express', 'Tailwind CSS', 'GSAP', 'ScrollTrigger'],
    links: { live: 'https://lisno.co.in/' },
  },
  {
    name: "Suresh's Yogalaya",
    initials: 'SY',
    category: 'Web Application',
    year: '2026',
    desc: 'A scroll-driven site for a yoga studio in Anantapur — online and offline classes, kids yoga, workshops, and instructor profiles.',
    tags: ['React.js', 'Tailwind', 'Vite'],
    links: { live: 'https://www.sureshyogalaya.in/' },
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
    status: 'In development',
    desc: 'A dating mobile app with swipe-based matching, chat, profile management, and location-based suggestions.',
    tags: ['React Native', 'Node.js', 'MongoDB', 'Tailwind'],
    links: {},
  },
]
