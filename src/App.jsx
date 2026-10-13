import { Component, Suspense, lazy, useState, useEffect, useLayoutEffect } from 'react'
import HomepageFallback from './components/HomepageFallback.jsx'

// The page loads independently; only the decorative hero loads WebGL.
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

function LoadedRoute({ children }) {
  useLayoutEffect(() => {
    // This commits only after the lazy route and its styles have loaded.
    window.dispatchEvent(new Event('trimugo:page-ready'))
  }, [])
  return children
}

export default function App({ fallbackContent }) {
  const hash = useHashRoute()

  // Two routes only. #/privacy is the legal page; everything else — including
  // in-page anchors like #work and #contact — stays on the homepage.
  const isPrivacy = /^#\/privacy\b/.test(hash)

  return (
    <RouteErrorBoundary key={isPrivacy ? 'privacy' : 'home'} fallbackContent={fallbackContent}>
      <Suspense fallback={<HomepageFallback content={fallbackContent} />}>
        <LoadedRoute>{isPrivacy ? <Privacy /> : <Universe />}</LoadedRoute>
      </Suspense>
    </RouteErrorBoundary>
  )
}
