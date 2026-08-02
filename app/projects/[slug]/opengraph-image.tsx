import { ImageResponse } from 'next/og'
import { getProjectBySlug, hasCaseStudy } from '@/lib/content'
import {
  OgCard,
  OG_CONTENT_TYPE,
  OG_DESCRIPTION_MAX,
  OG_SIZE,
  clamp,
} from '@/lib/og'

/**
 * A link preview per project.
 *
 * This is what turns a shared case-study URL into something worth clicking:
 * without it every project link renders the same site-wide card, so three
 * different projects posted in the same thread are indistinguishable.
 *
 * The eyebrow is honest about what is behind the link — "Case study" only when
 * there is actually prose to read, "Project" otherwise. Promising a write-up
 * that turns out to be a title and two links is the kind of small lie that
 * costs the click after this one.
 */
export const dynamic = 'force-dynamic'
export const alt = 'Project'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function ProjectOpengraphImage({
  params,
}: {
  params: { slug: string }
}) {
  const project = await getProjectBySlug(params.slug).catch(() => null)

  // Deliberately not notFound(): a 404 here would make the *page* look broken
  // to a crawler that fetched the image after the page. A generic card is the
  // better failure.
  if (!project) {
    return new ImageResponse(<OgCard title="Project not found" />, size)
  }

  return new ImageResponse(
    (
      <OgCard
        eyebrow={hasCaseStudy(project) ? 'Case study' : 'Project'}
        title={clamp(project.title, 70)}
        description={clamp(project.description, OG_DESCRIPTION_MAX)}
        meta={project.tags.slice(0, 5).join('  ·  ') || undefined}
      />
    ),
    size
  )
}
