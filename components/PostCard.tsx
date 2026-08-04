import Image from 'next/image'
import Link from 'next/link'
import { formatPostDate, parseTags, readingMinutes, tagSlug } from '@/lib/blog'
import type { PublicPost } from '@/lib/content'

/**
 * One post in a list.
 *
 * The whole card is not a link — the tags inside it are links too, and nesting
 * an anchor inside an anchor is invalid and behaves unpredictably. The title is
 * the link, stretched over the card with a pseudo-element so the large click
 * target survives without the nesting.
 */
export default function PostCard({ post }: { post: PublicPost }) {
  const tags = parseTags(post.tags)
  const date = formatPostDate(post.publishedAt)
  const minutes = readingMinutes(post.body)

  return (
    <article className="group relative border-t border-border py-8 first:border-t-0 first:pt-2">
      {post.coverImage && (
        <div className="relative mb-5 aspect-[2/1] overflow-hidden border border-border bg-background-subtle">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <p className="label tnum">
        {[date, minutes > 0 ? `${minutes} min read` : null].filter(Boolean).join('  ·  ')}
      </p>

      <h2 className="mt-2 text-h3">
        <Link
          href={`/blog/${post.slug}`}
          className="after:absolute after:inset-0 after:content-[''] hover:text-primary"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-3 max-w-measure text-body text-foreground/80">{post.summary}</p>

      {tags.length > 0 && (
        // Above the stretched link in the stacking order, or the card's own
        // anchor would swallow every tag click.
        <div className="relative z-10 mt-4 flex flex-wrap gap-x-3 gap-y-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tagSlug(tag)}`}
              className="font-mono text-meta text-foreground-muted hover:text-foreground"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}
