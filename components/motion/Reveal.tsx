'use client'

import type { ElementType, ReactNode } from 'react'
import { motionComponent } from './motionComponent'
import {
  distance as distanceTokens,
  staggerDelay,
  transition,
  viewport as viewportTokens,
  type DistanceToken,
  type StaggerToken,
  type ViewportToken,
} from '@/lib/motion'

type RevealProps = {
  children: ReactNode
  /** Stagger index. Delay is capped — see `stagger.maxIndex`. */
  index?: number
  /** Which stagger interval to use for `index`. */
  gap?: StaggerToken
  /** How far it travels. Defaults to the house rise. */
  distance?: DistanceToken
  /** How early it triggers relative to the viewport edge. */
  viewport?: ViewportToken
  /** Rendered element. Use this to avoid a wrapper div inside a list or dl. */
  as?: ElementType
  /** Anchor id. Passed through so a reveal can also be a scroll target. */
  id?: string
  className?: string
}

/**
 * A restrained fade-and-rise: the page settling, not performing.
 *
 * Reduced motion is NOT handled here, and deliberately not in CSS either —
 * Motion writes inline transforms per frame and never consults a CSS
 * transition. `<MotionConfig reducedMotion="user">` in app/providers.tsx
 * intercepts it for every motion element at once, dropping the translate and
 * leaving the opacity fade.
 */
export default function Reveal({
  children,
  index = 0,
  gap = 'base',
  distance = 'rise',
  viewport = 'default',
  as,
  id,
  className,
}: RevealProps) {
  const Component = motionComponent(as ?? 'div')

  return (
    <Component
      id={id}
      // Hook for the <noscript> override in app/layout.tsx — without it this
      // element is invisible when scripting is off. See the note there.
      data-reveal=""
      initial={{ opacity: 0, y: distanceTokens[distance] }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportTokens[viewport]}
      transition={{ ...transition.reveal, delay: staggerDelay(index, gap) }}
      className={className}
    >
      {children}
    </Component>
  )
}
