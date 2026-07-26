type SocialLinksProps = {
  github?: string | null
  linkedin?: string | null
  twitter?: string | null
  email?: string | null
}

/**
 * Text links rather than icon circles. The icons were carrying no information
 * a word doesn't carry better, and the handle itself is the useful part.
 */
function handleOf(url: string) {
  const trimmed = url.replace(/\/+$/, '')
  return trimmed.slice(trimmed.lastIndexOf('/') + 1)
}

const LINK =
  'inline-flex min-h-11 items-center font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink'

export default function SocialLinks({ github, linkedin, twitter, email }: SocialLinksProps) {
  const entries = [
    github && { label: 'GitHub', href: github, handle: handleOf(github) },
    linkedin && { label: 'LinkedIn', href: linkedin, handle: handleOf(linkedin) },
    twitter && { label: 'X', href: twitter, handle: handleOf(twitter) },
    email && { label: 'Email', href: `mailto:${email}`, handle: email },
  ].filter(Boolean) as { label: string; href: string; handle: string }[]

  if (entries.length === 0) return null

  return (
    <ul className="flex flex-col gap-1">
      {entries.map((e) => (
        <li key={e.label}>
          <a
            href={e.href}
            target={e.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={e.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            className={LINK}
          >
            <span className="text-muted">{e.label}</span>
            <span aria-hidden="true" className="mx-2 text-rule">/</span>
            {e.handle}
          </a>
        </li>
      ))}
    </ul>
  )
}
