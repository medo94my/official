import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { contentChanged, handleApiError } from '@/lib/api'
import { removeMediaFile } from '@/lib/media-store'

/** Editing one gallery item: its alt text and position, or removing it. */
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const body = (await request.json().catch(() => ({}))) as {
      alt?: unknown
      order?: unknown
    }

    const data: { alt?: string; order?: number } = {}
    if (typeof body.alt === 'string') data.alt = body.alt.slice(0, 300)
    if (typeof body.order === 'number' && Number.isFinite(body.order)) {
      data.order = Math.round(body.order)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
    }

    return contentChanged(await prisma.projectMedia.update({ where: { id: params.id }, data }))
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    // Read before delete: the row is the only record of which file to unlink,
    // so losing it first would leak the file permanently.
    const media = await prisma.projectMedia.findUnique({
      where: { id: params.id },
      select: { url: true, poster: true },
    })
    if (!media) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.projectMedia.delete({ where: { id: params.id } })
    await removeMediaFile(media.url)
    await removeMediaFile(media.poster)

    return contentChanged({ ok: true })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handleApiError(error)
  }
}
