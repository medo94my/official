/**
 * Structured data.
 *
 * Two rules govern everything here.
 *
 * 1. **Nothing is asserted that the database does not hold.** Every field is
 *    dropped when its source is empty rather than filled with a plausible
 *    default. Schema.org is a set of machine-readable *claims*; inventing a
 *    `jobTitle` or an `award` here is the same lie as printing it on the page,
 *    except a search engine believes it more readily.
 *
 * 2. **It describes what a reader can actually see.** Markup that promises
 *    content the page does not contain is what structured-data penalties are
 *    for. `CreativeWork` is only emitted for a project with a real write-up.
 */

/**
 * Keys that describe a node without being a claim about anything.
 *
 * An object left holding only these has had all its real content pruned away
 * and should disappear rather than emit a typed but empty node.
 *
 * Two keys are deliberately absent. `@graph` *is* the content — treating it as
 * structural drops the entire homepage payload. And `@id` alone is a valid
 * node reference: `publisher: { '@id': '…#person' }` is how the WebSite points
 * at the Person already in the graph, and pruning it would silently sever
 * every link between nodes and leave a set of unrelated objects.
 */
const STRUCTURAL_KEYS = new Set(['@context', '@type'])

/** Recursively strips null/undefined/empty values so no key is asserted blank. */
function prune<T>(value: T): T | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return (trimmed === '' ? undefined : trimmed) as T | undefined
  }
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((v) => v !== undefined)
    return (items.length > 0 ? items : undefined) as T | undefined
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [k, prune(v)] as const)
      .filter(([, v]) => v !== undefined)
    const meaningful = entries.filter(([k]) => !STRUCTURAL_KEYS.has(k))
    return (meaningful.length > 0
      ? (Object.fromEntries(entries) as T)
      : undefined) as T | undefined
  }
  return value
}

/**
 * Emits a JSON-LD block.
 *
 * `</` is escaped because the payload is interpolated into a `<script>` and a
 * closing tag inside a string value would end the script element early. The
 * values here come from the admin dashboard, so this is not defence against a
 * stranger — it is defence against someone pasting a snippet of HTML into a
 * project description and silently breaking every page.
 */
export default function JsonLd({ data }: { data: unknown }) {
  const pruned = prune(data)
  if (pruned === undefined) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(pruned).replace(/</g, '\\u003c'),
      }}
    />
  )
}
