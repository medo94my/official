import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'

/**
 * A typed error, so route handlers can identify it with `instanceof` rather
 * than by matching `error.message === 'Unauthorized'`. String matching meant
 * every other failure — including a Prisma unique-constraint violation, which
 * the admin forms can trigger just by typing a duplicate title — fell through
 * to a generic 500.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw new UnauthorizedError()
  }

  return session
}
