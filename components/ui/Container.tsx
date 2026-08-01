import type { ElementType, ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  /**
   * `content` is the reading width for most of the site. `wide` is for the
   * full-bleed bands. `measure` caps at a comfortable line length and is for
   * standalone prose that isn't already inside a <Prose>.
   */
  size?: 'measure' | 'content' | 'wide'
  as?: ElementType
  className?: string
}

const SIZE = {
  measure: 'max-w-measure',
  content: 'max-w-content',
  wide: 'max-w-wide',
} as const

/**
 * Horizontal gutter and max width.
 *
 * The gutter is 20px at 320 rather than a round 24: the layout is measured at
 * 320px and must genuinely fit, since globals.css deliberately does not set
 * `overflow-x: hidden` to paper over it.
 */
export default function Container({
  children,
  size = 'content',
  as: Component = 'div',
  className,
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full px-5 sm:px-8 ${SIZE[size]}${className ? ` ${className}` : ''}`}
    >
      {children}
    </Component>
  )
}
