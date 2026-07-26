/**
 * Renders nothing when `About.resume` is unset — an empty resume link is worse
 * than no button, because a hiring manager clicking it gets a 404.
 *
 * Set the URL in the admin dashboard (About → Resume). A file dropped in
 * `public/resume/` is referenced as `/resume/<filename>.pdf`.
 */
export default function ResumeButton({
  resume,
  name,
}: {
  resume?: string | null
  name?: string | null
}) {
  if (!resume) return null

  const isLocal = resume.startsWith('/')

  return (
    <a
      href={resume}
      // `download` only takes effect same-origin; for an external URL the
      // browser navigates instead, which is the correct fallback.
      download={isLocal ? `${(name || 'resume').replace(/\s+/g, '-')}-CV.pdf` : undefined}
      target={isLocal ? undefined : '_blank'}
      rel={isLocal ? undefined : 'noopener noreferrer'}
      className="inline-flex min-h-11 items-center gap-2 border border-ink px-4 font-mono text-meta text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      Résumé
      <span aria-hidden="true">↓</span>
    </a>
  )
}
