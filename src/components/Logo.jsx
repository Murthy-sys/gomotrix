import { useId } from 'react'

export default function Logo({ className = 'h-9 w-9' }) {
  const uid = useId().replace(/:/g, '')
  const badge = `badge-${uid}`
  const gold = `gold-${uid}`
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={badge} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#243c6e" />
          <stop offset="1" stopColor="#16233f" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${badge})`} />
      <g fill={`url(#${gold})`}>
        <polygon points="11.9,14.2 52.1,14.2 47.7,20.2 15.2,20.2" />
        <polygon points="29.1,19.8 34.9,19.8 34.9,45.8 31.8,52 28.7,45.8" />
        <polygon points="19,22.4 27.8,22.4 26.9,29.9 22.5,29.9" />
        <polygon points="38,22.4 47.3,22.4 37.1,42.7" />
      </g>
    </svg>
  )
}
