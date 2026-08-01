import type { Metadata } from 'next'
import Link from 'next/link'
import ProjectEntry from '@/components/ProjectEntry'
import Reveal from '@/components/motion/Reveal'
import SectionHead from '@/components/SectionHead'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav from '@/components/layout/SiteNav'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import { getAbout, getProjects, rankProjects } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Every project, with the engineering properties of each.',
}

const FALLBACK = { name: 'Ahmet Yilmaz', title: 'Full-Stack Developer' }

// The section anchors live on the homepage, so from here they are absolute.
const NAV = [
  { href: '/#work', label: 'Work' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#services', label: 'Engagements' },
  { href: '/#contact', label: 'Contact' },
]

export default async function ProjectsPage() {
  const [projects, about] = await Promise.all([getProjects(), getAbout()])
  const ranked = rankProjects(projects)

  const name = about?.name || FALLBACK.name
  const role = about?.title || FALLBACK.title

  return (
    <>
      <SiteNav
        name={name}
        items={NAV}
        cta={{ href: '/#contact', label: 'Start a project' }}
        resume={about?.resume}
      />

      <main id="main" tabIndex={-1} className="outline-none">
        <Container>
          <div className="pt-14 sm:pt-20">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 font-mono text-meta text-foreground-muted transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">←</span>
              Back to overview
            </Link>

            <h1 className="mt-4 text-h1">Work</h1>
            <p className="mt-5 max-w-measure text-body-lg text-foreground/85">
              Everything, newest and most substantial first. Each entry lists the
              properties that actually matter for it — how it retries, what it
              deduplicates on, what it refuses to fetch.
            </p>
          </div>

          <Section spacing="tight">
            <SectionHead
              title="Index"
              eyebrow={`${ranked.length} ${ranked.length === 1 ? 'entry' : 'entries'}`}
            />

            {ranked.length === 0 ? (
              <p className="text-meta text-foreground-muted">
                No projects yet. Add them from the dashboard.
              </p>
            ) : (
              ranked.map((project, index) => (
                <Reveal key={project.id} index={Math.min(index, 3)}>
                  <ProjectEntry index={index} {...project} />
                </Reveal>
              ))
            )}
          </Section>
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
