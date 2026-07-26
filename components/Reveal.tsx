'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  /** Stagger index — each step adds 100ms to the delay. */
  index?: number
  className?: string
  variant?: 'up' | 'scale'
}

/**
 * Scroll-triggered entrance animation.
 *
 * Exists so the page itself can stay a server component: framer-motion needs
 * client-side hooks, but only these wrappers do — the content inside them is
 * still rendered on the server and present in the initial HTML.
 */
export default function Reveal({
  children,
  index = 0,
  className,
  variant = 'up',
}: RevealProps) {
  const initial = variant === 'scale' ? { opacity: 0, scale: 0.9 } : { opacity: 0, y: 30 }
  const animate = variant === 'scale' ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
