// Lightweight reveal wrapper — pure CSS, no JS animation library.
// Content is visible by default; the fade-up is a progressive enhancement that
// can never leave content stuck hidden (unlike a JS/observer-driven reveal).
export default function Reveal({ children, i = 0, className = '', as: Tag = 'div' }) {
  return (
    <Tag
      className={`animate-fade-up ${className}`}
      style={{ animationDelay: `${Math.min(i * 0.05, 0.25)}s` }}
    >
      {children}
    </Tag>
  )
}
