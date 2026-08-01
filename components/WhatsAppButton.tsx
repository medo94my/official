const MESSAGE = "Hello! I saw your portfolio and would like to discuss a project."

/**
 * Server component — the number comes from the About record, so it is editable
 * in the dashboard rather than baked into the client bundle at build time.
 *
 * Renders nothing when unset: a link to wa.me/undefined is worse than no link.
 * A bordered pill rather than a floating green circle — the circle read as a
 * third-party widget bolted onto the page.
 *
 * The shadow is a token, not an arbitrary value. The previous inline
 * `theme(colors.…)` call silently generated no CSS once colours moved to
 * custom properties, because theme() cannot resolve an alpha-value
 * placeholder into a usable colour.
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
      className="fixed bottom-5 right-5 z-sticky inline-flex min-h-11 items-center gap-2 border border-border-strong bg-surface-elevated px-4 font-mono text-meta text-foreground shadow-raised transition-colors duration-200 ease-standard hover:border-foreground hover:bg-foreground hover:text-background"
    >
      WhatsApp
      <span aria-hidden="true">→</span>
    </a>
  )
}
