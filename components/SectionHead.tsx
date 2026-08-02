import Link from 'next/link'

type SectionHeadProps = {
  id?: string
  title: string
  /** Short qualifier shown on the right — a count, a cadence, a scope. */
  eyebrow?: string
  /** Optional action on the right, e.g. "All work". Replaces the eyebrow. */
  action?: { href: string; label: string }
}

/**
 * Section heading.
 *
 * Sans, not mono: monospace headings were the single largest reason the page
 * read as a printed document. Mono is still the voice of the eyebrow and of
 * every spec value beneath, which is where it earns its place.
 *
 * The gold tick is the only decoration — a fill, where gold measures 8:1 on
 * onyx, rather than gold text, which fails badly on ivory.
 */
export default function SectionHead({ id, title, eyebrow, action }: SectionHeadProps) {
  return (
    <div
      id={id}
      className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border-strong pb-3"
    >
      <h2 className="flex items-baseline gap-3 text-h2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 translate-y-[-0.15em] bg-accent-surface"
        />
        {title}
      </h2>

      {action ? (
        <Link
          href={action.href}
          className="group inline-flex min-h-11 items-center gap-2 font-mono text-meta text-primary underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-primary"
        >
          {action.label}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 ease-standard group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      ) : (
        eyebrow && <span className="label">{eyebrow}</span>
      )}
    </div>
  )
}
