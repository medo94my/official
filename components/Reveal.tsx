'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  /** Stagger index — each step adds 60ms. Cap it at the call site. */
  index?: number
  className?: string
}

/**
 * A restrained fade-and-rise. Deliberately small: in a spec-sheet register,
 * motion should feel like the page settling, not performing. `prefers-reduced-
 * motion` is neutralised globally in globals.css.
 */
export default function Reveal({ children, index = 0, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
