import Contact from '@/components/Contact'
import IdeaSubmission from '@/components/IdeaSubmission'
import ProjectEntry from '@/components/ProjectEntry'
import ResumeButton from '@/components/ResumeButton'
import Reveal from '@/components/Reveal'
import SocialLinks from '@/components/SocialLinks'
import StatsBar from '@/components/StatsBar'
import WhatsAppButton from '@/components/WhatsAppButton'
import { getSiteContent, groupSkillsByCategory } from '@/lib/content'

// Content is edited through the admin dashboard, so the page is rendered per
// request rather than frozen at build time.
export const dynamic = 'force-dynamic'

const FALLBACK = {
  name: 'Ahmet Yilmaz',
  title: 'Full-Stack Developer',
  headline: 'I build systems that keep running when things break.',
}

/** Section heading, set in the instrument voice. */
function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-4">
      <h2 className="font-mono text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      <span className="label">{eyebrow}</span>
    </div>
  )
}

export default async function HomePage() {
  const { projects, skills, services, about, hero, stats } = await getSiteContent()
  const skillsByCategory = groupSkillsByCategory(skills)

  const name = about?.name || FALLBACK.name
  const role = about?.title || FALLBACK.title

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <header className="pt-16 sm:pt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="label text-ink">{name}</p>
            {about?.location && <p className="label">{about.location}</p>}
          </div>

          <hr className="mt-4 border-ink" />

          <h1 className="mt-10 max-w-[24ch] font-mono text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.5rem]">
            {hero?.headline || FALLBACK.headline}
          </h1>

          <p className="mt-6 font-mono text-meta text-muted">
            {hero?.subheadline || role}
          </p>

          {about?.bio && (
            <p className="mt-8 max-w-measure text-[0.9375rem] leading-relaxed text-ink/80">
              {about.bio}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ResumeButton resume={about?.resume} name={about?.name} />
            <a
              href="#work"
              className="inline-flex min-h-11 items-center font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink"
            >
              {hero?.ctaText || 'See the work'} ↓
            </a>
          </div>
        </header>

        <StatsBar stats={stats} />

        {/* ── Work ─────────────────────────────────────────────────── */}
        <section id="work" className="pt-16 sm:pt-20">
          <SectionHead eyebrow={`${projects.length} entries`} title="Selected work" />

          {projects.length === 0 ? (
            <p className="text-meta text-muted">
              No projects yet. Add them from the dashboard.
            </p>
          ) : (
            <div>
              {projects.map((project, index) => (
                <Reveal key={project.id} index={Math.min(index, 3)}>
                  <ProjectEntry index={index} {...project} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* ── Stack ────────────────────────────────────────────────── */}
        {skillsByCategory.length > 0 && (
          <section id="stack" className="pt-20 sm:pt-28">
            <SectionHead eyebrow="Day to day" title="Stack" />
            <dl>
              {skillsByCategory.map(([category, categorySkills]) => (
                <div
                  key={category}
                  className="grid gap-2 border-b border-rule py-4 sm:grid-cols-[10rem_1fr] sm:gap-6"
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

        {/* ── Services ─────────────────────────────────────────────── */}
        {services.length > 0 && (
          <section id="services" className="pt-20 sm:pt-28">
            <SectionHead eyebrow="How I work" title="Engagements" />
            <ol>
              {services.map((service, i) => (
                <li
                  key={service.id}
                  className="grid gap-2 border-b border-rule py-5 sm:grid-cols-[3rem_1fr] sm:gap-6"
                >
                  {/* Ordered because this is the actual sequence of a project. */}
                  <span className="label tnum pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
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

        {/* ── Contact ──────────────────────────────────────────────── */}
        {about && (
          <section id="about" className="pt-20 sm:pt-28">
            <SectionHead eyebrow="Get in touch" title="Contact" />
            <dl>
              {about.email && (
                <div className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="label pt-1">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${about.email}`}
                      className="inline-flex min-h-11 items-center font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      {about.email}
                    </a>
                  </dd>
                </div>
              )}
              {about.location && (
                <div className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="label pt-1">Based in</dt>
                  <dd className="font-mono text-meta text-ink/85">{about.location}</dd>
                </div>
              )}
              <div className="grid gap-3 border-b border-rule py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="label pt-1">Elsewhere</dt>
                <dd>
                  <SocialLinks
                    github={about.github}
                    linkedin={about.linkedin}
                    twitter={about.twitter}
                  />
                </dd>
              </div>
            </dl>
          </section>
        )}

        <IdeaSubmission />

        <Contact email={about?.email} location={about?.location} />

        {/* ── Colophon ─────────────────────────────────────────────── */}
        <footer className="mt-20 border-t border-ink py-8 pb-28 sm:mt-28 sm:pb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="label tnum">
              © {new Date().getFullYear()} {name}
            </p>
            <p className="label">Next.js · Postgres · self-hosted</p>
          </div>
        </footer>
      </div>

      <WhatsAppButton number={about?.whatsapp} />
    </div>
  )
}
