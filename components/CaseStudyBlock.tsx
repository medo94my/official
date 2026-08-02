import Reveal from '@/components/motion/Reveal'
import {
  hasBlockContent,
  parseLines,
  parseParagraphs,
  parseSpecs,
  type CaseStudyBlockContent,
} from '@/lib/content'

type CaseStudyBlockProps = CaseStudyBlockContent & {
  heading: string
  /** Anchor, so the page's scroll rail has something to target. */
  id?: string
}

/**
 * One block of a case study.
 *
 * A single renderer for all thirteen optional fields, which is what makes
 * "every field is empty" cheap to support: the block returns null when it has
 * no content, so the detail page is a flat list of these and needs no
 * conditional logic of its own.
 */
export default function CaseStudyBlock({
  heading,
  id,
  body,
  items,
  pairs,
}: CaseStudyBlockProps) {
  if (!hasBlockContent({ body, items, pairs })) return null

  const paragraphs = parseParagraphs(body)
  const list = parseLines(items)
  const rows = parseSpecs(pairs)

  return (
    <Reveal
      as="section"
      viewport="eager"
      id={id}
      className="scroll-mt-24 border-t border-border py-8 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-10"
    >
      <h2 className="label pt-1">{heading}</h2>

      <div className="mt-3 sm:mt-0">
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className={`max-w-measure text-body text-foreground/85${i > 0 ? ' mt-4' : ''}`}
          >
            {paragraph}
          </p>
        ))}

        {list.length > 0 && (
          <ul className={`max-w-measure${paragraphs.length > 0 ? ' mt-4' : ''}`}>
            {list.map((item) => (
              <li
                key={item}
                className="flex gap-3 py-1.5 text-body leading-relaxed text-foreground/85"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.7em] h-px w-3 shrink-0 bg-accent"
                />
                {item}
              </li>
            ))}
          </ul>
        )}

        {rows.length > 0 && (
          <dl className={paragraphs.length > 0 || list.length > 0 ? 'mt-4' : ''}>
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 border-b border-border/70 py-2.5 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4"
              >
                <dt className="label pt-0.5">{row.label}</dt>
                <dd className="max-w-measure text-meta leading-relaxed text-foreground/85">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Reveal>
  )
}
