import { parseLines } from '@/lib/content'
import { formatMonth } from '@/lib/dates'

type ExperienceEntryProps = {
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
 * One role.
 *
 * The dates run in mono because they are data; the role runs in sans because
 * it is the heading. A null end date reads "Present" rather than being left
 * blank, which is the difference between "current job" and "unfinished record".
 */
export default function ExperienceEntry({
  company,
  role,
  startDate,
  endDate,
  location,
  summary,
  highlights,
  url,
}: ExperienceEntryProps) {
  const points = parseLines(highlights)

  return (
    // A div, not the li — see the note in ServiceCard: the StaggeredList around
    // this owns the li.
    <div className="grid gap-x-8 gap-y-3 border-b border-border py-7 sm:grid-cols-[10rem_1fr]">
      <div>
        {/* time is the right element here, but only the start is machine-
            readable as a single value, so the range stays plain text. */}
        <p className="label tnum">
          <time dateTime={startDate}>{formatMonth(startDate)}</time>
          {' — '}
          {endDate ? (
            <time dateTime={endDate}>{formatMonth(endDate)}</time>
          ) : (
            'Present'
          )}
        </p>
        {location && <p className="mt-1 text-meta text-foreground-subtle">{location}</p>}
      </div>

      <div>
        <h3 className="text-h3">{role}</h3>
        <p className="mt-1 font-mono text-meta text-foreground-muted">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {company}
              <span aria-hidden="true" className="ml-1 text-foreground-subtle">
                ↗
              </span>
            </a>
          ) : (
            company
          )}
        </p>

        {summary && (
          <p className="mt-3 max-w-measure text-body text-foreground/80">{summary}</p>
        )}

        {points.length > 0 && (
          <ul className="mt-3 max-w-measure">
            {points.map((point) => (
              <li
                key={point}
                className="flex gap-2.5 py-1 text-meta leading-relaxed text-foreground/80"
              >
                <span aria-hidden="true" className="mt-[0.55em] h-px w-2.5 shrink-0 bg-accent" />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
