import { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Hero from './components/Hero.jsx'
import WhyTrimugo from './components/WhyTrimugo.jsx'
import Industries from './components/Industries.jsx'
import Solutions from './components/Solutions.jsx'
import AISolutions from './components/AISolutions.jsx'
import Process from './components/Process.jsx'
import Products from './components/Products.jsx'
import Work from './components/Work.jsx'
import KnowledgeCenter from './components/KnowledgeCenter.jsx'
import Resources from './components/Resources.jsx'
// import Community from './components/Community.jsx' // hidden for now
// import Careers from './components/Careers.jsx' // hidden for now
import CTABanner from './components/CTABanner.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Article from './components/Article.jsx'
import { articles } from './data/content.js'

function useHashRoute() {
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()
  const match = hash.match(/^#\/insights\/([\w-]+)/)
  const article = match ? articles.find((a) => a.slug === match[1]) : null

  // Scroll behavior on route/hash change: top for articles, to the anchor for
  // section links, top otherwise.
  useEffect(() => {
    if (article) {
      window.scrollTo(0, 0)
    } else if (hash && !hash.startsWith('#/')) {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView()
      else window.scrollTo(0, 0)
    }
  }, [hash, article])

  return (
    <div className="min-h-screen bg-white dark:bg-ink-900">
      <ScrollProgress />
      <Navbar />
      {article ? (
        <main>
          <Article article={article} />
        </main>
      ) : (
        <main>
          <Hero />
          <WhyTrimugo />
          <Industries />
          <Solutions />
          <AISolutions />
          <Process />
          <Products />
          <Work />
          <KnowledgeCenter />
          <Resources />
          {/* <Community /> hidden for now */}
          {/* <Careers /> hidden for now */}
          <CTABanner />
          <Contact />
        </main>
      )}
      <Footer />
    </div>
  )
}
