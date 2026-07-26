import type { Metadata } from 'next'
import ProjectEntry from '@/components/ProjectEntry'
import Reveal from '@/components/Reveal'
import SectionHead from '@/components/SectionHead'
import SiteRail from '@/components/SiteRail'
import { getAbout, getProjects, rankProjects } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Every project, with the engineering properties of each.',
}

const FALLBACK = { name: 'Ahmet Yilmaz', title: 'Full-Stack Developer' }

export default async function ProjectsPage() {
  const [projects, about] = await Promise.all([getProjects(), getAbout()])
  const ranked = rankProjects(projects)

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
      <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-14">
        <div className="pt-12 sm:pt-16">
          <SiteRail
            name={about?.name || FALLBACK.name}
            role={about?.title || FALLBACK.title}
            location={about?.location}
            email={about?.email}
            github={about?.github}
            linkedin={about?.linkedin}
            twitter={about?.twitter}
            index={[]}
            backTo={{ href: '/', label: 'Back to overview' }}
          />
        </div>

        <main className="pt-12 sm:pt-16">
          <h1 className="font-mono text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.5rem]">
            Work
          </h1>
          <p className="mt-5 max-w-measure text-[0.9375rem] leading-relaxed text-ink/80">
            Everything, newest and most substantial first. Each entry lists the properties
            that actually matter for it — how it retries, what it deduplicates on, what it
            refuses to fetch.
          </p>

          <section className="pt-14 sm:pt-16">
            <SectionHead
              title="Index"
              eyebrow={`${ranked.length} ${ranked.length === 1 ? 'entry' : 'entries'}`}
            />

            {ranked.length === 0 ? (
              <p className="text-meta text-muted">
                No projects yet. Add them from the dashboard.
              </p>
            ) : (
              ranked.map((project, index) => (
                <Reveal key={project.id} index={Math.min(index, 3)}>
                  <ProjectEntry index={index} {...project} />
                </Reveal>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
