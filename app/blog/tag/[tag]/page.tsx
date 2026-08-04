import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostCard from '@/components/PostCard'
import Reveal from '@/components/motion/Reveal'
import SectionHead from '@/components/SectionHead'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav from '@/components/layout/SiteNav'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import { parseTags, tagSlug, tagsMatch } from '@/lib/blog'
import { getAbout, getPublishedPosts } from '@/lib/content'
import { FALLBACK_IDENTITY } from '@/lib/site'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/blog', label: 'Writing' },
  { href: '/#work', label: 'Work' },
  { href: '/#contact', label: 'Contact' },
]

/**
 * The tag as its author capitalised it, recovered from the posts themselves.
 *
 * The URL carries a slug, so `/blog/tag/next-js` has to become "Next.js" for
 * the heading — and only the stored tags know that. Title-casing the slug would
 * print "Next Js".
 */
async function resolveTag(slug: string) {
  const posts = await getPublishedPosts()
  const matching = posts.filter((post) => tagsMatch(post.tags, slug))
  const label = matching
    .flatMap((post) => parseTags(post.tags))
    .find((tag) => tagSlug(tag) === slug)
  return { posts: matching, label }
}

export async function generateMetadata({
  params,
}: {
  params: { tag: string }
}): Promise<Metadata> {
  const { label } = await resolveTag(params.tag)
  if (!label) notFound()
  return {
    title: `${label} — Writing`,
    description: `Posts tagged ${label}.`,
  }
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const [{ posts, label }, about] = await Promise.all([
    resolveTag(params.tag),
    getAbout(),
  ])

  // A tag with no published posts is not an empty page, it is a URL that does
  // not exist — otherwise every typo renders a real-looking page with nothing
  // on it, and crawlers index the lot.
  if (!label) notFound()

  const name = about?.name || FALLBACK_IDENTITY.name

  return (
    <>
      <SiteNav name={name} items={NAV} resume={about?.resume} />

      <main id="main">
        <Section>
          <Container>
            <SectionHead
              title={label}
              eyebrow={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
            />

            <div className="mt-12">
              {posts.map((post, index) => (
                <Reveal key={post.id} index={Math.min(index, 3)}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>

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
