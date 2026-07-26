'use client'

import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_IDEA_TEMPLATE_ID ||
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

type Status = 'idle' | 'sending' | 'success' | 'error'

const FIELD =
  'w-full border border-rule bg-paper px-3 py-2.5 font-mono text-meta text-ink placeholder:text-dim focus:border-ink focus:outline-none'

const PROJECT_TYPES = [
  { value: 'web', label: 'Web application' },
  { value: 'automation', label: 'Automation or scraping' },
  { value: 'api', label: 'API or integration' },
  { value: 'other', label: 'Something else' },
]

/**
 * Renders nothing without EmailJS credentials — a form that discards
 * submissions is worse than no form.
 *
 * Uses a native <select> rather than the Radix one: it needs no JS to render,
 * is keyboard- and screen-reader-correct by default, and gets the platform
 * picker on mobile.
 */
export default function IdeaSubmission() {
  const [status, setStatus] = useState<Status>('idle')
  const form = useRef<HTMLFormElement>(null)

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.current) return

    setStatus('sending')
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
      setStatus('success')
      form.current.reset()
    } catch (error) {
      console.error('Idea submission failed:', error)
      setStatus('error')
    }
  }

  return (
    <section id="idea" className="pt-20 sm:pt-28">
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-4">
        <h2 className="font-mono text-lg font-semibold tracking-tight sm:text-xl">
          Have something to build?
        </h2>
        <span className="label">Scope it with me</span>
      </div>

      <form ref={form} onSubmit={handleSubmit} className="max-w-measure">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="idea_name" className="label mb-2 block">
              Name
            </label>
            <input id="idea_name" name="user_name" required className={FIELD} />
          </div>
          <div>
            <label htmlFor="idea_email" className="label mb-2 block">
              Email
            </label>
            <input id="idea_email" name="user_email" type="email" required className={FIELD} />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="project_type" className="label mb-2 block">
            Kind of project
          </label>
          <select id="project_type" name="project_type" defaultValue="web" className={FIELD}>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="idea_message" className="label mb-2 block">
            What are you trying to do?
          </label>
          <textarea
            id="idea_message"
            name="message"
            rows={5}
            required
            className={`${FIELD} resize-y`}
          />
          <p className="mt-2 text-meta text-muted">
            The problem it solves matters more than the feature list.
          </p>
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="mt-6 inline-flex min-h-11 items-center gap-2 border border-ink px-5 font-mono text-meta text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send it over'}
          <span aria-hidden="true">→</span>
        </button>

        <p aria-live="polite" className="mt-4 font-mono text-meta">
          {status === 'success' && <span className="text-live">Got it. I&apos;ll read and reply.</span>}
          {status === 'error' && <span>That didn&apos;t send. Try again, or email me directly.</span>}
        </p>
      </form>
    </section>
  )
}
