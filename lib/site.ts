/**
 * Absolute site origin.
 *
 * Needed by more than metadata now — robots.txt, the sitemap and the JSON-LD
 * graph all have to emit absolute URLs, and a sitemap listing `localhost` is
 * worse than no sitemap. It is a `NEXT_PUBLIC_*` build arg (see
 * docker-compose.yml) because it is inlined into the client bundle; there is
 * nothing secret about it.
 *
 * The localhost default is a development convenience and a deliberate one: it
 * makes a misconfigured deploy obvious in the sitemap rather than silently
 * producing a plausible-looking wrong domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/$/, '')

/** Joins a path onto the origin. Leading slash optional. */
export function absoluteUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Used wherever the site must name itself before the database has been read —
 * metadata fallbacks, the manifest, the OG image. The About record overrides
 * these everywhere it is available.
 */
export const FALLBACK_IDENTITY = {
  name: 'Ahmet Yilmaz',
  title: 'Full-Stack Developer',
} as const
