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
    const skill = await prisma.skill.update({
      where: { id: params.id },
      data: {
        name: body.name,
        category: body.category,
        icon: body.icon,
        level: body.level,
        order: body.order,
      },
    })

    return contentChanged(skill)
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

    await prisma.skill.delete({
      where: { id: params.id },
    })

    return contentChanged({ message: 'Skill deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
