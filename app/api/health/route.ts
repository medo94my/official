import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Liveness and readiness for the container healthcheck.
 *
 * `restart: unless-stopped` only notices a process that has exited. A Node
 * process that is running but cannot reach Postgres, or is wedged, keeps the
 * container "up" and keeps serving errors indefinitely. This gives Docker
 * something it can actually judge.
 *
 * The database round trip is the point rather than an extra: a reply of "the
 * web server answered" is true of an app that cannot read a single row, which
 * is the failure worth restarting for. `SELECT 1` costs nothing and touches no
 * table.
 *
 * Unauthenticated, because a healthcheck cannot hold a session — so it says
 * only whether the two moving parts respond. No versions, no connection
 * strings, no error text: a stack trace here would be a free map of the
 * internals for anyone who curls it.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startedAt = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json(
      { status: 'ok', database: 'ok', latencyMs: Date.now() - startedAt },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    // Logged in full server-side, where it is useful, and never returned.
    console.error('[health] database unreachable', error)
    return NextResponse.json(
      { status: 'degraded', database: 'unreachable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
