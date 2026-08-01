import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const body = await request.json()
    const stat = await prisma.stat.update({
      where: { id: params.id },
      data: {
        label: body.label,
        value: body.value,
        order: body.order,
      },
    })

    return contentChanged(stat)
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

    await prisma.stat.delete({ where: { id: params.id } })

    return contentChanged({ message: 'Stat deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
