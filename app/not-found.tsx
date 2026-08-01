import Container from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'

export const metadata = {
  title: 'Page not found',
  // Belt and braces alongside the 404 status: whatever a crawler makes of the
  // response, it is told explicitly not to index this.
  robots: { index: false, follow: true },
}

/**
 * Shown for an unknown URL and for any `notFound()` call.
 *
 * No nav or footer: both need an About record, so rendering them here would
 * mean a database round trip on every scanner probing for /wp-admin.
 */
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[70vh] items-center">
      <Container>
        <p className="label">Error 404</p>
        <h1 className="mt-4 max-w-[20ch] text-h1">This page doesn&apos;t exist.</h1>
        <p className="mt-5 max-w-measure text-body-lg text-foreground/85">
          The link may be out of date, or the address slightly off.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href="/">Back to the homepage</ButtonLink>
          <ButtonLink href="/projects" variant="secondary">
            See the work
          </ButtonLink>
        </div>
      </Container>
    </main>
  )
}
