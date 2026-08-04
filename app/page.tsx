import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav, { type NavItem } from '@/components/layout/SiteNav'
import ScrollRail from '@/components/motion/ScrollRail.client'
import AboutSection from '@/components/sections/AboutSection'
import ContactSection from '@/components/sections/ContactSection'
import ExperienceSection from '@/components/sections/ExperienceSection'
import HeroSection, { type LedgerCell } from '@/components/sections/HeroSection'
import ProcessSection from '@/components/sections/ProcessSection'
import ProofBar from '@/components/sections/ProofBar'
import SelectedWorkSection from '@/components/sections/SelectedWorkSection'
import ServicesSection from '@/components/sections/ServicesSection'
import StackSection from '@/components/sections/StackSection'
import WhatsAppButton from '@/components/WhatsAppButton'
import Container from '@/components/ui/Container'
import {
  getSiteContent,
  groupSkillsByCategory,
  rankProjects,
  splitServices,
} from '@/lib/content'
import { homeSchema } from '@/lib/structured-data'

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

/**
 * This page owns all the data access; no section component touches Prisma.
 * Sections take plain props, which keeps them server components, trivially
 * testable, and reusable on /projects and the case-study pages.
 */
export default async function HomePage() {
  const { projects, skills, services, about, hero, stats, experience, posts } =
    await getSiteContent()

  const skillsByCategory = groupSkillsByCategory(skills)
  const { services: engagements, process } = splitServices(services)

  const name = about?.name || FALLBACK.name
  const role = about?.title || FALLBACK.title

  const ranked = rankProjects(projects)
  const showcase = ranked.slice(0, SHOWCASE)

  // Nav entries are built from what actually rendered, so a section that hides
  // itself (no experience yet, no process steps) does not leave a dead anchor
  // in the header.
  const nav: NavItem[] = [
    { href: '#work', label: 'Work' },
    engagements.length > 0 && { href: '#services', label: 'Engagements' },
    skillsByCategory.length > 0 && { href: '#stack', label: 'Stack' },
    experience.length > 0 && { href: '#experience', label: 'Experience' },
    about?.bio && { href: '#about', label: 'About' },
    // A real route rather than an anchor, and only once something is published
    // — the same rule every section here follows. An empty blog in the nav is
    // an invitation to a dead end.
    posts.length > 0 && { href: '/blog', label: 'Writing' },
    { href: '#contact', label: 'Contact' },
  ].filter(Boolean) as NavItem[]

  // The hero ledger states facts. A cell with no value is dropped rather than
  // filled, so nothing here is a claim the database cannot support.
  const ledger: LedgerCell[] = [
    hero?.subheadline && { label: 'Focus', value: hero.subheadline },
    skillsByCategory.length > 0 && {
      label: 'Working in',
      value: skillsByCategory
        .slice(0, 3)
        .map(([category]) => category)
        .join(' · '),
    },
    about?.location && { label: 'Based in', value: about.location },
  ].filter(Boolean) as LedgerCell[]

  // The rail's ticks come from the same list as the nav, so a section that hid
  // itself never gets a tick pointing at nothing.
  // Anchors only. The Writing link is a route, and passing "/blog" here would
  // give the rail a tick looking for an element that does not exist.
  const sectionIds = nav
    .filter((item) => item.href.startsWith('#'))
    .map((item) => item.href.slice(1))

  return (
    <>
      <JsonLd data={homeSchema(about, FALLBACK.name)} />

      <SiteNav
        name={name}
        items={nav}
        cta={{ href: '#contact', label: 'Start a project' }}
        resume={about?.resume}
      />

      <ScrollRail sectionIds={sectionIds} />

      <main id="main" tabIndex={-1} className="outline-none">
        <HeroSection
          headline={hero?.headline || FALLBACK.headline}
          valueProp={hero?.valueProp}
          subheadline={role}
          ledger={ledger}
          resume={about?.resume}
          workHref="#work"
          contactHref="#contact"
        />

        <Container>
          <ProofBar stats={stats} />
          {/* The positioning line lives in the hero, once. A separate
              value-proposition band would repeat the same sentence; the detail
              behind it belongs in Engagements, where it can be specific. */}
          <SelectedWorkSection projects={showcase} total={ranked.length} />
          <ServicesSection services={engagements} />
          <ProcessSection steps={process} />
          <StackSection groups={skillsByCategory} />
          <ExperienceSection experience={experience} resume={about?.resume} />
          <AboutSection bio={about?.bio} location={about?.location} />
          <ContactSection
            email={about?.email}
            phone={about?.phone}
            whatsapp={about?.whatsapp}
            location={about?.location}
            github={about?.github}
            linkedin={about?.linkedin}
          />
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
        nav={nav}
      />

      <WhatsAppButton number={about?.whatsapp} />
    </>
  )
}
