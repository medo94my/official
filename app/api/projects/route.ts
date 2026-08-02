import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { getProjects } from '@/lib/content'
import { projectFields } from '@/lib/project-fields'
import { slugify } from '@/lib/slug'

export const dynamic = 'force-dynamic'

// GET all projects
export async function GET() {
  try {
    return NextResponse.json(await getProjects())
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const project = await prisma.project.create({
      data: {
        ...projectFields(body),
        // Falls back to the title so a slug is never absent; the form sends an
        // explicit one when the owner has overridden it.
        slug: slugify(body.slug || body.title || ''),
      },
    })

    return contentChanged(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
