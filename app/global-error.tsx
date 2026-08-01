'use client'

/**
 * The last resort: an error thrown by the root layout itself.
 *
 * When this fires the layout never rendered, so there is no `<html>`, no font
 * variables and no stylesheet — this component has to supply its own document
 * shell, which is why it looks nothing like the rest of the codebase and why
 * the styles are inline. Tailwind classes here would resolve to nothing.
 *
 * In practice the only way to reach it is `generateMetadata` in the root layout
 * throwing, which means `getAbout()` threw despite its `.catch`. Rare, but the
 * alternative to handling it is a blank white page.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          // Onyx and ivory as literals. No stylesheet has loaded, so the custom
          // properties these normally come from do not exist yet.
          background: '#0C0C0E',
          color: '#ECE4D2',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        <div style={{ maxWidth: '38rem', padding: '0 1.5rem' }}>
          <div style={{ width: '4rem', height: '3px', background: '#C2A35C' }} />
          <h1 style={{ marginTop: '2rem', fontSize: '1.75rem', lineHeight: 1.2 }}>
            The site failed to start.
          </h1>
          <p style={{ marginTop: '1rem', lineHeight: 1.6, opacity: 0.8 }}>
            This is a server-side fault, not something you did. Reloading may
            work; if it does not, it is being logged.
          </p>
          <p style={{ marginTop: '2rem' }}>
            <a href="/" style={{ color: '#C2A35C' }}>
              Reload the homepage
            </a>
          </p>
          {error.digest && (
            <p style={{ marginTop: '2rem', fontSize: '0.8125rem', opacity: 0.55 }}>
              reference {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
