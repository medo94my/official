const MESSAGE = "Hello! I saw your portfolio and would like to discuss a project."

/**
 * Server component — the number comes from the About record, so it is editable
 * in the dashboard rather than baked into the client bundle at build time.
 *
 * Renders nothing when unset: a link to wa.me/undefined is worse than no link.
 * A bordered pill rather than a floating green circle — the circle read as a
 * third-party widget bolted onto the page.
 */
export default function WhatsAppButton({ number }: { number?: string | null }) {
  // wa.me wants bare digits. Accepting "+90 555 000 0000" in the dashboard and
  // normalising here beats making the owner remember the wire format.
  const digits = number?.replace(/\D/g, '')
  if (!digits) return null

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex min-h-11 items-center gap-2 border border-ink bg-paper px-4 font-mono text-meta text-ink shadow-[0_1px_0_0_theme(colors.ink)] transition-colors hover:bg-ink hover:text-paper"
    >
      WhatsApp
      <span aria-hidden="true">→</span>
    </a>
  )
}
