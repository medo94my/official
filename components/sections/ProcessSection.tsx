import SectionHead from '@/components/SectionHead'
import Section from '@/components/ui/Section'
import StaggeredList from '@/components/motion/StaggeredList'
import { parseLines } from '@/lib/content'

type Step = {
  id: string
  title: string
  description: string
  deliverables?: string | null
}

/**
 * How a project actually runs, for the visitor deciding whether to hire.
 *
 * Renders nothing until a Service row is marked `kind: "process"`. Nothing is
 * seeded that way, so this section is absent today rather than showing a
 * generic Discovery → Design → Build → Launch diagram, which is agency
 * boilerplate and tells a client nothing about this person.
 */
export default function ProcessSection({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null

  return (
    <Section id="process">
      <SectionHead title="Process" eyebrow="What to expect" />
      <StaggeredList as="ol" itemAs="li" gap="tight">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className="grid gap-x-6 gap-y-2 border-b border-border py-6 sm:grid-cols-[3rem_1fr]"
          >
            <span className="label tnum pt-1.5">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-h3">{step.title}</h3>
              <p className="mt-2 max-w-measure text-body text-foreground/75">
                {step.description}
              </p>
              {parseLines(step.deliverables).length > 0 && (
                <p className="mt-3 font-mono text-meta text-foreground-muted">
                  {parseLines(step.deliverables).join('  ·  ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </StaggeredList>
    </Section>
  )
}
