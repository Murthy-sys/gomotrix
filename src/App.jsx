import { Component, Suspense, lazy, useState, useEffect } from 'react'
import HomepageFallback from './components/HomepageFallback.jsx'

// The journey is the site. It is a large bundle (three.js + postprocessing), so
// it is loaded lazily — which also means the privacy route below never pulls a
// byte of WebGL down just to render a page of text.
const Universe = lazy(() => import('./universe/Universe.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))

class RouteErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return <HomepageFallback content={this.props.fallbackContent} failed />
    }
    return this.props.children
  }
}

function useHashRoute() {
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App({ fallbackContent }) {
  const hash = useHashRoute()

  // Two routes only. #/privacy is the legal page; everything else — including
  // in-page anchors like #work and #contact — is the journey, which handles its
  // own scrolling through Lenis.
  const isPrivacy = /^#\/privacy\b/.test(hash)

  return (
    <RouteErrorBoundary key={isPrivacy ? 'privacy' : 'home'} fallbackContent={fallbackContent}>
      <Suspense fallback={<HomepageFallback content={fallbackContent} />}>
        {isPrivacy ? <Privacy /> : <Universe />}
      </Suspense>
    </RouteErrorBoundary>
  )
}
