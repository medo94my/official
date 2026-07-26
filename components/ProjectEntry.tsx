import Image from 'next/image'
import { parseSpecs } from '@/lib/content'

type ProjectEntryProps = {
  index: number
  title: string
  description: string
  tags: string[]
  specs?: string | null
  githubUrl?: string | null
  liveUrl?: string | null
  image?: string | null
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
  description,
  tags,
  specs,
  githubUrl,
  liveUrl,
  image,
}: ProjectEntryProps) {
  const rows = parseSpecs(specs)

  return (
    <article className="border-t border-rule py-10 first:border-t-0 first:pt-2 sm:py-12 sm:first:pt-4">
      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-[3rem_1fr]">
        {/* Rank, not decoration: the list is ordered by significance. */}
        <div className="label tnum hidden pt-1 sm:block">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div>
          <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h3 className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h3>
            {/* Only a genuine state gets a badge. A "Selected" tag inside a
                section already titled "Selected work" was labelling nothing. */}
            {liveUrl && (
              <span className="label flex items-center gap-1.5 text-live">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-live" />
                Live
              </span>
            )}
          </header>

          <p className="mt-4 max-w-measure text-[0.9375rem] leading-relaxed text-ink/80">
            {description}
          </p>

          {rows.length > 0 && (
            <dl className="mt-6 border-t border-rule/70">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 border-b border-rule/70 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="label pt-0.5">{row.label}</dt>
                  <dd className="font-mono text-meta text-ink/85 tnum">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {image && (
            <div className="relative mt-6 h-44 overflow-hidden border border-rule bg-shelf">
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
              <span key={tag} className="font-mono text-meta text-muted">
                {tag}
              </span>
            ))}
          </div>

          {(githubUrl || liveUrl) && (
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center gap-2 font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink"
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
                  className="group inline-flex min-h-11 items-center gap-2 font-mono text-meta text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-ink"
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
