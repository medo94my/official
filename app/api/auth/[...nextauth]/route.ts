import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// Next.js route handlers may only export HTTP method handlers — `authOptions`
// lives in lib/auth-options.ts so this file type-checks during `next build`.
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
