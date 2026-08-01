import type { ReactNode } from 'react'

type SectionProps = {
  children: ReactNode
  /** Anchor target. Also what the nav's active-section tracking observes. */
  id?: string
  /**
   * `tight` for a block that continues the one above it, `base` for a normal
   * section break, `loose` to mark a change of subject.
   */
  spacing?: 'tight' | 'base' | 'loose'
  /** Accessible name, when the section's own heading isn't the right label. */
  'aria-label'?: string
  className?: string
}

const SPACING = {
  tight: 'pt-10 sm:pt-12',
  base: 'pt-16 sm:pt-20',
  loose: 'pt-20 sm:pt-28',
} as const

/**
 * Vertical rhythm between page sections.
 *
 * Padding rather than margin so anchor navigation lands above the heading
 * instead of flush against it, and so adjacent sections cannot collapse their
 * spacing into each other.
 */
export default function Section({
  children,
  id,
  spacing = 'base',
  className,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      // Anchor links jump here; without this the sticky header covers the
      // heading. Matches the header height plus a little breathing room.
      className={`scroll-mt-24 ${SPACING[spacing]}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </section>
  )
}
