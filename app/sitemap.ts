import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

/**
 * sitemap.xml, enumerating every case-study URL.
 *
 * Built from the database rather than a hardcoded list, which is the whole
 * point: a project added from the dashboard is in the sitemap on the next
 * crawl with nothing to remember to update. `force-dynamic` for the same
 * reason — a sitemap frozen at build time would describe whatever the content
 * was when the image was built.
 *
 * `lastModified` comes from the row's own `updatedAt`, so editing a case study
 * is a real signal to recrawl rather than the whole sitemap claiming to have
 * changed every time the container restarts.
 *
 * If the database is unreachable this returns the two static routes rather
 * than throwing: a 500 on /sitemap.xml tells a crawler the site is broken,
 * while a short sitemap just tells it there is less to read today.
 */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const roots: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/projects'), changeFrequency: 'monthly', priority: 0.8 },
  ]

  const projects = await getProjects().catch(() => [])

  return [
    ...roots,
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt,
      changeFrequency: 'yearly' as const,
      // Featured work is the work worth landing on. Everything else is still
      // listed; it is just not competing with the homepage.
      priority: project.featured ? 0.7 : 0.5,
    })),
  ]
}
