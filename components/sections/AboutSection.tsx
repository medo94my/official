import SectionHead from '@/components/SectionHead'
import Section from '@/components/ui/Section'
import StaggeredList from '@/components/motion/StaggeredList'

type AboutSectionProps = {
  bio?: string | null
  location?: string | null
}

/**
 * The short human introduction.
 *
 * Renders the bio as written, splitting on blank lines so a multi-paragraph
 * bio entered in the dashboard does not collapse into one block. No invented
 * narrative around it — if the record holds three sentences, the section is
 * three sentences.
 */
export default function AboutSection({ bio, location }: AboutSectionProps) {
  if (!bio) return null

  const paragraphs = bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <Section id="about">
      <SectionHead title="About" eyebrow={location ?? undefined} />
      {/* `tight` rather than the base interval: consecutive paragraphs of one
          argument should arrive as a paragraph break, not as separate items. */}
      <StaggeredList className="max-w-measure" gap="tight">
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className={`text-body-lg text-foreground/85${i > 0 ? ' mt-4' : ''}`}
          >
            {paragraph}
          </p>
        ))}
      </StaggeredList>
    </Section>
  )
}
