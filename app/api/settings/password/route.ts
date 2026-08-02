import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

/**
 * Changes the signed-in administrator's password.
 *
 * Until now this was an out-of-band operation: edit `ADMIN_PASSWORD` in .env,
 * then re-run the seed so it gets re-hashed into the User row. That is a poor
 * fit for the one credential most likely to need changing in a hurry, and it
 * meant the plaintext had to exist in a file on the host to be changeable at
 * all.
 *
 * The env var is not touched here. It is read only by the seed on a fresh
 * install; after this route runs, the User row and `ADMIN_PASSWORD` disagree,
 * and the User row is what authentication actually consults. That is stated in
 * the response so it does not become a confusing discovery later.
 */
export const dynamic = 'force-dynamic'

const schema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  // 12 rather than 8: this guards a publicly reachable admin panel with no
  // login throttling in front of it, so length is the only real defence.
  newPassword: z
    .string()
    .min(12, 'Use at least 12 characters')
    .max(200, 'That is longer than any password manager will thank you for'),
})

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()

    const { currentPassword, newPassword } = schema.parse(await request.json())

    // The session identifies who is changing their own password. Taking the
    // email from the request body instead would let an authenticated session
    // change a different account's password.
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Requiring the current password is what stops a borrowed or stolen session
    // — an unlocked laptop, a leaked JWT — from being escalated into permanent
    // control of the account.
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json(
        { error: 'That is not your current password' },
        { status: 403 }
      )
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json(
        { error: 'That is already your password' },
        { status: 400 }
      )
    }

    // Cost 10, matching lib/migrate-old-data.ts, so a password set here and one
    // set by the seed are indistinguishable to the verifier.
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    })

    return NextResponse.json({
      ok: true,
      // Sessions are JWTs, so existing ones stay valid until they expire —
      // changing the password does not sign anyone out. Saying so beats letting
      // someone assume they have just locked out a device they no longer have.
      note: 'Password updated. Sessions already signed in stay signed in until they expire.',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
