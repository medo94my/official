import Link from 'next/link'

type SectionHeadProps = {
  id?: string
  title: string
  eyebrow?: string
  /** Optional action on the right, e.g. "All work". */
  action?: { href: string; label: string }
}

/** Section heading in the instrument voice: title left, meta or action right. */
export default function SectionHead({ id, title, eyebrow, action }: SectionHeadProps) {
  return (
    <div
      id={id}
      className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-3"
    >
      <h2 className="font-mono text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 hover:decoration-ink"
        >
          {action.label}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      ) : (
        eyebrow && <span className="label">{eyebrow}</span>
      )}
    </div>
  )
}
