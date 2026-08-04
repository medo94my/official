import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { removeMediaFile } from '@/lib/media-store'
import { postFields, resolvePublishedAt } from '@/lib/post-fields'
import { slugify } from '@/lib/slug'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const body = (await request.json()) as Record<string, unknown>
    const fields = postFields(body)

    if (!fields.title || !fields.summary) {
      return NextResponse.json(
        { error: 'A title and a summary are both required.' },
        { status: 400 }
      )
    }

    const existing = await prisma.post.findUnique({
      where: { id: params.id },
      select: { publishedAt: true, coverImage: true, body: true, aiDrafted: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // The moment a human edits the body, it stops being the model's text and
    // the unreviewed notice comes down. Comparing the body is what makes that
    // automatic rather than another checkbox nobody remembers to tick.
    const aiDrafted = existing.aiDrafted && fields.body === existing.body

    // A replaced cover leaves its predecessor on disk otherwise, and nothing
    // afterwards knows the old filename to clean it up.
    if (existing.coverImage && existing.coverImage !== fields.coverImage) {
      await removeMediaFile(existing.coverImage)
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...fields,
        aiDrafted,
        ...(typeof body.slug === 'string' && body.slug.trim()
          ? { slug: slugify(body.slug) }
          : {}),
        publishedAt:
          resolvePublishedAt(fields.status, existing.publishedAt) ?? existing.publishedAt,
      },
    })

    return contentChanged(post)
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

    // Read the cover before the row goes, or nothing knows which file to unlink
    // and every deleted post leaks its image into the volume permanently.
    const existing = await prisma.post.findUnique({
      where: { id: params.id },
      select: { coverImage: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.post.delete({ where: { id: params.id } })
    await removeMediaFile(existing.coverImage)

    return contentChanged({ message: 'Post deleted' })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handleApiError(error)
  }
}
