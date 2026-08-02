import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import SkipLink from '@/components/SkipLink'
import { getAbout } from '@/lib/content'
import { themeColor } from '@/lib/tokens'

// IBM Plex was designed for technical and engineering contexts, which is the
// subject here. Sans carries display and headings; mono is reserved for
// metadata, spec values and code.
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * There is deliberately no `app/loading.tsx`, and adding one back would be a
 * regression.
 *
 * A loading file wraps every page below it in a Suspense boundary, so Next
 * flushes the shell — and commits HTTP 200 — before the page component runs.
 * `notFound()` in /projects/[slug] then arrives after the headers are already
 * sent, and Next's own `res.statusCode = 404` is a no-op: every unknown slug
 * answers 200 with the 404 page in the body, which is exactly what a crawler
 * indexes as a real page. Verified against a production build: with a root
 * loading.tsx an unknown slug returned 200, without it 404.
 *
 * The cost is small — both public routes are server-rendered per request off a
 * local database, so the fallback was visible for a fraction of a second on
 * client-side navigation only. If a loading state is wanted later, scope it to
 * a route group that contains no dynamic segment (e.g. app/projects/(index)/),
 * never to a segment that is an ancestor of [slug].
 */

// Fallbacks for a database that hasn't been seeded yet — the real values come
// from the About record so editing the CMS updates the page title and cards.
const FALLBACK_NAME = 'Ahmet Yilmaz'
const FALLBACK_TITLE = 'Full-Stack Developer'

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout().catch(() => null)

  const name = about?.name || FALLBACK_NAME
  const title = about?.title || FALLBACK_TITLE
  const description =
    about?.bio ||
    `${name} — ${title}. Building web applications across Python, PHP, JavaScript and TypeScript.`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} — ${title}`,
      template: `%s | ${name}`,
    },
    description,
    keywords: [name, title, 'Full-Stack Developer', 'Web Developer', 'Portfolio'],
    authors: [{ name }],
    creator: name,
    openGraph: {
      type: 'website',
      url: SITE_URL,
      siteName: `${name} — Portfolio`,
      title: `${name} — ${title}`,
      description,
      // No `images` here on purpose. Next fills both this and the Twitter card
      // from app/opengraph-image.tsx, which is generated from the same About
      // record as the text above. Naming a file would override that and put the
      // card back to something maintained by hand.
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${title}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

/**
 * Browser chrome follows the system scheme before any stylesheet applies.
 * Lives on `viewport`, not `metadata` — Next 14 deprecated the latter.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themeColor.light },
    { media: '(prefers-color-scheme: dark)', color: themeColor.dark },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning belongs on <html> and nowhere else: next-themes
    // stamps data-theme here before React hydrates, so this node legitimately
    // differs from the server output. Putting it on a subtree would mask real
    // mismatches.
    <html
      lang="en"
      className={`${mono.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Reveals are the one thing on this site that genuinely require
          JavaScript to *show* content rather than to enhance it. Motion
          serialises `initial` into the server HTML, so every revealed element
          arrives as `opacity:0;transform:translateY(8px)` and stays that way
          until hydration runs. On the case-study pages that is the whole
          article; with scripting off it would be a page of headings above
          nothing.

          The text is in the DOM either way, so this is not an indexing
          problem — it is a "someone browsing with NoScript sees a blank page"
          problem, and one rule fixes it. `!important` is load-bearing: it has
          to beat an inline style.

          This does not help if the JS loads but throws. Nothing declarative
          can. It covers the case that is both common and cheap to cover.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  )
}
