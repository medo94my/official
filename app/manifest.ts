import type { MetadataRoute } from 'next'
import { getAbout } from '@/lib/content'
import { FALLBACK_IDENTITY } from '@/lib/site'
import { themeColor } from '@/lib/tokens'

/**
 * Web app manifest.
 *
 * Modest on purpose. This is a portfolio, not an app: `display: 'browser'`
 * rather than `standalone`, because a site whose whole job is to be linked,
 * shared and read should keep the browser's address bar and back button. An
 * installed-app shell here would take away navigation and give nothing back.
 *
 * The name is read from the About record so the home-screen label follows the
 * dashboard rather than being a second place the owner's name is written down.
 */
export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const about = await getAbout().catch(() => null)
  const name = about?.name || FALLBACK_IDENTITY.name
  const title = about?.title || FALLBACK_IDENTITY.title

  return {
    name: `${name} — ${title}`,
    short_name: name,
    description:
      about?.bio?.split(/\n\s*\n/)[0]?.trim() || `${name} — ${title}`,
    start_url: '/',
    display: 'browser',
    // Matches --background in globals.css for each scheme. The splash uses the
    // light ground because that is what the site defaults to on a device with
    // no stated preference.
    background_color: themeColor.light,
    theme_color: themeColor.light,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  }
}
