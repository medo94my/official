import ExperienceEntry from '@/components/ExperienceEntry'
import SectionHead from '@/components/SectionHead'
import Section from '@/components/ui/Section'
import StaggeredList from '@/components/motion/StaggeredList'
import { ButtonLink } from '@/components/ui/Button'

type Experience = {
  id: string
  company: string
  role: string
  startDate: string
  endDate?: string | null
  location?: string | null
  summary?: string | null
  highlights?: string | null
  url?: string | null
}

/**
 * Professional history.
 *
 * Returns null while the table is empty, which is the state this ships in.
 * Employment is a factual claim only the owner can make, so nothing here is
 * seeded and no placeholder role is rendered — the section simply does not
 * exist until real entries are added from the dashboard.
 *
 * It stays deliberately compact even when populated. Full chronology belongs
 * in the résumé; the page's job is to show the shape of the career, not
 * reproduce the document.
 */
export default function ExperienceSection({
  experience,
  resume,
}: {
  experience: Experience[]
  resume?: string | null
}) {
  if (experience.length === 0) return null

  return (
    <Section id="experience">
      <SectionHead title="Experience" eyebrow="Where I've worked" />
      <StaggeredList as="ol" itemAs="li">
        {experience.map((entry) => (
          <ExperienceEntry key={entry.id} {...entry} />
        ))}
      </StaggeredList>

      {resume && (
        <div className="mt-6">
          <ButtonLink href={resume} variant="secondary">
            Full résumé
            <span aria-hidden="true">↓</span>
          </ButtonLink>
        </div>
      )}
    </Section>
  )
}
