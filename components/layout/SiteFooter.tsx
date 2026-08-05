import Link from 'next/link'
import type { NavItem } from '@/components/layout/SiteNav'

type SiteFooterProps = {
  name: string
  role: string
  email?: string | null
  phone?: string | null
  location?: string | null
  github?: string | null
  linkedin?: string | null
  twitter?: string | null
  resume?: string | null
  nav: NavItem[]
}

/**
 * The footer is the page's one dark surface, in both themes.
 *
 * Two reasons. It gives the page a definite end rather than trailing off into
 * the ground it started on. And it is the only place gold can be actual gold:
 * #C2A35C measures 1.91:1 on ivory and 8.08:1 on onyx, so the identity's
 * accent colour only ever appears at full strength here. Everywhere else in
 * the light theme it has to run as the derived bronze.
 */
export default function SiteFooter({
  name,
  role,
  email,
  phone,
  location,
  github,
  linkedin,
  twitter,
  resume,
  nav,
}: SiteFooterProps) {
  const socials = [
    { label: 'GitHub', href: github },
    { label: 'LinkedIn', href: linkedin },
    { label: 'X', href: twitter },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href))

  // Every direct method the record actually holds. `phone` in particular has
  // been stored and editable but unrendered — it is a contact route, and
  // hiding it behind a form loses enquiries.
  const direct = [
    email && { label: 'Email', value: email, href: `mailto:${email}` },
    phone && { label: 'Phone', value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}` },
    location && { label: 'Based in', value: location, href: null },
  ].filter(Boolean) as { label: string; value: string; href: string | null }[]

  const linkCls =
    'inline-flex min-h-11 items-center text-meta text-brand-ivory/75 underline decoration-brand-ivory/25 decoration-1 underline-offset-4 transition-colors hover:text-brand-ivory hover:decoration-brand-gold'

  return (
    // Fixed to the brand values rather than the theme tokens: this band is
    // onyx in both themes by design, so its contents cannot follow --foreground.
    <footer className="mt-24 bg-brand-onyx text-brand-ivory sm:mt-32">
      <div className="mx-auto w-full max-w-content px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-brand-gold" />
              {name}
            </p>
            <p className="mt-2 font-mono text-label uppercase tracking-[0.09em] text-brand-gold">
              {role}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-1">
            <h2 className="font-mono text-label uppercase tracking-[0.09em] text-brand-ivory/60">
              Sections
            </h2>
            <ul className="mt-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkCls}>
                    {item.label}
                  </a>
                </li>
              ))}
              {resume && (
                <li>
                  <a href={resume} className={linkCls}>
                    Résumé
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {direct.length > 0 && (
            <div className="lg:col-span-1">
              <h2 className="font-mono text-label uppercase tracking-[0.09em] text-brand-ivory/60">
                Direct
              </h2>
              <dl className="mt-3">
                {direct.map((row) => (
                  <div key={row.label}>
                    <dt className="sr-only">{row.label}</dt>
                    <dd>
                      {row.href ? (
                        <a href={row.href} className={linkCls}>
                          {row.value}
                        </a>
                      ) : (
                        <span className="inline-flex min-h-11 items-center text-meta text-brand-ivory/75">
                          {row.value}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {socials.length > 0 && (
            <div className="lg:col-span-1">
              <h2 className="font-mono text-label uppercase tracking-[0.09em] text-brand-ivory/60">
                Elsewhere
              </h2>
              <ul className="mt-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {s.label}
                      <span aria-hidden="true" className="ml-1.5 text-brand-ivory/40">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-brand-ivory/15 pt-6">
          <p className="font-mono text-label uppercase tracking-[0.09em] tnum text-brand-ivory/60">
            © {new Date().getFullYear()} {name}
          </p>
          {/* An in-page anchor, not a route change: it scrolls, and it also
              lands focus on the main landmark for keyboard users. */}
          <a
            href="#main"
            className="inline-flex min-h-11 items-center font-mono text-label uppercase tracking-[0.09em] text-brand-ivory/60 transition-colors hover:text-brand-gold"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
