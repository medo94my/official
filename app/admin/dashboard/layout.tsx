'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/dashboard/projects', label: 'Projects' },
  { href: '/admin/dashboard/skills', label: 'Skills' },
  { href: '/admin/dashboard/services', label: 'Services' },
  { href: '/admin/dashboard/stats', label: 'Stats' },
  { href: '/admin/dashboard/about', label: 'About' },
  { href: '/admin/dashboard/hero', label: 'Hero Section' },
]

const NAV_ITEM =
  'block border-l-2 px-4 py-3 font-mono text-meta transition-colors'

/** Marking the current page is information the old sidebar simply omitted. */
function navClass(active: boolean) {
  return active
    ? `${NAV_ITEM} border-ink bg-shelf text-ink`
    : `${NAV_ITEM} border-transparent text-muted hover:border-rule hover:text-ink`
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  // Close the drawer on navigation, otherwise it stays over the page you just
  // opened.
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="label">Loading…</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-paper">
      <Toaster
        position="top-right"
        toastOptions={{
          // Match the page rather than the library default.
          style: {
            background: '#FFFFFF',
            color: '#16191C',
            border: '1px solid #DCE0E2',
            borderRadius: 0,
            fontSize: '0.8125rem',
          },
        }}
      />

      {/* Mobile top bar — the only way to reach the nav below lg */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 z-30 flex items-center justify-between px-4 bg-panel border-b border-rule">
        <span className="font-mono text-meta font-semibold uppercase tracking-[0.09em]">Portfolio CMS</span>
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
          aria-expanded={navOpen}
          className="w-11 h-11 -mr-2 flex items-center justify-center text-muted hover:text-ink"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Drawer backdrop */}
      {navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          className="lg:hidden fixed inset-0 bg-ink/40 z-40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar — off-canvas below lg, static from lg up */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-panel border-r border-rule z-50 overflow-y-auto
          transform transition-transform duration-200 ease-in-out lg:translate-x-0
          ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-mono text-meta font-semibold uppercase tracking-[0.09em]">Portfolio CMS</h1>
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center text-muted hover:text-ink"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={navClass(pathname === link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-rule pt-6">
            <Link href="/" className={navClass(false)}>
              View site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full border-l-2 border-transparent px-4 py-3 text-left font-mono text-meta text-danger transition-colors hover:border-danger hover:bg-shelf"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content — pt-20 clears the mobile top bar; px-4 reclaims the
          width phones cannot spare from the old uniform p-8 */}
      <div className="lg:ml-64">
        <div className="pt-20 px-4 pb-8 lg:p-8">
          <div className="mb-6">
            <p className="label">
              Signed in as <span className="text-ink">{session.user.email}</span>
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
