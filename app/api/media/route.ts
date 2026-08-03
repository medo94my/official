import { writeFile } from 'fs/promises'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { contentChanged, handleApiError } from '@/lib/api'
import { MAX_BYTES, checkMedia, mediaFilename } from '@/lib/media'
import { MEDIA_DIR, ensureMediaDir, removeMediaFile } from '@/lib/media-store'

/**
 * Uploading a screenshot or a clip for a project.
 *
 * The only endpoint on the site that writes request-supplied bytes to disk, so
 * the validation in `lib/media.ts` is the point of it. Three properties matter
 * and each is enforced here rather than assumed:
 *
 * - **Authenticated first.** `requireAuth()` is the first statement.
 * - **The file type comes from the bytes**, never the declared Content-Type.
 * - **No part of the path comes from the request** — the name is built from the
 *   project's own slug plus random bytes.
 *
 * Returns through `contentChanged()`: media renders on the public case-study
 * page, so a new screenshot must invalidate that cache or it appears a minute
 * late and looks like a failed upload.
 */
export const dynamic = 'force-dynamic'

/** Enough for every signature in the table, and cheap to read. */
const HEADER_BYTES = 16

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const form = await request.formData()
    const file = form.get('file')
    const projectId = String(form.get('projectId') ?? '')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    // Before anything is read into memory: the largest cap in the table, so an
    // oversized upload is refused on the declared size rather than after it has
    // been buffered.
    if (file.size > Math.max(...Object.values(MAX_BYTES))) {
      return NextResponse.json(
        { error: `That file is too large. The limit is 25 MB for video, 5 MB for images.` },
        { status: 413 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, slug: true, _count: { select: { media: true } } },
    })
    if (!project) {
      return NextResponse.json(
        { error: 'Save the project before adding media to it.' },
        { status: 404 }
      )
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const verdict = checkMedia(bytes.subarray(0, HEADER_BYTES), bytes.length, file.type)
    if (!verdict.ok) {
      return NextResponse.json({ error: verdict.reason }, { status: 415 })
    }

    const name = mediaFilename(project.slug, verdict.type.ext)
    await ensureMediaDir()
    await writeFile(join(MEDIA_DIR, name), bytes)

    const url = `/media/${name}`
    const width = numberOrNull(form.get('width'))
    const height = numberOrNull(form.get('height'))

    try {
      const media = await prisma.projectMedia.create({
        data: {
          projectId: project.id,
          kind: verdict.type.kind,
          url,
          alt: String(form.get('alt') ?? '').slice(0, 300),
          width,
          height,
          order: project._count.media,
        },
      })
      return contentChanged(media, { status: 201 })
    } catch (error) {
      // The row is the record; a file with no row is invisible and unreachable.
      // Removing it keeps the volume from filling with orphans over time.
      await removeMediaFile(url)
      throw error
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handleApiError(error)
  }
}

/** Browser-reported dimensions. Wrong values cost a layout shift, nothing more. */
function numberOrNull(value: FormDataEntryValue | null) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}
