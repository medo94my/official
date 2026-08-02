'use client'

import { Children, type ElementType, type ReactNode } from 'react'
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

type StaggeredListProps = {
  children: ReactNode
  /** Rendered element for the container — `ol`, `ul`, `dl`, `div`. */
  as?: ElementType
  /** Rendered element for each child wrapper. Must be valid inside `as`. */
  itemAs?: ElementType
  gap?: StaggerToken
  distance?: DistanceToken
  viewport?: ViewportToken
  className?: string
  itemClassName?: string
}

const HIDDEN = 'hidden'
const VISIBLE = 'visible'

/**
 * Reveals children in sequence as the container enters the viewport.
 *
 * The parent owns the `whileInView` trigger and the children inherit the
 * variant change, so the sequence is keyed to the list arriving rather than to
 * each row crossing the fold independently — which on a short list would fire
 * them all at once anyway, and on a long one would animate rows the reader has
 * already scrolled past.
 *
 * The interval is an explicit per-item `delay` from `staggerDelay()` rather
 * than the parent's `staggerChildren`. `staggerChildren` has no ceiling: on a
 * twenty-row list the last row waits 1.2s, which reads as a stall, not
 * choreography. `staggerDelay()` clamps at `stagger.maxIndex`, so the tail
 * lands together instead of trailing off. It is also the same helper `Reveal`
 * uses, so a staggered list and a sequence of individual reveals are timed
 * identically.
 */
export default function StaggeredList({
  children,
  as = 'div',
  itemAs = 'div',
  gap = 'base',
  distance = 'rise',
  viewport = 'default',
  className,
  itemClassName,
}: StaggeredListProps) {
  const Container = motionComponent(as)
  const Item = motionComponent(itemAs)

  return (
    <Container
      initial={HIDDEN}
      whileInView={VISIBLE}
      viewport={viewportTokens[viewport]}
      // An empty parent variant still propagates the state change to children;
      // it exists purely as the orchestration handle.
      variants={{ [HIDDEN]: {}, [VISIBLE]: {} }}
      className={className}
    >
      {Children.map(children, (child, i) => (
        <Item
          // See the <noscript> override in app/layout.tsx.
          data-reveal=""
          variants={{
            [HIDDEN]: { opacity: 0, y: distanceTokens[distance] },
            [VISIBLE]: {
              opacity: 1,
              y: 0,
              transition: { ...transition.reveal, delay: staggerDelay(i, gap) },
            },
          }}
          className={itemClassName}
        >
          {child}
        </Item>
      ))}
    </Container>
  )
}
