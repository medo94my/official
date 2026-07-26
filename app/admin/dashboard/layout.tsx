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
  'block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster position="top-right" />

      {/* Mobile top bar — the only way to reach the nav below lg */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 z-30 flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700">
        <span className="text-lg font-bold text-white">Portfolio CMS</span>
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
          aria-expanded={navOpen}
          className="w-11 h-11 -mr-2 flex items-center justify-center text-gray-300 hover:text-white"
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
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar — off-canvas below lg, static from lg up */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 z-50 overflow-y-auto
          transform transition-transform duration-200 ease-in-out lg:translate-x-0
          ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Portfolio CMS</h1>
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={NAV_ITEM}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <Link href="/" className={`${NAV_ITEM} mb-1`}>
              View Portfolio
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content — pt-20 clears the mobile top bar; px-4 reclaims the
          width phones cannot spare from the old uniform p-8 */}
      <div className="lg:ml-64">
        <div className="pt-20 px-4 pb-8 lg:p-8">
          <div className="mb-6">
            <p className="text-gray-400">
              Welcome back, <span className="text-white font-semibold">{session.user.email}</span>
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
