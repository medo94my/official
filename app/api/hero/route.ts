import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { contentChanged, handleApiError } from '@/lib/api'

// Without this Next statically prerenders the GET at build time and the
// dashboard would keep reading stale content after every edit.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hero = await prisma.hero.findFirst()
    return NextResponse.json(hero)
  } catch (error) {
    return handleApiError(error)
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
          valueProp: body.valueProp || null,
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
          valueProp: body.valueProp || null,
          ctaText: body.ctaText || 'View My Work',
          ctaUrl: body.ctaUrl || '#portfolio',
          background: body.background,
        },
      })
    }

    return contentChanged(hero)
  } catch (error) {
    return handleApiError(error)
  }
}
