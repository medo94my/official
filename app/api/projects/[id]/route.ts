import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { projectFields } from '@/lib/project-fields'
import { removeMediaFile } from '@/lib/media-store'
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

    // Read the media before the delete. The rows cascade, but the *files* do
    // not — and once the rows are gone nothing knows which files to unlink, so
    // every deleted project would silently leak its screenshots into the volume
    // forever.
    const media = await prisma.projectMedia.findMany({
      where: { projectId: params.id },
      select: { url: true, poster: true },
    })

    await prisma.project.delete({
      where: { id: params.id },
    })

    for (const item of media) {
      await removeMediaFile(item.url)
      await removeMediaFile(item.poster)
    }

    return contentChanged({ message: 'Project deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
