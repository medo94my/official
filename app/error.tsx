'use client'

import { useEffect } from 'react'
import Container from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'

/**
 * The route-level error boundary.
 *
 * Until now an unhandled render error — a database that stopped answering
 * mid-request, say — fell through to Next's built-in page, which is unstyled,
 * untranslated and says "Application error: a client-side exception has
 * occurred". That is a dead end wearing the wrong clothes.
 *
 * `error.tsx` must be a client component; that is a framework requirement, not
 * a choice. It renders inside the root layout, so the theme, fonts and skip
 * link are all still in place.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Server-side causes are already in the container logs; this is the client
    // half, which otherwise leaves no trace anywhere.
    console.error(error)
  }, [error])

  return (
    <main id="main" className="flex min-h-[70vh] items-center">
      <Container>
        <p className="label">Error</p>
        <h1 className="mt-4 max-w-[20ch] text-h1">Something went wrong here.</h1>
        <p className="mt-5 max-w-measure text-body-lg text-foreground/85">
          The page failed to load. Trying again often works — this is usually a
          request that timed out rather than anything permanently broken.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary-surface px-5 font-mono text-meta text-primary-foreground transition-colors duration-200 ease-standard hover:bg-primary-surface-hover"
          >
            Try again
          </button>
          <ButtonLink href="/" variant="secondary">
            Back to the homepage
          </ButtonLink>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-meta text-foreground-subtle">
            {/* The digest is the only handle that ties what the visitor saw to
                a line in the server log. No stack trace and no message: those
                can carry file paths and query fragments. */}
            reference {error.digest}
          </p>
        )}
      </Container>
    </main>
  )
}
