'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

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

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-8">Portfolio CMS</h1>

          <nav className="space-y-2">
            <Link
              href="/admin/dashboard"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard/projects"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
            >
              Projects
            </Link>
            <Link
              href="/admin/dashboard/skills"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
            >
              Skills
            </Link>
            <Link
              href="/admin/dashboard/services"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
            >
              Services
            </Link>
            <Link
              href="/admin/dashboard/about"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
            >
              About
            </Link>
            <Link
              href="/admin/dashboard/hero"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
            >
              Hero Section
            </Link>
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition mb-2"
            >
              View Portfolio
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <div className="p-8">
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
