import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'
import { serviceFields } from '@/lib/service-fields'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ kind: 'asc' }, { order: 'asc' }],
    })
    return NextResponse.json(services)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const service = await prisma.service.create({
      data: serviceFields(await request.json()),
    })

    return contentChanged(service, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
