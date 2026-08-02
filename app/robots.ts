import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

/**
 * robots.txt.
 *
 * Until now there was none, so `/admin/login` and every `/api/*` route were
 * fair game for indexing — a login form in search results is a small invitation
 * to credential stuffing, and an indexed API route is just noise.
 *
 * `/admin` is already behind middleware and `/api` returns 401, so this is not
 * the control; it is the difference between "protected" and "protected and not
 * advertised". Anything that genuinely must not be reachable is guarded in
 * code, because robots.txt is a request, not a fence.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}
