import Image from 'next/image'
import Link from 'next/link'
import { describeMedia } from '@/components/ProjectGallery'
import { hasCaseStudy, parseSpecs, type PublicMedia } from '@/lib/content'

type ProjectEntryProps = {
  index: number
  title: string
  slug: string
  description: string
  tags: string[]
  specs?: string | null
  githubUrl?: string | null
  liveUrl?: string | null
  image?: string | null
  /** Gallery items. Only counted here; they render on the case-study page. */
  media?: PublicMedia[]
  // Read only by hasCaseStudy(), to decide whether a detail link is worth
  // offering. The blocks themselves render on /projects/[slug].
  problem?: string | null
  approach?: string | null
  outcome?: string | null
  context?: string | null
  myRole?: string | null
}

/**
 * A project as a datasheet entry rather than a card.
 *
 * The spec grid is the point: this subject builds infrastructure, which has no
 * screenshot worth showing. Stating the retry policy and the dedup key tells a
 * technical reader more than an image of a terminal would.
 */
export default function ProjectEntry({
  index,
  title,
  slug,
  description,
  tags,
  specs,
  githubUrl,
  liveUrl,
  image,
  media = [],
  ...caseStudy
}: ProjectEntryProps) {
  const rows = parseSpecs(specs)
  const mediaSummary = describeMedia(media)
  // Only offered when there is genuinely something to read. A "Read more" that
  // leads to the same three sentences costs the reader's trust.
  // Screenshots count as a reason to open the detail page, not just prose. A
  // project with four screens and a clip has plenty to show even before a word
  // of the write-up exists — and gating the link on prose alone meant the
  // gallery was unreachable from the list, which is where people start.
  const readable = hasCaseStudy(caseStudy) || media.length > 0

  return (
    <article className="border-t border-border py-10 first:border-t-0 first:pt-2 sm:py-12 sm:first:pt-4">
      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-[3rem_1fr]">
        {/* Rank, not decoration: the list is ordered by significance. */}
        <div className="label tnum hidden pt-1 sm:block">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div>
          <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h3 className="text-h3">{title}</h3>
            {/* Only a genuine state gets a badge. A "Selected" tag inside a
                section already titled "Selected work" was labelling nothing. */}
            {liveUrl && (
              <span className="label flex items-center gap-1.5 text-success">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
                Live
              </span>
            )}
          </header>

          <p className="mt-4 max-w-measure text-body text-foreground/80">{description}</p>

          {rows.length > 0 && (
            <dl className="mt-6 border-t border-border/70">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 border-b border-border/70 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="label pt-0.5">{row.label}</dt>
                  <dd className="font-mono text-meta text-foreground/85 tnum">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {image && (
            // A real aspect ratio rather than a fixed h-44. On a phone that
            // height cropped a wide screenshot to a letterbox strip showing
            // almost nothing of it; 16/9 is the shape screenshots actually are.
            <div className="relative mt-6 aspect-[16/9] overflow-hidden border border-border bg-background-subtle">
              <Image
                src={image}
                alt={`Screenshot of ${title}`}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            {tags.map((tag) => (
              <span key={tag} className="font-mono text-meta text-foreground-muted">
                {tag}
              </span>
            ))}
          </div>

          {(githubUrl || liveUrl || readable) && (
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {readable && (
                <Link
                  href={`/projects/${slug}`}
                  className="group inline-flex min-h-11 items-center gap-2 font-mono text-meta text-primary underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-primary"
                >
                  {/* The label describes what is actually behind it. "Read the
                      case study" on a project with screenshots and no prose
                      promises something that is not there. */}
                  {hasCaseStudy(caseStudy) ? 'Read the case study' : 'See the screens'}
                  {mediaSummary && (
                    <span className="text-foreground-subtle">({mediaSummary})</span>
                  )}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-standard group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center gap-2 font-mono text-meta text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Source
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              )}
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center gap-2 font-mono text-meta text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Live site
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
