import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { join } from 'path'
import { Readable } from 'stream'
import { NextRequest, NextResponse } from 'next/server'
import { CONTENT_TYPES, safeMediaName } from '@/lib/media'
import { MEDIA_DIR } from '@/lib/media-store'

/**
 * Serves uploaded screenshots and clips.
 *
 * This route exists because **Next's standalone server does not serve files
 * added to `public/` after the build**. That was measured, not assumed: a file
 * written into `/app/public/media` on a running container 404s, and
 * `/_next/image` on it returns 400. The public directory is fixed at build time,
 * so anything uploaded at runtime has to be served deliberately.
 *
 * Public on purpose — these are portfolio images on a portfolio site. The
 * *writing* of them is what requires authentication.
 */
export const dynamic = 'force-dynamic'

/**
 * Range support is not optional for video.
 *
 * Safari will not begin playback of a resource whose server does not answer a
 * range request, and it issues one before it plays anything. Without this the
 * clips simply never start on iOS, which is a large share of the audience for a
 * portfolio link shared in a message.
 */
function parseRange(header: string | null, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header ?? '')
  if (!match) return null

  const [, rawStart, rawEnd] = match
  // A suffix range, "bytes=-500", means the last 500 bytes.
  const start = rawStart === '' ? size - Number(rawEnd) : Number(rawStart)
  const end = rawStart === '' || rawEnd === '' ? size - 1 : Number(rawEnd)

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  if (start < 0 || end >= size || start > end) return null
  return { start, end }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  // The single point where a request-supplied string meets the filesystem. It
  // must match the shape `mediaFilename` produces — no slash, no dot-segment,
  // known extension — or it never becomes a path at all.
  const name = safeMediaName(params.name)
  if (!name) return new NextResponse('Not found', { status: 404 })

  const path = join(MEDIA_DIR, name)

  let size: number
  try {
    const info = await stat(path)
    if (!info.isFile()) return new NextResponse('Not found', { status: 404 })
    size = info.size
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  const contentType = CONTENT_TYPES[name.slice(name.lastIndexOf('.') + 1)]
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    // Two different lifetimes, deliberately.
    //
    // `max-age` is a year because the random suffix makes these effectively
    // content-addressed: a replaced screenshot gets a new name, never the same
    // name with new bytes. A browser that already has one can keep it.
    //
    // `s-maxage` is an hour because a *deleted* file is a different problem
    // from a changed one. Measured: after deleting a project, the file was gone
    // from disk and still served 200 from the edge. If a screenshot is removed
    // because it showed something it should not have, it must stop reaching new
    // viewers in minutes, not next year. Browsers ignore s-maxage; CDNs use it.
    'Cache-Control': 'public, max-age=31536000, s-maxage=3600, immutable',
    'Accept-Ranges': 'bytes',
    // These are owner-supplied binaries served from the same origin as the
    // admin. Belt and braces against a crafted file being interpreted as markup.
    'X-Content-Type-Options': 'nosniff',
  }

  const range = parseRange(request.headers.get('range'), size)

  if (range) {
    const stream = createReadStream(path, { start: range.start, end: range.end })
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...headers,
        'Content-Range': `bytes ${range.start}-${range.end}/${size}`,
        'Content-Length': String(range.end - range.start + 1),
      },
    })
  }

  // Streamed rather than read into a Buffer: a 25 MB clip would otherwise sit
  // in memory once per concurrent request.
  const stream = createReadStream(path)
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: { ...headers, 'Content-Length': String(size) },
  })
}
