import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CaseStudyBlock from '@/components/CaseStudyBlock'
import JsonLd from '@/components/JsonLd'
import ProjectGallery from '@/components/ProjectGallery'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav from '@/components/layout/SiteNav'
import ScrollRail from '@/components/motion/ScrollRail.client'
import Container from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import {
  getAbout,
  getProjectBySlug,
  hasBlockContent,
  hasCaseStudy,
} from '@/lib/content'
import { projectSchema } from '@/lib/structured-data'

export const dynamic = 'force-dynamic'

const FALLBACK = { name: 'Ahmet Yilmaz', title: 'Full-Stack Developer' }

const NAV = [
  { href: '/#work', label: 'Work' },
  { href: '/#services', label: 'Engagements' },
  { href: '/#contact', label: 'Contact' },
]

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)

  // notFound() belongs here as well as in the component, so the <title> and
  // OG tags of a missing project are the 404's rather than a half-built page's.
  // getProjectBySlug is React-cached, so the component's own lookup reuses this
  // query rather than repeating it.
  //
  // What actually makes the response a real 404 is the *absence* of a
  // `loading.tsx` above this route — see the note in app/layout.tsx. Throwing
  // here is not enough on its own: Next resolves generateMetadata inside the
  // same render pass, so if the shell has already flushed the status is stuck
  // at 200 either way.
  if (!project) notFound()

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.description,
      // The project screenshot is deliberately not the card. `Project.image`
      // is a free-form URL to whatever the owner had — arbitrary aspect ratios,
      // sometimes a remote host — and social platforms crop it to 1.91:1 with
      // no say in where. opengraph-image.tsx renders a card at exactly that
      // ratio, with the title legible at thumbnail size. The screenshot is on
      // the page, where it can be shown at its own proportions.
    },
  }
}

/**
 * A project in full.
 *
 * Every case-study field is optional, and each block hides itself when empty.
 * With none of them filled in — which is how every project ships — this page
 * degrades to exactly the title, description, spec grid, tags and links that
 * the index entry already shows. That is deliberate: the route is always
 * valid, so a link to it is never broken, but the index only offers the link
 * when there is genuinely more to read.
 */
export default async function CaseStudyPage({
  params,
}: {
  params: { slug: string }
}) {
  const [project, about] = await Promise.all([
    getProjectBySlug(params.slug),
    getAbout(),
  ])

  if (!project) notFound()

  const name = about?.name || FALLBACK.name
  const role = about?.title || FALLBACK.title

  // Order is the order a reader needs it in: what was wrong, who for, where it
  // sat, what constrained it, who did what, how it was built, what it cost,
  // what came of it. Declared as data rather than thirteen JSX calls so the
  // scroll rail can be built from the same list — see `rendered` below.
  const blocks = [
    { id: 'problem', heading: 'Problem', body: project.problem },
    { id: 'audience', heading: "Who it's for", body: project.audience },
    { id: 'context', heading: 'Context', body: project.context },
    { id: 'constraints', heading: 'Constraints', items: project.constraints },
    { id: 'role', heading: 'My role', body: project.myRole },
    { id: 'responsibilities', heading: 'Responsibilities', items: project.responsibilities },
    { id: 'approach', heading: 'Approach', body: project.approach },
    { id: 'decisions', heading: 'Key decisions', pairs: project.keyDecisions },
    { id: 'challenges', heading: 'Challenges', items: project.challenges },
    { id: 'tradeoffs', heading: 'Trade-offs', pairs: project.tradeoffs },
    { id: 'outcome', heading: 'Outcome', body: project.outcome },
    { id: 'lessons', heading: 'Lessons', items: project.lessons },
    { id: 'properties', heading: 'Properties', pairs: project.specs },
  ]

  // Each block hides itself when empty, so the rail is derived from the same
  // predicate rather than from the full list — otherwise a page with two blocks
  // filled in would show thirteen ticks, eleven of them pointing at nothing.
  const railIds = blocks.filter(hasBlockContent).map((block) => block.id)

  return (
    <>
      {/* Only when there is a write-up. Marking up a title and two links as a
          CreativeWork tells a search engine there is an article here; landing
          on a summary instead is exactly the mismatch structured-data guidance
          warns about. */}
      {hasCaseStudy(project) && (
        <JsonLd data={projectSchema(project, about, FALLBACK.name)} />
      )}

      <SiteNav
        name={name}
        items={NAV}
        cta={{ href: '/#contact', label: 'Start a project' }}
        resume={about?.resume}
      />

      {/* Only worth a rail when there is enough to scroll through. Below this
          the page is one screen of summary and the rail would be a gauge
          reading full. */}
      {railIds.length >= 4 && <ScrollRail sectionIds={railIds} />}

      <main id="main" tabIndex={-1} className="outline-none">
        <Container>
          <div className="pt-14 sm:pt-20">
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center gap-2 font-mono text-meta text-foreground-muted transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">←</span>
              All work
            </Link>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h1 className="text-h1">{project.title}</h1>
              {project.status && <span className="label">{project.status}</span>}
            </div>

            <p className="mt-5 max-w-measure text-body-lg text-foreground/85">
              {project.description}
            </p>

            {(project.githubUrl || project.liveUrl || project.caseStudyUrl) && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {project.liveUrl && (
                  <ButtonLink href={project.liveUrl} external>
                    Live site
                    <span aria-hidden="true">↗</span>
                  </ButtonLink>
                )}
                {project.githubUrl && (
                  <ButtonLink href={project.githubUrl} variant="secondary" external>
                    Source
                    <span aria-hidden="true">↗</span>
                  </ButtonLink>
                )}
                {project.caseStudyUrl && (
                  <ButtonLink href={project.caseStudyUrl} variant="quiet" external>
                    Full write-up
                    <span aria-hidden="true">↗</span>
                  </ButtonLink>
                )}
              </div>
            )}

            {project.image && (
              <div className="relative mt-10 aspect-[16/9] overflow-hidden border border-border bg-background-subtle">
                <Image
                  src={project.image}
                  alt={`Screenshot of ${project.title}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 960px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>

          <div className="mt-12 sm:mt-16">
            {/* Above the written blocks on purpose. Someone who opens a case
                study wants to see the thing before they read about it, and for
                a CLI tool the clip is the only evidence a still cannot give. */}
            <ProjectGallery media={project.media} />

            {blocks.map((block) => (
              <CaseStudyBlock key={block.id} {...block} />
            ))}

            {project.tags.length > 0 && (
              <section className="border-t border-border py-8 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-10">
                <h2 className="label pt-1">Built with</h2>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 sm:mt-0">
                  {project.tags.map((tag) => (
                    <li key={tag} className="font-mono text-meta text-foreground-muted">
                      {tag}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!hasCaseStudy(project) && (
              <p className="border-t border-border py-8 text-meta text-foreground-subtle">
                A longer write-up for this project hasn&apos;t been added yet.
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-border-strong pt-6">
            <ButtonLink href="/#contact">
              Discuss a project like this
              <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </Container>
      </main>

      <SiteFooter
        name={name}
        role={role}
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
