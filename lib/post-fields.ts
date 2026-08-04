import { isPostStatus } from '@/lib/blog'

/**
 * Maps a post request body onto Prisma columns.
 *
 * Shared by POST and PUT so the two cannot disagree about which fields they
 * accept — the same reason `lib/project-fields.ts` exists, after the duplicated
 * literals there had already drifted once.
 *
 * `slug` is deliberately not handled here: create derives it, update only
 * changes it when explicitly sent.
 */

function str(value: unknown, max: number) {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function orNull(value: unknown) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed === '' ? null : trimmed
}

export function postFields(body: Record<string, unknown>) {
  const status = isPostStatus(body.status) ? body.status : 'draft'

  return {
    title: str(body.title, 200).trim(),
    summary: str(body.summary, 500).trim(),
    body: str(body.body, 200_000),
    tags: Array.isArray(body.tags)
      ? body.tags.join(',')
      : str(body.tags, 500),
    coverImage: orNull(body.coverImage),
    coverAlt: str(body.coverAlt, 300).trim(),
    status,
    // Trust only the flag the draft endpoint sets. A client claiming
    // `aiDrafted: false` on an untouched machine-written body would hide the
    // very notice that exists to stop it being published unread.
    aiDrafted: body.aiDrafted === true,
  }
}

/**
 * `publishedAt` is set once, on the first transition to published.
 *
 * Re-stamping it on every save would reorder the index each time a typo is
 * fixed and tell every feed reader the post is new again. Unpublishing keeps
 * the original date, so restoring a post does not move it to the top.
 */
export function resolvePublishedAt(
  status: string,
  existing: Date | null
): Date | null | undefined {
  if (status !== 'published') return undefined
  return existing ?? new Date()
}
