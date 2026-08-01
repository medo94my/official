'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { PROJECT_TYPES, REASONS, contactSchema, type ContactInput } from '@/lib/schemas/contact'
import { duration, ease } from '@/lib/motion'

type Status = 'idle' | 'sending' | 'success' | 'error'

const FIELD =
  'w-full border border-border bg-surface px-3 py-2.5 text-base text-foreground ' +
  'placeholder:text-foreground-subtle transition-colors duration-200 ease-standard ' +
  'focus:border-border-strong focus:outline-none aria-[invalid=true]:border-error'

const LABEL = 'label mb-2 block'

/**
 * The contact form.
 *
 * Sits alongside the direct methods rather than replacing them — a recruiter
 * with a role to fill often wants an address to paste into their own client,
 * and forcing everyone through a form loses those enquiries.
 *
 * Validation runs against the same zod schema the route uses, so the browser
 * can give field-level errors immediately while the server still re-validates.
 * Client-side validation here is a convenience, never a control.
 */
export default function ContactForm({ email }: { email?: string | null }) {
  const [status, setStatus] = useState<Status>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  // Wall-clock since mount, sent with the submission. A bot posting instantly
  // trips this; a person filling in eight fields never will.
  const mountedAt = useRef<number>(Date.now())

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { reason: 'other' },
  })

  useEffect(() => {
    mountedAt.current = Date.now()
  }, [])

  const onSubmit = async (values: ContactInput) => {
    setStatus('sending')
    setFormError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, elapsedMs: Date.now() - mountedAt.current }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        // Map server-side field errors back onto the inputs so the correction
        // is shown where it has to be made, not only in a banner.
        if (data.code === 'invalid' && data.fieldErrors) {
          for (const [field, messages] of Object.entries(data.fieldErrors)) {
            const message = (messages as string[])[0]
            if (message) setError(field as keyof ContactInput, { message })
          }
          setStatus('idle')
          setFormError('Some details need fixing.')
          return
        }

        if (data.code === 'rate_limited') {
          setStatus('error')
          setFormError(
            'That is a few messages in a short time. Try again a little later, or email me directly.'
          )
          return
        }

        throw new Error(data.code ?? 'server_error')
      }

      setStatus('success')
      reset()
    } catch {
      setStatus('error')
      setFormError('That did not send.')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.base, ease: ease.standard }}
        className="border border-border bg-surface p-6"
        // Announced to screen readers the moment it replaces the form, which
        // is the only way a non-sighted user learns the send worked.
        role="status"
        aria-live="polite"
      >
        <p className="label text-success">Message sent</p>
        <p className="mt-3 max-w-measure text-body text-foreground/85">
          Thanks — it is in my inbox. I usually reply within a day or two.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 inline-flex min-h-11 items-center font-mono text-meta text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
        >
          Send another
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-measure">
      {/* Honeypot. Positioned off-screen rather than display:none — a growing
          share of bots skip hidden fields but still fill positioned ones. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="fax">Fax</label>
        <input id="fax" type="text" tabIndex={-1} autoComplete="off" {...register('fax')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name?.message}>
          {/* aria-required, not the `required` attribute: `required` hands
              validation to the browser, which would fire its own native bubble
              before react-hook-form runs and show a second, differently-worded
              error. This announces the obligation without taking over the
              behaviour. The visual convention is the inverse — optional fields
              are labelled "Optional" — and that label is inside the <label>, so
              a screen reader hears it too. */}
          <input id="name" autoComplete="name" aria-required="true" className={FIELD} {...register('name')}
            aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" aria-required="true" className={FIELD} {...register('email')}
            aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field id="company" label="Company" hint="Optional" error={errors.company?.message}>
          <input id="company" autoComplete="organization" className={FIELD} {...register('company')} />
        </Field>

        <Field id="reason" label="What about?" error={errors.reason?.message}>
          <select id="reason" className={FIELD} {...register('reason')}>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field id="projectType" label="Type" hint="Optional">
          <select id="projectType" className={FIELD} {...register('projectType')}>
            <option value="">—</option>
            {PROJECT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>

        <Field id="budget" label="Budget" hint="Optional">
          <input id="budget" placeholder="Rough range" className={FIELD} {...register('budget')} />
        </Field>

        <Field id="timeline" label="Timeline" hint="Optional">
          <input id="timeline" placeholder="When you need it" className={FIELD} {...register('timeline')} />
        </Field>
      </div>

      <div className="mt-4">
        <Field id="message" label="Message" error={errors.message?.message}>
          <textarea id="message" rows={6} aria-required="true" className={`${FIELD} resize-y`}
            placeholder="What you are trying to build or solve, and anything that constrains it."
            {...register('message')}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : undefined} />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary-surface px-5 font-mono text-meta text-primary-foreground transition-colors duration-200 ease-standard hover:bg-primary-surface-hover disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
          {/* The arrow says "this goes somewhere"; while it is going, a
              spinner says "still working". Leaving the arrow in place makes a
              slow request look like a dead button. `animate-spin` is CSS, so
              the reduced-motion block in globals.css flattens it — which is
              correct: the disabled state and the changed label already carry
              the information. */}
          {status === 'sending' ? (
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border border-primary-foreground/40 border-t-primary-foreground"
            />
          ) : (
            <span aria-hidden="true">→</span>
          )}
        </button>

        <p className="text-meta text-foreground-subtle">
          Goes straight to me. No list, no forwarding.
        </p>
      </div>

      {/* aria-live so failures are announced rather than only shown. */}
      <div aria-live="polite" className="mt-4">
        <AnimatePresence>
          {formError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast, ease: ease.standard }}
              className="text-meta text-error"
            >
              {formError}
              {email && status === 'error' && (
                <>
                  {' '}
                  Email me at{' '}
                  <a href={`mailto:${email}`} className="underline decoration-border underline-offset-4">
                    {email}
                  </a>
                  .
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

/** Label, control and error message, wired together for assistive tech. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
        {hint && <span className="ml-2 normal-case text-foreground-subtle">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-meta text-error">
          {error}
        </p>
      )}
    </div>
  )
}
