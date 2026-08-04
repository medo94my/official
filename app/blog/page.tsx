import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import Reveal from '@/components/motion/Reveal'
import SectionHead from '@/components/SectionHead'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav from '@/components/layout/SiteNav'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import { getAbout, getPublishedPosts } from '@/lib/content'
import { FALLBACK_IDENTITY } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes on building and running software.',
  alternates: { types: { 'application/rss+xml': '/blog/rss.xml' } },
}

const NAV = [
  { href: '/#work', label: 'Work' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#services', label: 'Engagements' },
  { href: '/#contact', label: 'Contact' },
]

export default async function BlogIndexPage() {
  const [posts, about] = await Promise.all([getPublishedPosts(), getAbout()])
  const name = about?.name || FALLBACK_IDENTITY.name

  return (
    <>
      <SiteNav name={name} items={NAV} resume={about?.resume} />

      <main id="main">
        <Section>
          <Container>
            <SectionHead
              title="Writing"
              eyebrow={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
            />

            <p className="mt-4 max-w-measure text-body-lg text-foreground/85">
              Working notes rather than tutorials — the decisions, and what they cost.
            </p>

            <div className="mt-12">
              {posts.length === 0 ? (
                // Same rule as every other section: say nothing rather than
                // show a placeholder pretending there is something to read.
                <p className="text-body text-foreground-muted">
                  Nothing published yet.
                </p>
              ) : (
                posts.map((post, index) => (
                  <Reveal key={post.id} index={Math.min(index, 3)}>
                    <PostCard post={post} />
                  </Reveal>
                ))
              )}
            </div>

            {posts.length > 0 && (
              <p className="mt-12 border-t border-border pt-6 text-meta text-foreground-muted">
                <a href="/blog/rss.xml" className="underline decoration-border underline-offset-4 hover:decoration-foreground">
                  RSS
                </a>
              </p>
            )}
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
