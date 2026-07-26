import Contact from '@/components/Contact'
import Hero3D from '@/components/Hero3D'
import IdeaSubmission from '@/components/IdeaSubmission'
import ProjectCard from '@/components/ProjectCard'
import ResumeButton from '@/components/ResumeButton'
import Reveal from '@/components/Reveal'
import SkillBar from '@/components/SkillBar'
import SocialLinks from '@/components/SocialLinks'
import StatsBar from '@/components/StatsBar'
import WhatsAppButton from '@/components/WhatsAppButton'
import { getSiteContent, groupSkillsByCategory } from '@/lib/content'

// Content is edited through the admin dashboard, so the page is rendered per
// request rather than frozen at build time.
export const dynamic = 'force-dynamic'

const DEFAULT_HERO = {
  headline: 'Welcome',
  subheadline: '',
  ctaText: 'View My Work',
  ctaUrl: '#portfolio',
}

export default async function HomePage() {
  const { projects, skills, services, about, hero, stats } = await getSiteContent()
  const skillsByCategory = groupSkillsByCategory(skills)

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero3D
        headline={hero?.headline ?? DEFAULT_HERO.headline}
        subheadline={hero?.subheadline ?? DEFAULT_HERO.subheadline}
        ctaText={hero?.ctaText ?? DEFAULT_HERO.ctaText}
        ctaUrl={hero?.ctaUrl ?? DEFAULT_HERO.ctaUrl}
      />

      <StatsBar stats={stats} />

      {/* Projects */}
      <section id="portfolio" className="py-24 px-6 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-400">Check out some of my recent work</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} {...project} index={index} />
            ))}
          </div>

          {projects.length === 0 && (
            <p className="text-center text-gray-500 text-lg">
              No projects yet. Add some from the dashboard!
            </p>
          )}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-24 px-6 bg-gradient-to-br from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
              Skills &amp; Technologies
            </h2>
            <p className="text-xl text-gray-400">My technical expertise</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillsByCategory.map(([category, categorySkills], catIdx) => (
              <Reveal
                key={category}
                index={catIdx}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-primary transition-all"
              >
                <h3 className="text-2xl font-bold text-primary mb-6">{category}</h3>
                <div className="space-y-4">
                  {categorySkills.map((skill) => (
                    <SkillBar
                      key={skill.id}
                      name={skill.name}
                      icon={skill.icon}
                      level={skill.level}
                    />
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
              What I Do
            </h2>
            <p className="text-xl text-gray-400">Services I offer</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Reveal
                key={service.id}
                index={index}
                variant="scale"
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 text-center hover:border-primary transition-all"
              >
                <div className="text-6xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      {about && (
        <section id="about" className="py-24 px-6 bg-gradient-to-br from-black to-gray-900">
          <div className="max-w-4xl mx-auto">
            <Reveal className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
                About Me
              </h2>
            </Reveal>

            <Reveal
              index={2}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">{about.name}</h3>
                <p className="text-xl text-primary">{about.title}</p>
                {about.location && (
                  <p className="text-gray-400 mt-2">{about.location}</p>
                )}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">{about.bio}</p>

              {about.resume && (
                <div className="flex justify-center mb-8">
                  <ResumeButton resume={about.resume} name={about.name} />
                </div>
              )}

              <SocialLinks
                github={about.github}
                linkedin={about.linkedin}
                twitter={about.twitter}
                email={about.email}
              />
            </Reveal>
          </div>
        </section>
      )}

      <IdeaSubmission />

      <Contact email={about?.email} location={about?.location} />

      <WhatsAppButton number={about?.whatsapp} />

      <footer className="py-8 px-6 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} {about?.name || 'Portfolio'}. Built with Next.js &amp;
            React Three Fiber.
          </p>
        </div>
      </footer>
    </div>
  )
}
