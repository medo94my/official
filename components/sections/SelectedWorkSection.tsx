import ProjectEntry from '@/components/ProjectEntry'
import Reveal from '@/components/motion/Reveal'
import SectionHead from '@/components/SectionHead'
import Section from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import type { PublicProject } from '@/lib/content'

type SelectedWorkSectionProps = {
  projects: PublicProject[]
  /** Total in the archive, so the eyebrow can say "3 of 7". */
  total: number
}

export default function SelectedWorkSection({
  projects,
  total,
}: SelectedWorkSectionProps) {
  const remaining = total - projects.length

  return (
    <Section id="work">
      <SectionHead title="Selected work" eyebrow={`${projects.length} of ${total}`} />

      {projects.length === 0 ? (
        <p className="text-meta text-foreground-muted">
          No projects yet. Add them from the dashboard.
        </p>
      ) : (
        <>
          {projects.map((project, index) => (
            <Reveal key={project.id} index={index}>
              <ProjectEntry index={index} {...project} />
            </Reveal>
          ))}

          {remaining > 0 && (
            <div className="border-t border-border-strong pt-6">
              <ButtonLink href="/projects" variant="secondary">
                All work
                <span className="label tnum">+{remaining}</span>
                <span aria-hidden="true">→</span>
              </ButtonLink>
            </div>
          )}
        </>
      )}
    </Section>
  )
}
