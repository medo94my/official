import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(skills)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const skill = await prisma.skill.create({
      data: {
        name: body.name,
        category: body.category,
        icon: body.icon,
        level: body.level || 50,
        order: body.order || 0,
      },
    })

    return contentChanged(skill, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
