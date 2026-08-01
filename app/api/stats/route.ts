import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const stat = await prisma.stat.create({
      data: {
        label: body.label,
        value: body.value,
        order: body.order || 0,
      },
    })

    return contentChanged(stat, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
