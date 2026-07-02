import { motion, useReducedMotion } from 'framer-motion'

// Lightweight reveal wrapper.
// Content is ALWAYS rendered visible (initial={false}) so it can never get
// stuck hidden behind a scroll observer on mobile. On capable devices we add a
// gentle fade-in on mount; reduced-motion devices get plain content instantly.
export default function Reveal({ children, i = 0, className = '', as = 'div' }) {
  const reduce = useReducedMotion()

  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
