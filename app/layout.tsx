import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { getAbout } from '@/lib/content'

// IBM Plex was designed for technical and engineering contexts, which is the
// subject here. The mono is the display face, not just the code face.
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
      images: [{ url: '/og.png', width: 1200, height: 630, alt: `${name} — ${title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${title}`,
      description,
      images: ['/og.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
