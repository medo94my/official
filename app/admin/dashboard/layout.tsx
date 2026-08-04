'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'

// Ordered as the sections appear on the public page, so the sidebar reads as
// a map of the site rather than an arbitrary list of tables.
const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/dashboard/inbox', label: 'Inbox' },
  { href: '/admin/dashboard/hero', label: 'Hero' },
  { href: '/admin/dashboard/projects', label: 'Projects' },
  { href: '/admin/dashboard/blog', label: 'Blog' },
  { href: '/admin/dashboard/services', label: 'Services' },
  { href: '/admin/dashboard/skills', label: 'Skills' },
  { href: '/admin/dashboard/experience', label: 'Experience' },
  { href: '/admin/dashboard/stats', label: 'Stats' },
  { href: '/admin/dashboard/about', label: 'About' },
  // Last, and separated in the sidebar: configuration rather than content.
  { href: '/admin/dashboard/settings', label: 'Settings' },
]

const NAV_ITEM =
  'block border-l-2 px-4 py-3 font-mono text-meta transition-colors'

/** Marking the current page is information the old sidebar simply omitted. */
function navClass(active: boolean) {
  return active
    ? `${NAV_ITEM} border-foreground bg-background-subtle text-foreground`
    : `${NAV_ITEM} border-transparent text-foreground-muted hover:border-border hover:text-foreground`
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="label">Loading…</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-right"
        toastOptions={{
          // Custom properties, not literal hex: react-hot-toast renders these
          // as inline styles, which resolve against the document, so the
          // toast follows the theme. Hardcoded hex here would leave light
          // toasts sitting on a dark admin.
          style: {
            background: 'rgb(var(--surface-elevated))',
            color: 'rgb(var(--foreground))',
            border: '1px solid rgb(var(--border))',
            borderRadius: '0.1875rem',
            fontSize: '0.8125rem',
          },
        }}
      />

      {/* Mobile top bar — the only way to reach the nav below lg */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 z-30 flex items-center justify-between px-4 bg-surface border-b border-border">
        <span className="font-mono text-meta font-semibold uppercase tracking-[0.09em]">Portfolio CMS</span>
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
          aria-expanded={navOpen}
          className="w-11 h-11 -mr-2 flex items-center justify-center text-foreground-muted hover:text-foreground"
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
          className="lg:hidden fixed inset-0 bg-foreground/40 z-40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar — off-canvas below lg, static from lg up */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-50 overflow-y-auto
          transform transition-transform duration-200 ease-in-out lg:translate-x-0
          ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-mono text-meta font-semibold uppercase tracking-[0.09em]">Portfolio CMS</h1>
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center text-foreground-muted hover:text-foreground"
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

          <div className="mt-8 border-t border-border pt-6">
            <Link href="/" className={navClass(false)}>
              View site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full border-l-2 border-transparent px-4 py-3 text-left font-mono text-meta text-error transition-colors hover:border-error hover:bg-background-subtle"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content — pt-20 clears the mobile top bar; px-4 reclaims the
          width phones cannot spare from the old uniform p-8 */}
      <div className="lg:ml-64">
        {/* A real main landmark with the id SkipLink targets. The dashboard is
            the page with the most chrome to tab past — sidebar, drawer trigger,
            nine nav links — so this is where skipping matters most, and it was
            the one place the link had no destination. */}
        <main id="main" tabIndex={-1} className="pt-20 px-4 pb-8 outline-none lg:p-8">
          <div className="mb-6">
            <p className="label">
              Signed in as <span className="text-foreground">{session.user.email}</span>
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
