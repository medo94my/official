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
    // `main` with the id, not a bare div: SkipLink lives in the root layout and
    // therefore renders here too, and it targets #main. Without this the skip
    // link is present, focusable and goes nowhere — worse than absent, because
    // a keyboard user presses it and loses their place.
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-background-subtle px-5 outline-none"
    >
      <Toaster position="top-right" />
      <div className="w-full max-w-md border border-border bg-surface p-8 shadow-raised">
        <div className="text-center mb-8">
          <h1 className={`${PAGE_TITLE} mb-2`}>Portfolio CMS</h1>
          <p className="text-foreground-muted">Login to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`${LABEL}`}>
              Email
            </label>
            {/* autoComplete is what lets a password manager recognise this as
                a sign-in pair and offer to fill it. Without the tokens, some
                managers guess and some do nothing, and the person with the only
                account on this site ends up typing a long password by hand. */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className={FIELD}
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
              autoComplete="current-password"
              className={FIELD}
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
    </main>
  )
}
