import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { postFields, resolvePublishedAt } from '@/lib/post-fields'
import { slugify } from '@/lib/slug'

/**
 * Posts, for the dashboard.
 *
 * `GET` is authenticated even though most posts are public, because this list
 * includes drafts — the public reads live in `lib/content.ts` and filter by
 * status there, so there is no unauthenticated path to an unpublished post.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAuth()
    return NextResponse.json(
      await prisma.post.findMany({
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = (await request.json()) as Record<string, unknown>
    const fields = postFields(body)

    if (!fields.title) {
      return NextResponse.json({ error: 'A title is required.' }, { status: 400 })
    }
    if (!fields.summary) {
      return NextResponse.json(
        { error: 'A summary is required — it is the index entry, the search result and the feed text.' },
        { status: 400 }
      )
    }

    const slug = slugify(String(body.slug || '') || fields.title)
    if (!slug) {
      return NextResponse.json(
        { error: 'That title produces an empty URL. Set a slug explicitly.' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        ...fields,
        slug,
        publishedAt: resolvePublishedAt(fields.status, null) ?? null,
      },
    })

    return contentChanged(post, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // handleApiError turns Prisma's P2002 into a 409 naming the duplicate
    // field, which is what a clashing title or slug needs to say.
    return handleApiError(error)
  }
}
