import { ImageResponse } from 'next/og'
import { getAbout, getSkills, groupSkillsByCategory } from '@/lib/content'
import {
  OgCard,
  OG_CONTENT_TYPE,
  OG_DESCRIPTION_MAX,
  OG_SIZE,
  clamp,
} from '@/lib/og'
import { FALLBACK_IDENTITY } from '@/lib/site'

/**
 * The site's link preview, built from the About record.
 *
 * Dynamic because the content is: changing your title in the dashboard should
 * change what a shared link looks like, without a rebuild. Crawlers are the
 * only real traffic here, and they fetch it once.
 */
export const dynamic = 'force-dynamic'
export const alt = 'Portfolio'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OpengraphImage() {
  const [about, skills] = await Promise.all([
    getAbout().catch(() => null),
    getSkills().catch(() => []),
  ])

  const name = about?.name || FALLBACK_IDENTITY.name
  const title = about?.title || FALLBACK_IDENTITY.title

  // The bio's first paragraph, not the whole thing — a card is a headline, and
  // the rest of the bio is on the page it links to.
  const intro = about?.bio?.split(/\n\s*\n/)[0]?.trim()

  // Categories rather than every skill name: "Languages · Backend · Infra"
  // says where someone works; twenty tool names say nothing at thumbnail size.
  const categories = groupSkillsByCategory(skills)
    .slice(0, 4)
    .map(([category]) => category)
    .join('  ·  ')

  return new ImageResponse(
    (
      <OgCard
        eyebrow={title}
        title={name}
        description={intro ? clamp(intro, OG_DESCRIPTION_MAX) : undefined}
        meta={categories || undefined}
      />
    ),
    size
  )
}
