import { escapeXml, excerpt } from '@/lib/blog'
import { getAbout, getPublishedPosts } from '@/lib/content'
import { FALLBACK_IDENTITY, absoluteUrl } from '@/lib/site'

/**
 * RSS 2.0, built from the database.
 *
 * Same reasoning as app/sitemap.ts, which this mirrors: `force-dynamic` because
 * a feed frozen at build time would describe whatever was published when the
 * image was built, and a degraded response beats a 500 — a reader that gets an
 * error drops the feed, whereas one that gets an empty channel simply comes
 * back later.
 *
 * **Every interpolated value goes through `escapeXml`.** XML is not HTML: one
 * unescaped `&` in one title makes the whole document not-well-formed, and a
 * strict reader rejects every entry rather than that one. That is why the
 * escaping is a tested function rather than trusted inline.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const [posts, about] = await Promise.all([
    getPublishedPosts().catch(() => []),
    getAbout().catch(() => null),
  ])

  const name = about?.name || FALLBACK_IDENTITY.name
  const title = `${name} — Writing`
  const description = 'Notes on building and running software.'
  const self = absoluteUrl('/blog/rss.xml')

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`)
      // pubDate must be RFC 822. A reader that cannot parse it either ignores
      // the date or drops the item, and neither failure is visible from here.
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : undefined

      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        // The guid is the permalink and never changes, so a reader does not
        // re-announce a post because its title was edited.
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        pubDate ? `      <pubDate>${escapeXml(pubDate)}</pubDate>` : null,
        `      <description>${escapeXml(post.summary || excerpt(post.body))}</description>`,
        ...post.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => `      <category>${escapeXml(t)}</category>`),
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(absoluteUrl('/blog'))}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
  ]
    .filter((line) => line !== '')
    .join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Short: a feed reader polling every few minutes should not be served an
      // hour-old copy of a post that has just gone up.
      'Cache-Control': 'public, max-age=0, s-maxage=600',
    },
  })
}
