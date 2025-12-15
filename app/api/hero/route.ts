import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const hero = await prisma.hero.findFirst()
    return NextResponse.json(hero)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch hero info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()

    const existing = await prisma.hero.findFirst()

    let hero
    if (existing) {
      hero = await prisma.hero.update({
        where: { id: existing.id },
        data: {
          headline: body.headline,
          subheadline: body.subheadline,
          ctaText: body.ctaText,
          ctaUrl: body.ctaUrl,
          background: body.background,
        },
      })
    } else {
      hero = await prisma.hero.create({
        data: {
          headline: body.headline,
          subheadline: body.subheadline,
          ctaText: body.ctaText || 'View My Work',
          ctaUrl: body.ctaUrl || '#portfolio',
          background: body.background,
        },
      })
    }

    return NextResponse.json(hero)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update hero info' },
      { status: 500 }
    )
  }
}
