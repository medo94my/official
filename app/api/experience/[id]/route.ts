import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { experienceFields } from '@/lib/experience-fields'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.experience.findUnique({ where: { id: params.id } })
    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(entry)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const entry = await prisma.experience.update({
      where: { id: params.id },
      data: experienceFields(await request.json()),
    })

    return contentChanged(entry)
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
    await prisma.experience.delete({ where: { id: params.id } })
    return contentChanged({ message: 'Deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
