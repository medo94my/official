/**
 * What a list shows when it has nothing to show.
 *
 * Every dashboard list rendered an empty `<div>` while its first fetch was in
 * flight, which is indistinguishable from having no records — and, if the fetch
 * had failed, from that too. Three different situations, one blank space, and
 * the owner left to guess which.
 *
 * Returns null once there is content, so it wraps nothing in the common case.
 */
export default function ListState({
  loading,
  count,
  empty,
  consequence,
}: {
  loading: boolean
  count: number
  /** What is missing, in the owner's terms. */
  empty: string
  /** What that absence does to the public site, when it does something. */
  consequence?: string
}) {
  if (count > 0) return null

  if (loading) {
    return (
      <p role="status" className="py-8 text-meta text-foreground-muted">
        Loading…
      </p>
    )
  }

  return (
    <div className="border border-dashed border-border px-4 py-8">
      <p className="text-meta text-foreground-muted">{empty}</p>
      {/* Naming the effect is the useful half: "no stats yet" is a fact, "the
          homepage strip stays hidden" is the reason to care. */}
      {consequence && (
        <p className="mt-2 max-w-measure text-meta text-foreground-subtle">{consequence}</p>
      )}
    </div>
  )
}

/**
 * The same idea for a single-record form.
 *
 * About and Hero edit one row, so an empty list is not the failure mode —
 * a form full of blank inputs that silently fills in a moment later is. Without
 * this, typing into the field during that window loses what you typed.
 */
export function FormLoading({ loading }: { loading: boolean }) {
  if (!loading) return null
  return (
    <p role="status" className="text-meta text-foreground-muted">
      Loading…
    </p>
  )
}
