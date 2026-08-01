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
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        icon: body.icon,
        order: body.order,
      },
    })

    return contentChanged(service)
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

    await prisma.service.delete({
      where: { id: params.id },
    })

    return contentChanged({ message: 'Service deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
