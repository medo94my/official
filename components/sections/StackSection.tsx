import SectionHead from '@/components/SectionHead'
import Section from '@/components/ui/Section'
import StaggeredList from '@/components/motion/StaggeredList'

type Skill = { id: string; name: string; category: string }

/**
 * Capabilities grouped by what they are for, not a wall of logos.
 *
 * The grouping is the content: "Languages / Frontend / Backend / Data /
 * Infrastructure" tells a reader where this person operates. A grid of icons
 * would say only that the technologies exist.
 */
export default function StackSection({
  groups,
}: {
  groups: [string, Skill[]][]
}) {
  if (groups.length === 0) return null

  return (
    <Section id="stack">
      <SectionHead title="Stack" eyebrow="Day to day" />
      <StaggeredList as="dl" gap="tight">
        {groups.map(([category, skills]) => (
          <div
            key={category}
            className="grid gap-1 border-b border-border py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
          >
            <dt className="label pt-1">{category}</dt>
            <dd className="font-mono text-meta leading-relaxed text-foreground/85">
              {skills.map((s) => s.name).join('  ·  ')}
            </dd>
          </div>
        ))}
      </StaggeredList>
    </Section>
  )
}
