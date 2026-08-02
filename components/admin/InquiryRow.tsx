'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { BTN_DANGER, BTN_GHOST } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'

type Inquiry = {
  id: string
  name: string
  email: string
  company: string | null
  reason: string | null
  projectType: string | null
  budget: string | null
  timeline: string | null
  message: string
  status: string
  ipHash: string | null
  createdAt: string
}

const STATUS_STYLE: Record<string, string> = {
  new: 'text-primary',
  read: 'text-foreground-muted',
  replied: 'text-success',
  archived: 'text-foreground-subtle',
}

/**
 * One inquiry, expandable in place.
 *
 * Built on <details> so the row opens without JavaScript; the client code adds
 * the mutations and the auto-mark-read, which are enhancements rather than
 * the mechanism. Only this island is client-side — the list itself stays a
 * server component so message bodies are never shipped as a JSON payload.
 */
export default function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  const mutate = async (status: string) => {
    setBusy(true)
    try {
      await apiRequest(`/api/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      startTransition(() => router.refresh())
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!confirm(`Delete the message from ${inquiry.name}? This cannot be undone.`)) return
    setBusy(true)
    try {
      await apiRequest(`/api/inquiries/${inquiry.id}`, { method: 'DELETE' })
      toast.success('Deleted')
      startTransition(() => router.refresh())
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete'))
    } finally {
      setBusy(false)
    }
  }

  const details = [
    inquiry.company && ['Company', inquiry.company],
    inquiry.reason && ['Reason', inquiry.reason],
    inquiry.projectType && ['Project type', inquiry.projectType],
    inquiry.budget && ['Budget', inquiry.budget],
    inquiry.timeline && ['Timeline', inquiry.timeline],
  ].filter(Boolean) as [string, string][]

  const replyHref = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    `Re: your message`
  )}&body=${encodeURIComponent(
    `\n\n---\nOn ${new Date(inquiry.createdAt).toLocaleDateString()} you wrote:\n\n${inquiry.message}\n`
  )}`

  return (
    <details
      className="group border border-border bg-surface"
      // Opening a new message marks it read; re-opening a read one does not
      // re-issue the request.
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open && inquiry.status === 'new') {
          void mutate('read')
        }
      }}
    >
      <summary className="flex cursor-pointer list-none items-baseline gap-3 p-4">
        <span
          aria-hidden="true"
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            inquiry.status === 'new' ? 'bg-primary' : 'bg-border-strong'
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-meta font-medium text-foreground">
              {inquiry.name}
            </span>
            {inquiry.company && (
              <span className="text-meta text-foreground-muted">{inquiry.company}</span>
            )}
            <span className={`label ${STATUS_STYLE[inquiry.status] ?? ''}`}>
              {inquiry.status}
            </span>
          </span>
          <span className="mt-1 block truncate text-meta text-foreground-subtle">
            {inquiry.message}
          </span>
        </span>
        <time
          dateTime={inquiry.createdAt}
          className="label tnum shrink-0 whitespace-nowrap"
        >
          {new Date(inquiry.createdAt).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
          })}
        </time>
      </summary>

      <div className="border-t border-border p-4">
        <p className="font-mono text-meta text-foreground-muted">
          <a
            href={`mailto:${inquiry.email}`}
            className="underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            {inquiry.email}
          </a>
        </p>

        {details.length > 0 && (
          <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="label">{label}</dt>
                <dd className="mt-0.5 text-meta text-foreground/85">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-4 max-w-measure whitespace-pre-wrap text-meta leading-relaxed text-foreground/85">
          {inquiry.message}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <a href={replyHref} className={BTN_GHOST}>
            Reply
          </a>
          {inquiry.status !== 'replied' && (
            <button
              onClick={() => mutate('replied')}
              disabled={busy || isPending}
              className={BTN_GHOST}
            >
              Mark replied
            </button>
          )}
          {inquiry.status !== 'archived' && (
            <button
              onClick={() => mutate('archived')}
              disabled={busy || isPending}
              className={BTN_GHOST}
            >
              Archive
            </button>
          )}
          <button onClick={remove} disabled={busy || isPending} className={BTN_DANGER}>
            Delete
          </button>
        </div>

        {inquiry.ipHash && (
          <p className="mt-4 font-mono text-meta text-foreground-subtle">
            {/* Not an address — a salted hash. Enough to spot a repeat sender,
                not enough to identify anyone. */}
            source {inquiry.ipHash}
          </p>
        )}
      </div>
    </details>
  )
}
