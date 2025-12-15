import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(projects)
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
        title: body.title,
        description: body.description,
        type: body.type,
        image: body.image,
        githubUrl: body.githubUrl,
        liveUrl: body.liveUrl,
        tags: body.tags || [],
        featured: body.featured || false,
        order: body.order || 0,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
