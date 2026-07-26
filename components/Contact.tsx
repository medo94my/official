'use client'

import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

type ContactProps = {
  email?: string | null
  location?: string | null
}

type Status = 'idle' | 'sending' | 'success' | 'error'

const FIELD =
  'w-full border border-rule bg-paper px-3 py-2.5 font-mono text-meta text-ink placeholder:text-dim focus:border-ink focus:outline-none'

/**
 * Hidden entirely when EmailJS is unconfigured — the page already lists the
 * email address in the Contact section, so a second dead form adds nothing.
 * The original faked a success state when unconfigured, silently dropping
 * every message.
 */
export default function Contact({ email }: ContactProps) {
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
      console.error('Contact form failed to send:', error)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="pt-20 sm:pt-28">
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-4">
        <h2 className="font-mono text-lg font-semibold tracking-tight sm:text-xl">
          Send a message
        </h2>
        <span className="label">Reply within a day or two</span>
      </div>

      <form ref={form} onSubmit={handleSubmit} className="max-w-measure">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="user_name" className="label mb-2 block">
              Name
            </label>
            <input id="user_name" name="user_name" required className={FIELD} />
          </div>
          <div>
            <label htmlFor="user_email" className="label mb-2 block">
              Email
            </label>
            <input id="user_email" name="user_email" type="email" required className={FIELD} />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="message" className="label mb-2 block">
            Message
          </label>
          <textarea id="message" name="message" rows={5} required className={`${FIELD} resize-y`} />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="mt-6 inline-flex min-h-11 items-center gap-2 border border-ink px-5 font-mono text-meta text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send'}
          <span aria-hidden="true">→</span>
        </button>

        <p aria-live="polite" className="mt-4 font-mono text-meta">
          {status === 'success' && <span className="text-live">Sent. I&apos;ll be in touch.</span>}
          {status === 'error' && (
            <span className="text-ink">
              That didn&apos;t send. Email me directly at{' '}
              <a className="underline decoration-rule underline-offset-4" href={`mailto:${email}`}>
                {email}
              </a>
              .
            </span>
          )}
        </p>
      </form>
    </section>
  )
}
