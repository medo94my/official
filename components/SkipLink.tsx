/**
 * Skip link.
 *
 * Positioned off-screen rather than hidden with `display: none` — a hidden
 * element is not focusable, which defeats the purpose. It becomes visible the
 * moment it takes focus.
 */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:inline-flex focus:min-h-11 focus:items-center focus:border focus:border-border-strong focus:bg-surface-elevated focus:px-4 focus:font-mono focus:text-meta focus:text-foreground focus:shadow-lifted"
    >
      Skip to content
    </a>
  )
}
