import Logo from './Logo.jsx'

// Full brand lockup: T-mark + TRIMUGO wordmark + tagline.
export default function BrandLockup({ markClass = 'h-10 w-10', tagline = true, className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Logo className={markClass} />
      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-lg font-bold uppercase tracking-[0.22em] text-ink-900 dark:text-white">
          Trimugo
        </span>
        {tagline && (
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
            Smart Solutions. Real Results.
          </span>
        )}
      </span>
    </span>
  )
}
