import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import PostBody from '@/components/PostBody'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav from '@/components/layout/SiteNav'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import { formatPostDate, parseTags, readingMinutes, tagSlug } from '@/lib/blog'
import { getAbout, getPostBySlug } from '@/lib/content'
import { FALLBACK_IDENTITY, absoluteUrl } from '@/lib/site'
import { postSchema } from '@/lib/structured-data'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/blog', label: 'Writing' },
  { href: '/#work', label: 'Work' },
  { href: '/#contact', label: 'Contact' },
]

/**
 * `notFound()` belongs here as well as in the component.
 *
 * Next resolves `generateMetadata` before the page body, so without it a
 * missing post would render a `<title>` from the fallback metadata and only
 * then 404 — and the same call in the component alone is not enough, which is
 * the reason documented at length on the case-study route.
 *
 * `getPostBySlug` returns null for a draft as well as for a missing slug, so a
 * draft URL is indistinguishable from one that never existed.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const url = absoluteUrl(`/blog/${post.slug}`)
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      url,
      publishedTime: post.publishedAt ?? undefined,
    },
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const [post, about] = await Promise.all([getPostBySlug(params.slug), getAbout()])
  if (!post) notFound()

  const name = about?.name || FALLBACK_IDENTITY.name
  const tags = parseTags(post.tags)
  const date = formatPostDate(post.publishedAt)
  const minutes = readingMinutes(post.body)

  return (
    <>
      <JsonLd data={postSchema(post, about, FALLBACK_IDENTITY.name)} />

      <SiteNav name={name} items={NAV} resume={about?.resume} />

      <main id="main">
        <Section>
          <Container>
            <article>
              <header>
                <p className="label tnum">
                  {[date, minutes > 0 ? `${minutes} min read` : null]
                    .filter(Boolean)
                    .join('  ·  ')}
                </p>

                <h1 className="mt-3 max-w-[22ch] text-display text-foreground">
                  {post.title}
                </h1>

                <p className="mt-5 max-w-measure text-body-lg text-foreground/85">
                  {post.summary}
                </p>

                {post.coverImage && (
                  <div className="relative mt-10 aspect-[2/1] overflow-hidden border border-border bg-background-subtle">
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 960px"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
              </header>

              <div className="mt-12">
                <PostBody markdown={post.body} />
              </div>

              {tags.length > 0 && (
                <footer className="mt-14 border-t border-border pt-6">
                  <p className="label mb-3">Tagged</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tagSlug(tag)}`}
                        className="font-mono text-meta text-foreground-muted underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </footer>
              )}
            </article>

            <p className="mt-12 border-t border-border pt-6">
              <Link
                href="/blog"
                className="font-mono text-meta text-primary underline decoration-border underline-offset-4 hover:decoration-primary"
              >
                ← All writing
              </Link>
            </p>
          </Container>
        </Section>
      </main>

      <SiteFooter
        name={name}
        role={about?.title || FALLBACK_IDENTITY.title}
        email={about?.email}
        phone={about?.phone}
        location={about?.location}
        github={about?.github}
        linkedin={about?.linkedin}
        twitter={about?.twitter}
        resume={about?.resume}
        nav={NAV}
      />
    </>
  )
}
