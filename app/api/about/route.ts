import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const about = await prisma.about.findFirst()
    return NextResponse.json(about)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch about info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()

    // Check if about record exists
    const existing = await prisma.about.findFirst()

    let about
    if (existing) {
      about = await prisma.about.update({
        where: { id: existing.id },
        data: {
          name: body.name,
          title: body.title,
          bio: body.bio,
          email: body.email,
          phone: body.phone,
          location: body.location,
          avatar: body.avatar,
          resume: body.resume,
          github: body.github,
          linkedin: body.linkedin,
          twitter: body.twitter,
        },
      })
    } else {
      about = await prisma.about.create({
        data: {
          name: body.name,
          title: body.title,
          bio: body.bio,
          email: body.email,
          phone: body.phone,
          location: body.location,
          avatar: body.avatar,
          resume: body.resume,
          github: body.github,
          linkedin: body.linkedin,
          twitter: body.twitter,
        },
      })
    }

    return NextResponse.json(about)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update about info' },
      { status: 500 }
    )
  }
}
