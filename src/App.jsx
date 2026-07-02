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
import Community from './components/Community.jsx'
import Careers from './components/Careers.jsx'
import CTABanner from './components/CTABanner.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-ink-900">
      <ScrollProgress />
      <Navbar />
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
        <Community />
        <Careers />
        <CTABanner />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
