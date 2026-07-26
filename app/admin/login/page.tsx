'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { BTN, FIELD, LABEL, PAGE_TITLE } from '@/app/admin/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid credentials')
      } else {
        toast.success('Login successful!')
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Toaster position="top-right" />
      <div className="bg-panel p-8 rounded-2xl shadow-2xl w-full max-w-md border border-rule">
        <div className="text-center mb-8">
          <h1 className={`${PAGE_TITLE} mb-2`}>Portfolio CMS</h1>
          <p className="text-muted">Login to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`${LABEL}`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${FIELD} placeholder-gray-400 focus:outline-none focus:border-ink focus:border-transparent transition`}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={`${LABEL}`}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${FIELD} placeholder-gray-400 focus:outline-none focus:border-ink focus:border-transparent transition`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${BTN} w-full`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
