import Link from 'next/link'
import InquiryRow from '@/components/admin/InquiryRow'
import { PAGE_TITLE, PANEL } from '@/app/admin/ui'
import { isMailerConfigured } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'Unread' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
]

/**
 * The inbox.
 *
 * A server component, unlike the other dashboard pages, and deliberately so:
 * this screen is read-heavy with no create form, and rendering it on the
 * client would mean shipping every message body as JSON. Filtering is done
 * with links and searchParams rather than client state, so a filtered view is
 * a URL you can bookmark. Only the per-row mutations are a client island.
 */
export default async function InboxPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status
  const where = status ? { status } : {}

  const [inquiries, counts] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.inquiry.groupBy({ by: ['status'], _count: true }),
  ])

  const unread = counts.find((c) => c.status === 'new')?._count ?? 0
  const mailerReady = isMailerConfigured()

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-2`}>Inbox</h1>
      <p className="mb-6 max-w-measure text-meta text-foreground-muted">
        Messages from the contact form. Every submission is written here before
        any email is attempted, so nothing is lost if delivery fails.
      </p>

      {!mailerReady && (
        <div className="mb-6 border border-warning/40 bg-surface p-4">
          <p className="label text-warning">Email notifications are off</p>
          <p className="mt-2 max-w-measure text-meta text-foreground/85">
            {/* Without this, a misconfigured mailer is invisible: messages
                arrive correctly but nobody is told, and the inbox goes
                unchecked. */}
            Messages are being saved, but nothing is emailed to you — set{' '}
            <code className="font-mono">RESEND_API_KEY</code>,{' '}
            <code className="font-mono">INQUIRY_NOTIFY_TO</code> and{' '}
            <code className="font-mono">INQUIRY_NOTIFY_FROM</code> to be
            notified. Until then, check this page.
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (status ?? '') === filter.value
          const count =
            filter.value === ''
              ? counts.reduce((sum, c) => sum + c._count, 0)
              : (counts.find((c) => c.status === filter.value)?._count ?? 0)

          return (
            <Link
              key={filter.label}
              href={filter.value ? `?status=${filter.value}` : '/admin/dashboard/inbox'}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center gap-2 border px-4 font-mono text-meta transition-colors ${
                active
                  ? 'border-foreground bg-background-subtle text-foreground'
                  : 'border-border text-foreground-muted hover:border-border-strong hover:text-foreground'
              }`}
            >
              {filter.label}
              <span className="label tnum">{count}</span>
            </Link>
          )
        })}
      </div>

      {inquiries.length === 0 ? (
        <div className={PANEL}>
          <p className="text-meta text-foreground-muted">
            {status
              ? 'Nothing with that status.'
              : 'No messages yet. They appear here as soon as the form is used.'}
          </p>
        </div>
      ) : (
        <>
          {unread > 0 && !status && (
            <p className="mb-3 label">
              {unread} unread of {inquiries.length} shown
            </p>
          )}
          <div className="space-y-2">
            {inquiries.map((inquiry) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={{
                  ...inquiry,
                  // Serialised for the client boundary; Date does not cross it.
                  createdAt: inquiry.createdAt.toISOString(),
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
