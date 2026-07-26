import Link from 'next/link'
import Contact from '@/components/Contact'
import IdeaSubmission from '@/components/IdeaSubmission'
import ProjectEntry from '@/components/ProjectEntry'
import ResumeButton from '@/components/ResumeButton'
import Reveal from '@/components/Reveal'
import SectionHead from '@/components/SectionHead'
import SiteRail from '@/components/SiteRail'
import StatsBar from '@/components/StatsBar'
import WhatsAppButton from '@/components/WhatsAppButton'
import { getSiteContent, groupSkillsByCategory, rankProjects } from '@/lib/content'

// Content is edited through the admin dashboard, so the page is rendered per
// request rather than frozen at build time.
export const dynamic = 'force-dynamic'

/** The homepage shows this many entries; the rest live on /projects. */
const SHOWCASE = 3

const FALLBACK = {
  name: 'Ahmet Yilmaz',
  title: 'Full-Stack Developer',
  headline: 'I build systems that keep running when things break.',
}

const INDEX = [
  { href: '#work', label: 'Selected work' },
  { href: '#stack', label: 'Stack' },
  { href: '#services', label: 'Engagements' },
  { href: '#contact', label: 'Contact' },
]

export default async function HomePage() {
  const { projects, skills, services, about, hero, stats } = await getSiteContent()
  const skillsByCategory = groupSkillsByCategory(skills)

  const name = about?.name || FALLBACK.name
  const role = about?.title || FALLBACK.title

  const ranked = rankProjects(projects)
  const showcase = ranked.slice(0, SHOWCASE)
  const remaining = ranked.length - showcase.length

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
      <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-14">
        <div className="pt-12 sm:pt-16">
          <SiteRail
            name={name}
            role={role}
            location={about?.location}
            email={about?.email}
            github={about?.github}
            linkedin={about?.linkedin}
            twitter={about?.twitter}
            index={INDEX}
          />
        </div>

        <main className="pt-12 sm:pt-16">
          {/* ── Thesis ─────────────────────────────────────────────── */}
          <h1 className="max-w-[26ch] font-mono text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem] lg:text-[3.25rem]">
            {hero?.headline || FALLBACK.headline}
          </h1>

          {hero?.subheadline && (
            <p className="mt-6 font-mono text-meta text-muted">{hero.subheadline}</p>
          )}

          {about?.bio && (
            <p className="mt-7 max-w-measure text-[0.9375rem] leading-relaxed text-ink/80">
              {about.bio}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ResumeButton resume={about?.resume} name={about?.name} />
            <a
              href="#work"
              className="inline-flex min-h-11 items-center font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 hover:decoration-ink"
            >
              {hero?.ctaText || 'See the work'} ↓
            </a>
          </div>

          <StatsBar stats={stats} />

          {/* ── Work: a showcase, not the archive ──────────────────── */}
          <section className="pt-14 sm:pt-16">
            <SectionHead
              id="work"
              title="Selected work"
              eyebrow={`${showcase.length} of ${ranked.length}`}
            />

            {showcase.length === 0 ? (
              <p className="text-meta text-muted">
                No projects yet. Add them from the dashboard.
              </p>
            ) : (
              <>
                {showcase.map((project, index) => (
                  <Reveal key={project.id} index={index}>
                    <ProjectEntry index={index} {...project} />
                  </Reveal>
                ))}

                {remaining > 0 && (
                  <Link
                    href="/projects"
                    className="group flex min-h-14 items-center justify-between gap-4 border-t border-ink pt-5 font-mono text-meta text-ink"
                  >
                    <span className="underline decoration-rule decoration-1 underline-offset-4 group-hover:decoration-ink">
                      All work
                    </span>
                    <span className="label tnum">
                      +{remaining} more
                      <span
                        aria-hidden="true"
                        className="ml-3 inline-block transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </Link>
                )}
              </>
            )}
          </section>

          {/* ── Stack ──────────────────────────────────────────────── */}
          {skillsByCategory.length > 0 && (
            <section className="pt-16 sm:pt-20">
              <SectionHead id="stack" title="Stack" eyebrow="Day to day" />
              <dl>
                {skillsByCategory.map(([category, categorySkills]) => (
                  <div
                    key={category}
                    className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                  >
                    <dt className="label pt-1">{category}</dt>
                    <dd className="font-mono text-meta leading-relaxed text-ink/85">
                      {categorySkills.map((s) => s.name).join('  ·  ')}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* ── Engagements ────────────────────────────────────────── */}
          {services.length > 0 && (
            <section className="pt-16 sm:pt-20">
              <SectionHead id="services" title="Engagements" eyebrow="How I work" />
              <ol>
                {services.map((service, i) => (
                  <li
                    key={service.id}
                    className="grid gap-1 border-b border-rule py-5 sm:grid-cols-[3rem_1fr] sm:gap-6"
                  >
                    {/* Ordered because this is the actual sequence of a project. */}
                    <span className="label tnum pt-1">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="font-mono text-[0.9375rem] font-medium">{service.title}</h3>
                      <p className="mt-2 max-w-measure text-meta leading-relaxed text-ink/75">
                        {service.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── Contact ────────────────────────────────────────────── */}
          {about && (
            <section className="pt-16 sm:pt-20">
              <SectionHead id="contact" title="Contact" eyebrow="Get in touch" />
              <dl>
                {about.email && (
                  <div className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="label pt-1">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${about.email}`}
                        className="inline-flex min-h-11 items-center font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 hover:decoration-ink"
                      >
                        {about.email}
                      </a>
                    </dd>
                  </div>
                )}
                {about.location && (
                  <div className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="label pt-1">Based in</dt>
                    <dd className="font-mono text-meta text-ink/85">{about.location}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <IdeaSubmission />

          <Contact email={about?.email} location={about?.location} />

          <footer className="mt-16 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-ink pt-6 sm:mt-20">
            <p className="label tnum">
              © {new Date().getFullYear()} {name}
            </p>
            <p className="label">Next.js · Postgres · self-hosted</p>
          </footer>
        </main>
      </div>

      <WhatsAppButton number={about?.whatsapp} />
    </div>
  )
}
