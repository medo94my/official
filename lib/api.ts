import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { UnauthorizedError } from '@/lib/auth'
import { revalidateContent } from '@/lib/content'

/**
 * Success response for a write that changed something the public site renders.
 *
 * The revalidation is the point, and it is folded into the response helper on
 * purpose: `getSiteContent()` is cached for 60 seconds, so a route that returns
 * a bare `NextResponse.json` leaves the owner staring at an unchanged page
 * after a successful save. Making the *success path itself* carry the
 * invalidation means the failure mode of forgetting is a compile-time-visible
 * `NextResponse.json` in a mutation handler rather than a stale site nobody
 * connects to a missing line.
 *
 * Only for public content. `/api/inquiries` deliberately does not use it —
 * nothing in the Inquiry table is rendered publicly, and invalidating the whole
 * site because someone archived a message would be pure waste.
 */
export function contentChanged<T>(body: T, init?: ResponseInit) {
  revalidateContent()
  return NextResponse.json(body, init)
}

/**
 * One error mapping for every route handler.
 *
 * Replaces the per-route `catch (error: any) { if (error.message ===
 * 'Unauthorized') … return 500 }`, which reported every non-auth failure as
 * "Failed to create project". The common real case is P2002: `Project.title`,
 * `Project.slug`, `Service.title` and `Stat.label` are all unique, and the
 * admin forms let you type a duplicate. That deserves a 409 naming the field,
 * not a 500.
 */
export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', fieldErrors: error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = error.meta?.target
      const fields = Array.isArray(target) ? target.join(', ') : 'value'
      return NextResponse.json(
        { error: `Already exists: ${fields}` },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

  // Unrecognised: log the real thing server-side, tell the client nothing.
  console.error('[api]', error)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}
