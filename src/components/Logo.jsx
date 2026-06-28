export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="dl-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#243c6e" />
          <stop offset="1" stopColor="#16233f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#dl-logo)" />
      <path
        d="M20 18h12c8 0 14 6 14 14s-6 14-14 14H20V18zm8 8v20h4c4.4 0 8-3.6 8-8 0-4.4-3.6-8-8-8h-4z"
        fill="#fff"
      />
      {/* amber accent */}
      <circle cx="45" cy="45" r="5" fill="#f59e0b" />
    </svg>
  )
}
