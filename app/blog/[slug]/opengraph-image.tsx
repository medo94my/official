import { ImageResponse } from 'next/og'
import { formatPostDate, parseTags, readingMinutes } from '@/lib/blog'
import { getPostBySlug } from '@/lib/content'
import {
  OgCard,
  OG_CONTENT_TYPE,
  OG_DESCRIPTION_MAX,
  OG_SIZE,
  clamp,
} from '@/lib/og'

/**
 * A link preview per post.
 *
 * A blog link is shared far more often than a project one — into Slack, into a
 * message, onto LinkedIn — and without this every post renders the same
 * site-wide card, so three posts in the same thread look identical.
 *
 * `getPostBySlug` returns null for a draft as well as for a missing slug, so a
 * leaked draft URL cannot render a card that reveals its title.
 */
export const dynamic = 'force-dynamic'
export const alt = 'Post'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function PostOpengraphImage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug).catch(() => null)

  // Deliberately not notFound(): a 404 here makes the *page* look broken to a
  // crawler that fetched the image after the page. A generic card is the better
  // failure — the same reasoning as the project card.
  if (!post) {
    return new ImageResponse(<OgCard title="Post not found" />, size)
  }

  const minutes = readingMinutes(post.body)
  const meta = [formatPostDate(post.publishedAt), minutes > 0 ? `${minutes} min read` : null]
    .filter(Boolean)
    .join('  ·  ')

  return new ImageResponse(
    (
      <OgCard
        eyebrow={parseTags(post.tags).slice(0, 3).join('  ·  ') || 'Writing'}
        title={clamp(post.title, 70)}
        description={clamp(post.summary, OG_DESCRIPTION_MAX)}
        meta={meta || undefined}
      />
    ),
    size
  )
}
