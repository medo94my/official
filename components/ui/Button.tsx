import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'quiet'
type Size = 'base' | 'sm'

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono ' +
  'transition-colors duration-200 ease-standard disabled:pointer-events-none disabled:opacity-50'

const VARIANT: Record<Variant, string> = {
  /** The one filled action per view. Maroon, which passes on both grounds. */
  primary:
    'bg-primary-surface text-primary-foreground hover:bg-primary-surface-hover',
  /** Outlined. Borders strengthen on hover rather than filling. */
  secondary:
    'border border-border-strong text-foreground hover:border-foreground hover:bg-surface',
  /** Text-only, for tertiary actions that still need a target size. */
  quiet:
    'text-foreground underline decoration-border decoration-1 underline-offset-4 hover:decoration-foreground',
}

// min-h-11 is 44px — the touch target floor, kept even on the small size.
const SIZE: Record<Size, string> = {
  base: 'min-h-11 px-5 text-meta',
  sm: 'min-h-11 px-3 text-meta',
}

type SharedProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

function classes({ variant = 'primary', size = 'base', className }: SharedProps) {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]}${className ? ` ${className}` : ''}`
}

type ButtonProps = SharedProps & ComponentPropsWithoutRef<'button'>

export function Button({ children, variant, size, className, ...rest }: ButtonProps) {
  return (
    <button className={classes({ children, variant, size, className })} {...rest}>
      {children}
    </button>
  )
}

type ButtonLinkProps = SharedProps & {
  href: string
  /** Set for anything leaving the site; adds rel and the ↗ affordance. */
  external?: boolean
} & Omit<ComponentPropsWithoutRef<'a'>, 'href'>

/**
 * A link styled as a button.
 *
 * Separate from `Button` on purpose: navigation is an anchor and an action is
 * a button, and collapsing the two breaks middle-click, "open in new tab" and
 * the screen-reader announcement.
 */
export function ButtonLink({
  children,
  href,
  variant,
  size,
  className,
  external,
  ...rest
}: ButtonLinkProps) {
  const cls = classes({ children, variant, size, className })

  if (external || href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel="noopener noreferrer"
        className={cls}
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  )
}
