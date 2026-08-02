import { brand } from './tokens'
import { SITE_URL } from './site'

/**
 * The shared frame for every generated Open Graph card.
 *
 * One layout, two callers (the site card and the per-project card), so a link
 * to a case study and a link to the homepage are visibly the same site. The
 * previous `public/og.png` was a hand-made file from the old visual language
 * that hardcoded a location, a stack list and a GitHub handle — three facts
 * that live in the database and had already drifted. Generating the card means
 * it cannot drift again.
 *
 * No custom font is loaded. `next/font` writes its files into the build output
 * under hashed names, so reading them back at runtime is fragile, and fetching
 * from Google at request time would put a network call on the critical path of
 * an image a crawler is waiting for. The default sans is plain, so the layout
 * does the work: brand ground, the keystone bar, and type large enough to read
 * in a timeline thumbnail.
 *
 * Onyx in both themes — an OG card has no media query, and gold on onyx is the
 * pairing that reads at 8.08:1.
 */

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/**
 * Truncates on a word boundary so a card never ends mid-word.
 *
 * Trailing punctuation is stripped before the ellipsis: several project
 * descriptions run "…built for reliability on dynamic pages: retries, …", and
 * cutting there leaves "dynamic pages:…", which reads as a rendering fault
 * rather than an abridgement.
 */
export function clamp(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  const body = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${body.replace(/[\s,;:.\-–—]+$/, '')}…`
}

/**
 * Description budget, in characters.
 *
 * Two lines at 30px in a 1040px column. Three lines fit, but a link preview is
 * scanned in about a second and the third line is never read — it just pushes
 * the footer rule down and makes the card look like a paragraph.
 */
export const OG_DESCRIPTION_MAX = 118

type OgCardProps = {
  /** Small line above the title: a role, or "Case study". */
  eyebrow?: string
  title: string
  description?: string
  /** Right-hand side of the footer rule. Usually a stack or tag list. */
  meta?: string
}

export function OgCard({ eyebrow, title, description, meta }: OgCardProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: brand.onyx,
        padding: '72px 80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* The keystone, same proportion as the one under the hero headline. */}
        <div style={{ width: 96, height: 6, background: brand.gold }} />

        {eyebrow ? (
          <div
            style={{
              marginTop: 40,
              fontSize: 24,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: brand.gold,
            }}
          >
            {eyebrow}
          </div>
        ) : null}

        <div
          style={{
            marginTop: eyebrow ? 20 : 44,
            fontSize: title.length > 40 ? 62 : 78,
            lineHeight: 1.08,
            letterSpacing: -2,
            fontWeight: 700,
            color: brand.ivory,
          }}
        >
          {title}
        </div>

        {description ? (
          <div
            style={{
              marginTop: 26,
              fontSize: 30,
              lineHeight: 1.42,
              // Ivory at reduced opacity rather than a second grey: the card
              // stays two colours plus gold.
              color: 'rgba(236, 228, 210, 0.72)',
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid rgba(236, 228, 210, 0.18)',
          paddingTop: 26,
          fontSize: 24,
          color: 'rgba(236, 228, 210, 0.55)',
        }}
      >
        <div style={{ display: 'flex' }}>{SITE_URL.replace(/^https?:\/\//, '')}</div>
        {meta ? (
          <div style={{ display: 'flex', maxWidth: 620, justifyContent: 'flex-end' }}>
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  )
}
