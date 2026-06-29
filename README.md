# Trimugo — Official Website

A modern, premium, enterprise-grade marketing site for **Trimugo**, a technology solutions company. Built with **React + Vite + Tailwind CSS** and **Framer Motion**, with dark/light mode, responsive layout, animations, and PWA support.

## Tech stack

- **React 18** + **Vite 5** (fast dev & build)
- **Tailwind CSS 3** (class-based dark mode, custom brand theme)
- **Framer Motion** (scroll reveals, hero illustration, scroll progress)
- **lucide-react** (tree-shaken icon registry for a lean bundle)

## Getting started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Sections implemented

Hero · Why Trimugo (process timeline) · Industries (15 interactive cards) · Solutions (18) ·
AI Solutions · Business Transformation Process (8-step roadmap) · Featured Products (14, with pricing & demo CTA) ·
Case Studies (problem → solution → tech → results + testimonial) · Knowledge Center (searchable) ·
Resources · Community · Careers · Contact (working form with success state) · Footer.

## Design system

- **Colors:** Deep Blue (primary), Indigo/Purple (secondary), Cyan (accent), neutral grays/charcoal.
- **Style:** glassmorphism, rounded components, whitespace, subtle motion — tuned to a Stripe/Linear/Vercel quality bar.
- **Dark & light mode:** persisted to `localStorage`, respects system preference, no flash on load.

## Structure

```
src/
  App.jsx                 # page composition
  context/ThemeContext.jsx
  data/content.js         # all copy & lists (data-driven sections)
  components/             # one file per section + shared (Icon, Reveal, SectionHeading…)
```

## Notes / next steps

The spec mentions dedicated industry/solution/product detail pages and app-style features
(Auth, Client Portal, Project Tracking, Blog CMS, Admin Panel). This deliverable is the
public marketing site (single page with anchored sections). To add multi-page routing,
drop in `react-router-dom` and split the per-item cards into routed detail pages — the
data in `content.js` is already structured for that.
