import { useLayoutEffect } from 'react'

/** Reuse the initial HTML so loading and recovery never become empty screens. */
export default function HomepageFallback({ content, failed = false }) {
  useLayoutEffect(() => {
    // A lazy scene can fail after the preloader has locked the document.
    // Restore native reading before this fallback is painted, including when
    // StrictMode replays effects or the privacy route replaces the journey.
    document.documentElement.classList.remove('uv-active', 'uv-locked')
    document.body.style.cursor = ''
    if (failed) window.scrollTo(0, 0)
  }, [failed])

  return (
    <>
      {failed && (
        <div className="site-recovery" role="status">
          <p>The interactive page could not load. You can still explore Trimugo below.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload to try again
          </button>
        </div>
      )}
      {/* Captured from this site's index.html before createRoot replaces it. */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </>
  )
}
