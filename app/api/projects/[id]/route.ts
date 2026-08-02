import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { projectFields } from '@/lib/project-fields'
import { slugify } from '@/lib/slug'

// GET single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Transform tags from string to array
    const projectWithArrayTags = {
      ...project,
      tags: project.tags ? project.tags.split(',').filter(Boolean) : [],
    }

    return NextResponse.json(projectWithArrayTags)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const body = await request.json()
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...projectFields(body),
        // Only when explicitly sent. A project's slug is its URL, so it must
        // not silently change every time the title is edited.
        ...(body.slug ? { slug: slugify(String(body.slug)) } : {}),
      },
    })

    return contentChanged(project)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    await prisma.project.delete({
      where: { id: params.id },
    })

    return contentChanged({ message: 'Project deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
