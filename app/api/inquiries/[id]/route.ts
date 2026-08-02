import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api'

export const dynamic = 'force-dynamic'

const STATUSES = new Set(['new', 'read', 'replied', 'archived'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const body = await request.json()
    const status = String(body.status ?? '')

    if (!STATUSES.has(status)) {
      return NextResponse.json({ error: 'Unknown status' }, { status: 400 })
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        status,
        // Timestamps are set the first time a state is reached and not
        // overwritten afterwards, so re-reading a message does not rewrite
        // when it was first opened.
        ...(status === 'read' ? { readAt: new Date() } : {}),
        ...(status === 'replied' ? { repliedAt: new Date() } : {}),
      },
    })

    return NextResponse.json(inquiry)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    // Hard delete, not a soft flag: an inquiry holds someone else's name and
    // email address, and "delete" has to mean gone.
    await prisma.inquiry.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
