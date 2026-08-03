import { ButtonLink } from '@/components/ui/Button'
import Container from '@/components/ui/Container'
import RevealText from '@/components/motion/RevealText'
import Reveal from '@/components/motion/Reveal'

export type LedgerCell = { label: string; value: string }

type HeroSectionProps = {
  headline: string
  /** The positioning line: what gets built, and for whom. */
  valueProp?: string | null
  subheadline?: string | null
  /** Facts drawn from the CMS. Cells with no value are not rendered. */
  ledger: LedgerCell[]
  resume?: string | null
  workHref: string
  contactHref: string
}

/**
 * The hero states a thesis and then evidences it.
 *
 * The ledger beneath is the page's signature: a horizontal status line in the
 * subject's own vernacular — the shape of a healthcheck or a job header, which
 * is what this person's work actually emits. Every cell is a value already in
 * the database. It renders nothing rather than showing a placeholder, because
 * a hero that states unverifiable facts undoes the point of the section.
 */
export default function HeroSection({
  headline,
  valueProp,
  subheadline,
  ledger,
  resume,
  workHref,
  contactHref,
}: HeroSectionProps) {
  return (
    <section className="pt-14 sm:pt-20 lg:pt-28">
      <Container>
        {/* Staged, and the indices are the running order. The accent bar used to
            sit at the default index 0, so it landed simultaneously with the
            eyebrow above the headline rather than after it — the sequence read
            as two things happening at once and then a gap. `loose` because this
            is the one place on the site where the arrival is the point. */}
        {subheadline && (
          <Reveal gap="loose">
            <p className="label mb-6">{subheadline}</p>
          </Reveal>
        )}

        <h1 className="max-w-[19ch] text-display text-foreground">
          <RevealText text={headline} by="word" delay={0.08} />
        </h1>

        {/* The keystone. `accent` resolves to bronze on ivory (5.6:1) and to
            gold on onyx (8.1:1), so one token carries both themes. */}
        <Reveal index={2} gap="loose" distance="nudge" className="mt-7">
          <span aria-hidden="true" className="block h-[3px] w-16 bg-accent" />
        </Reveal>

        {valueProp && (
          <Reveal index={3} gap="loose" className="mt-7">
            <p className="max-w-measure text-body-lg text-foreground/85">{valueProp}</p>
          </Reveal>
        )}

        <Reveal index={4} gap="loose" className="mt-9">
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href={contactHref}>Start a project</ButtonLink>
            <ButtonLink href={workHref} variant="secondary">
              See the work
              <span aria-hidden="true">↓</span>
            </ButtonLink>
            {resume && (
              <ButtonLink href={resume} variant="quiet">
                Résumé
              </ButtonLink>
            )}
          </div>
        </Reveal>

        {ledger.length > 0 && (
          <Reveal index={5} gap="loose" className="mt-14 sm:mt-20">
            <dl className="grid grid-cols-1 gap-px border-y border-border bg-border sm:grid-cols-3">
              {/* gap-px over a border-coloured ground draws the separators, so
                  the cells stay a real grid instead of a stack of bordered
                  boxes that break at the wrap point. */}
              {ledger.map((cell) => (
                <div key={cell.label} className="bg-background px-1 py-5 sm:px-5 sm:first:pl-0">
                  <dt className="label">{cell.label}</dt>
                  <dd className="mt-2 font-mono text-meta leading-relaxed text-foreground/85">
                    {cell.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </Container>
    </section>
  )
}
