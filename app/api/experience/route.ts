import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { experienceFields } from '@/lib/experience-fields'
import { getExperience } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getExperience())
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const entry = await prisma.experience.create({
      data: experienceFields(await request.json()),
    })

    return contentChanged(entry, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
