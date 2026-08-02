/**
 * Maps a service request body onto Prisma columns.
 *
 * Shared by POST /api/services and PUT /api/services/[id] for the same reason
 * as project-fields: two hand-maintained object literals over ten columns
 * drift, and the drift is silent.
 */

function orNull(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** Only these two render anywhere; anything else is rejected to "service". */
const KINDS = new Set(['service', 'process'])

export function serviceFields(body: Record<string, unknown>) {
  const kind = String(body.kind ?? 'service')

  return {
    title: String(body.title ?? ''),
    description: String(body.description ?? ''),
    icon: orNull(body.icon),
    kind: KINDS.has(kind) ? kind : 'service',
    audience: orNull(body.audience),
    deliverables: orNull(body.deliverables),
    engagement: orNull(body.engagement),
    duration: orNull(body.duration),
    order: Number(body.order) || 0,
  }
}
