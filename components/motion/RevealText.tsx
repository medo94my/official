'use client'

import { motion } from 'motion/react'
import { useEffect, useState, type ElementType } from 'react'
import { distance, ease, duration, stagger } from '@/lib/motion'

type RevealTextProps = {
  text: string
  as?: ElementType
  /** Stagger unit. Lines read calmer for a headline; words feel busier. */
  by?: 'word' | 'line'
  /** Seconds to wait before the first unit appears. */
  delay?: number
  className?: string
}

/**
 * Reveals a headline by word or line.
 *
 * The whole string is rendered as plain text on the server and for the first
 * client paint, then swapped for the split spans after mount. That ordering is
 * the point: crawlers, no-JS visitors and the LCP measurement all see the
 * complete headline immediately, and the animation is decoration layered on
 * afterwards rather than a gate in front of the content.
 *
 * The split version keeps a visually-hidden copy of the full string and hides
 * the animated spans, so a screen reader reads one sentence instead of thirty
 * fragments.
 *
 * That copy replaced an `aria-label` on the wrapper, which an accessibility
 * audit caught: `aria-label` is only honoured on elements with a role that
 * supports a name, and a bare `<span>` has none. The attribute was silently
 * ignored, so the label did nothing and the fragments were what got read —
 * the exact failure the attribute was there to prevent.
 */
export default function RevealText({
  text,
  as: Component = 'span',
  by = 'word',
  delay = 0,
  className,
}: RevealTextProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Component className={className}>{text}</Component>
  }

  const units = by === 'line' ? text.split('\n') : text.split(' ')

  return (
    <Component className={className}>
      <span className="sr-only">{text}</span>
      {units.map((unit, i) => (
        <span
          key={`${unit}-${i}`}
          aria-hidden="true"
          // inline-block so the transform applies; the trailing space is a
          // separate node so words still wrap and select normally.
          className="inline-block"
        >
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: distance.lift }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.slow,
              ease: ease.entrance,
              delay: delay + Math.min(i, stagger.maxIndex * 2) * stagger.tight,
            }}
          >
            {unit}
          </motion.span>
          {i < units.length - 1 && by === 'word' ? ' ' : null}
        </span>
      ))}
    </Component>
  )
}
