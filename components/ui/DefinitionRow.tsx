import type { ReactNode } from 'react'

type DefinitionRowProps = {
  label: string
  children: ReactNode
  /** Narrower label column, for dense spec grids inside a project entry. */
  dense?: boolean
  className?: string
}

/**
 * One label/value row of a definition list.
 *
 * Must be rendered inside a <dl> — it emits a <dt>/<dd> pair wrapped in a grid
 * div, which is valid there and only there.
 *
 * Stacks below `sm` rather than shrinking the columns: a two-column grid at
 * 375px leaves neither side enough room, and the label reads fine as a
 * kicker above its value.
 */
export default function DefinitionRow({
  label,
  children,
  dense = false,
  className,
}: DefinitionRowProps) {
  return (
    <div
      className={`grid gap-1 border-b py-4 sm:gap-6 ${
        dense
          ? 'border-border/70 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4'
          : 'border-border sm:grid-cols-[9rem_1fr]'
      }${className ? ` ${className}` : ''}`}
    >
      <dt className="label pt-1">{label}</dt>
      <dd className="text-meta text-foreground/85">{children}</dd>
    </div>
  )
}
