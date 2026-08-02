/**
 * Maps a project request body onto Prisma columns.
 *
 * Shared by POST /api/projects and PUT /api/projects/[id] so the two cannot
 * disagree about which of the twenty-odd fields they accept — the previous
 * duplicated object literals had already drifted, and adding thirteen
 * case-study columns to both by hand would guarantee it happened again.
 *
 * `slug` is deliberately not handled here: create derives it, update only
 * changes it when explicitly sent.
 */

/** Empty string means "cleared" for an optional column, which is null, not ''. */
function orNull(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function projectFields(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? ''),
    description: String(body.description ?? ''),
    type: String(body.type ?? 'Solo'),
    image: orNull(body.image),
    githubUrl: orNull(body.githubUrl),
    liveUrl: orNull(body.liveUrl),
    tags: Array.isArray(body.tags) ? body.tags.join(',') : String(body.tags ?? ''),
    specs: orNull(body.specs),
    featured: Boolean(body.featured),
    order: Number(body.order) || 0,

    // Case study. All optional, all null when blank, so an untouched project
    // keeps `hasCaseStudy()` false and never links to a detail page.
    problem: orNull(body.problem),
    audience: orNull(body.audience),
    context: orNull(body.context),
    constraints: orNull(body.constraints),
    myRole: orNull(body.myRole),
    responsibilities: orNull(body.responsibilities),
    approach: orNull(body.approach),
    keyDecisions: orNull(body.keyDecisions),
    challenges: orNull(body.challenges),
    tradeoffs: orNull(body.tradeoffs),
    outcome: orNull(body.outcome),
    lessons: orNull(body.lessons),
    status: orNull(body.status),
    caseStudyUrl: orNull(body.caseStudyUrl),
  }
}
