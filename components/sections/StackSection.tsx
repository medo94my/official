import { Fragment } from 'react'
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
      {/* The grid lives on StaggeredList's own item wrapper rather than on a
          <div> inside it. A <dl> may wrap each term/description pair in one
          <div>, but not two: with the reveal wrapper *and* a grid <div>, the
          <dt> and <dd> were nested a level too deep and stopped being list
          items at all — an audit reported ten orphaned entries and no valid
          definition list. Collapsing the two wrappers into one restores the
          pairing without losing the animation. */}
      <StaggeredList
        as="dl"
        gap="tight"
        itemClassName="grid gap-1 border-b border-border py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
      >
        {groups.map(([category, skills]) => (
          <Fragment key={category}>
            <dt className="label pt-1">{category}</dt>
            <dd className="font-mono text-meta leading-relaxed text-foreground/85">
              {skills.map((s) => s.name).join('  ·  ')}
            </dd>
          </Fragment>
        ))}
      </StaggeredList>
    </Section>
  )
}
