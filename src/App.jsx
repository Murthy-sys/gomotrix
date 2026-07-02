import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Hero from './components/Hero.jsx'

// Below-the-fold sections are code-split so the initial bundle stays small
// and the hero paints as fast as possible.
const WhyTrimugo = lazy(() => import('./components/WhyTrimugo.jsx'))
const Industries = lazy(() => import('./components/Industries.jsx'))
const Solutions = lazy(() => import('./components/Solutions.jsx'))
const AISolutions = lazy(() => import('./components/AISolutions.jsx'))
const Process = lazy(() => import('./components/Process.jsx'))
const Products = lazy(() => import('./components/Products.jsx'))
const Work = lazy(() => import('./components/Work.jsx'))
const KnowledgeCenter = lazy(() => import('./components/KnowledgeCenter.jsx'))
const Resources = lazy(() => import('./components/Resources.jsx'))
const Community = lazy(() => import('./components/Community.jsx'))
const Careers = lazy(() => import('./components/Careers.jsx'))
const CTABanner = lazy(() => import('./components/CTABanner.jsx'))
const Contact = lazy(() => import('./components/Contact.jsx'))
const Footer = lazy(() => import('./components/Footer.jsx'))

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-ink-900">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Suspense fallback={null}>
          <WhyTrimugo />
          <Industries />
          <Solutions />
          <AISolutions />
          <Process />
          <Products />
          <Work />
          <KnowledgeCenter />
          <Resources />
          <Community />
          <Careers />
          <CTABanner />
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}
