import { parseLines } from '@/lib/content'

type ServiceCardProps = {
  index: number
  title: string
  description: string
  audience?: string | null
  deliverables?: string | null
  engagement?: string | null
  duration?: string | null
}

/**
 * One engagement.
 *
 * Not a card in the boxed-and-rounded sense — a row separated by a rule. Four
 * bordered boxes in a grid is the shape every developer portfolio uses for
 * services, and it makes three sentences look like a pricing table.
 *
 * The audience/deliverables/engagement/duration fields are all optional and
 * ship empty. Each renders only when filled, so the section is honest about
 * what has actually been specified rather than showing "Contact for details".
 */
export default function ServiceCard({
  index,
  title,
  description,
  audience,
  deliverables,
  engagement,
  duration,
}: ServiceCardProps) {
  const items = parseLines(deliverables)
  // Terms sit on one line; only render the line if something is on it.
  const terms = [
    engagement && { label: 'Engagement', value: engagement },
    duration && { label: 'Typical duration', value: duration },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    // A div, not the li — the surrounding StaggeredList owns the li so it has
    // something to animate. Keeping the li here too would nest one inside the
    // other, which is invalid inside an ol.
    <div className="grid gap-x-6 gap-y-3 border-b border-border py-7 sm:grid-cols-[3rem_1fr]">
      {/* Numbered because these are the stages of a project in the order they
          happen, which is information. Were they an unordered menu of
          services, numbering them would be decoration. */}
      <span className="label tnum pt-1.5">{String(index + 1).padStart(2, '0')}</span>

      <div>
        <h3 className="text-h3">{title}</h3>
        <p className="mt-2 max-w-measure text-body text-foreground/75">{description}</p>

        {audience && (
          <p className="mt-4 max-w-measure text-meta text-foreground-muted">
            <span className="label mr-2">For</span>
            {audience}
          </p>
        )}

        {items.length > 0 && (
          <div className="mt-4">
            <p className="label">You get</p>
            <ul className="mt-2 max-w-measure">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 py-1 text-meta leading-relaxed text-foreground/80"
                >
                  <span aria-hidden="true" className="mt-[0.55em] h-px w-2.5 shrink-0 bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {terms.length > 0 && (
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            {terms.map((term) => (
              <div key={term.label}>
                <dt className="label">{term.label}</dt>
                <dd className="mt-0.5 font-mono text-meta text-foreground/85">{term.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}
