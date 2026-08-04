/**
 * Blog helpers.
 *
 * Pure and environment-free, like lib/repo-import.ts and lib/case-study-draft.ts,
 * so both the server pages and the admin client can import them and none of it
 * can ever read a secret.
 */

export const POST_STATUSES = ['draft', 'published'] as const
export type PostStatus = (typeof POST_STATUSES)[number]

export function isPostStatus(value: unknown): value is PostStatus {
  return typeof value === 'string' && (POST_STATUSES as readonly string[]).includes(value)
}

/**
 * Reading time in minutes.
 *
 * Computed, never stored: a stored count drifts from the body the moment
 * anyone edits it, and a number that is quietly wrong is worse than no number.
 *
 * 200 wpm is the conventional figure for technical prose. Code blocks are
 * stripped first — nobody reads a shell snippet at reading speed, and counting
 * them turns a short post with a long config listing into "12 min read", which
 * is a promise the post does not keep.
 */
export function readingMinutes(markdown: string): number {
  const prose = markdown.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ')
  const words = prose.trim().split(/\s+/).filter(Boolean).length
  if (words === 0) return 0
  return Math.max(1, Math.round(words / 200))
}

/**
 * `tags` is one comma-separated column, exactly as on Project.
 *
 * De-duplicated case-insensitively but preserving the first spelling, so
 * "Python, python" is one tag that still reads as the owner typed it.
 */
export function parseTags(tags: string | null | undefined): string[] {
  const seen = new Set<string>()
  return (tags ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => {
      const key = t.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

/** The URL segment for a tag page. Lowercase so /blog/tag/Python and /python agree. */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function tagsMatch(tags: string | null | undefined, slug: string): boolean {
  return parseTags(tags).some((t) => tagSlug(t) === slug)
}

/**
 * Escapes a string for XML content.
 *
 * RSS is XML, not HTML: a single unescaped `&` in a post title makes the whole
 * document not-well-formed, and a strict reader rejects the entire feed rather
 * than that one entry. This is why it is a tested function and not template
 * interpolation at the call site.
 *
 * All five predefined entities, in this order — `&` first, or the ampersands
 * introduced by the other four get double-escaped.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // XML 1.0 forbids these control characters outright; tab, newline and
    // carriage return are the only ones allowed below 0x20. Written with
    // explicit escapes because literal control bytes in the source silently
    // became a *negated* class here, which stripped almost every character.
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

/**
 * Plain-text preview from Markdown, for a feed or a meta description.
 *
 * Deliberately crude: strips fences, headings, emphasis and link syntax while
 * keeping link text. It is a summary, not a renderer — anything subtler would
 * be reimplementing the parser to produce a string nobody reads closely.
 */
export function excerpt(markdown: string, maxChars = 200): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxChars) return text
  // Cut at a word boundary so the ellipsis does not land mid-word.
  const cut = text.slice(0, maxChars)
  const space = cut.lastIndexOf(' ')
  return `${(space > maxChars * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

/** The date shown on a post. Absent while it is a draft, which is correct. */
export function formatPostDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
