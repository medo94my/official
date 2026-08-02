import type { ElementType, ReactNode } from 'react'

type ProseProps = {
  children: ReactNode
  /** `lead` for the paragraph directly under a heading. */
  size?: 'lead' | 'body'
  as?: ElementType
  className?: string
}

const SIZE = {
  lead: 'text-body-lg text-foreground/85',
  body: 'text-body text-foreground/80',
} as const

/**
 * Body copy at a readable measure.
 *
 * The 68ch cap is the whole point — long project descriptions running the full
 * grid width are the fastest way to make a page unreadable on a wide display.
 * Slightly-under-full-strength ink keeps prose from competing with headings
 * without dropping to a muted grey that fails contrast.
 */
export default function Prose({
  children,
  size = 'body',
  as: Component = 'p',
  className,
}: ProseProps) {
  return (
    <Component
      className={`max-w-measure ${SIZE[size]}${className ? ` ${className}` : ''}`}
    >
      {children}
    </Component>
  )
}
