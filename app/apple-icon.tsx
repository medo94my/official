import { ImageResponse } from 'next/og'
import { brand } from '@/lib/tokens'

/**
 * The iOS home-screen icon.
 *
 * Generated rather than checked in as a binary: it is the same three
 * rectangles as `icon.svg`, and keeping one of them a PNG in `public/` would
 * mean the mark could drift between the tab and the home screen with nothing
 * to catch it. Apple ignores SVG touch icons, so this has to be a raster —
 * `ImageResponse` is the way to keep it derived from the source.
 *
 * No transparency and no rounding: iOS masks the corners itself, and a
 * pre-rounded icon gets rounded twice.
 */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: brand.onyx,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 39,
          gap: 28,
        }}
      >
        <div style={{ width: 101, height: 23, background: brand.gold }} />
        <div style={{ width: 51, height: 23, background: brand.ivory }} />
      </div>
    ),
    size
  )
}
