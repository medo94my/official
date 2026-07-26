import { withAuth } from 'next-auth/middleware'

// Guards the admin area at the edge. The dashboard layout also redirects
// client-side, but this stops unauthenticated requests before any dashboard
// HTML is sent. API routes are separately guarded by requireAuth().
//
// `pages` is repeated here because middleware runs in the edge runtime and
// cannot import authOptions (it pulls in Prisma and bcrypt).
export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
})

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
