import Link from 'next/link'
import SocialLinks from '@/components/SocialLinks'

type RailProps = {
  name: string
  role: string
  location?: string | null
  email?: string | null
  github?: string | null
  linkedin?: string | null
  twitter?: string | null
  /** Section anchors for this page, in document order. */
  index: { href: string; label: string }[]
  /** Shown instead of the index on a sub-page. */
  backTo?: { href: string; label: string }
}

/**
 * The margin rail: identity, a contents index, and where to find him.
 *
 * A datasheet annotates its margin, so the persistent information lives there
 * and the content column is left to the work. Sticky from `lg` up; above the
 * content on smaller screens.
 */
export default function SiteRail({
  name,
  role,
  location,
  email,
  github,
  linkedin,
  twitter,
  index,
  backTo,
}: RailProps) {
  return (
    <aside className="lg:sticky lg:top-12 lg:self-start">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center font-mono text-base font-semibold tracking-tight hover:underline hover:decoration-rule hover:underline-offset-4"
      >
        {name}
      </Link>
      <p className="label">{role}</p>
      {location && <p className="label mt-1">{location}</p>}

      <hr className="my-6 border-rule" />

      {backTo ? (
        <Link
          href={backTo.href}
          className="inline-flex min-h-11 items-center gap-2 font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 hover:decoration-ink"
        >
          <span aria-hidden="true">←</span>
          {backTo.label}
        </Link>
      ) : (
        <nav aria-label="Sections">
          <ol>
            {index.map((item, i) => (
              <li key={item.href} className="border-b border-rule last:border-b-0">
                <a
                  href={item.href}
                  className="group flex min-h-11 items-baseline gap-3 font-mono text-meta text-muted transition-colors hover:text-ink"
                >
                  <span className="label tnum group-hover:text-ink">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <hr className="my-6 border-rule" />

      <SocialLinks github={github} linkedin={linkedin} twitter={twitter} email={email} />
    </aside>
  )
}
