'use client'

import { useState } from 'react'
import { BTN_GHOST, PANEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import { repoIdentity } from '@/lib/repo-import'
import type { DraftableField } from '@/lib/case-study-draft'

type DraftedField = {
  field: DraftableField
  label: string
  value: string
  evidence: string
}

type DraftResponse = {
  drafted: DraftedField[]
  declined: { field: DraftableField; label: string }[]
  repo: string
  isPrivate: boolean
  model: string
  readmeWords: number
}

type Props = {
  githubUrl: string
  /** Current form values, so a field already written is not silently replaced. */
  current: Record<string, string>
  onApply: (field: DraftableField, value: string) => void
}

/**
 * Whether this repository is private, resolved at click time.
 *
 * Deliberately fails *closed*: an unreachable list, or a repository the list
 * does not contain, returns true and so triggers the warning. Being asked about
 * a public repository is a small annoyance; sending a private README to a third
 * party without asking is not something to get wrong in the other direction.
 */
async function isRepoPrivate(identity: string): Promise<boolean> {
  try {
    const { repos } = await apiRequest<{
      repos: { htmlUrl: string; isPrivate: boolean }[]
    }>('/api/github/repos')
    const match = repos.find((r) => repoIdentity(r.htmlUrl) === identity)
    return match ? match.isPrivate : true
  } catch {
    return true
  }
}

/**
 * Drafts case-study fields from the project's repository.
 *
 * Five of the twelve fields, never the other seven — see lib/case-study-draft.ts
 * for why. The parse layer drops anything outside that set, so this component
 * renders whatever survives rather than trusting the model.
 *
 * Nothing is applied automatically and nothing is saved here. Each field is
 * accepted individually and the form is still not written until Update, which is
 * the same contract as GithubCompare directly above it.
 */
export function CaseStudyDraft({ githubUrl, current, onApply }: Props) {
  const [result, setResult] = useState<DraftResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState<Set<string>>(new Set())

  const identity = repoIdentity(githubUrl)
  if (!identity) return null

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      // Asked before the request, not after: the README of a private repository
      // is about to leave for a third party, and consent after the fact is not
      // consent. Public repositories are already world-readable, so asking there
      // would be noise that trains the habit of dismissing the dialog.
      if (
        (await isRepoPrivate(identity)) &&
        !confirm(
          `${identity} is not public, or its visibility could not be confirmed.\n\nDrafting sends its README and file listing to the model chosen in Settings, by way of OpenRouter.\n\nContinue?`
        )
      ) {
        setLoading(false)
        return
      }

      setResult(
        await apiRequest<DraftResponse>('/api/projects/draft', {
          method: 'POST',
          body: JSON.stringify({ githubUrl }),
        })
      )
      setApplied(new Set())
    } catch (e) {
      setError(errorMessage(e, 'Could not draft from that repository'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-border pt-4">
      {!result && !error && (
        <>
          <button type="button" onClick={() => void run()} disabled={loading} className={BTN_GHOST}>
            {loading ? 'Reading the repository…' : 'Draft from repository'}
          </button>
          <p className="mt-2 max-w-measure text-meta text-foreground-subtle">
            Reads {identity}&rsquo;s README and file listing and drafts five fields from them.
            Nothing is filled in that the repository does not support, and nothing is saved until
            you press Update.
          </p>
        </>
      )}

      {error && (
        <div className={PANEL}>
          <p className="max-w-measure text-meta text-error">{error}</p>
          <button type="button" onClick={() => setError(null)} className={`${BTN_GHOST} mt-3`}>
            Dismiss
          </button>
        </div>
      )}

      {result && (
        <>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="label">
              Drafted from {result.repo} · {result.readmeWords} words of README
            </p>
            <button type="button" onClick={() => void run()} disabled={loading} className={BTN_GHOST}>
              {loading ? 'Redrafting…' : 'Draft again'}
            </button>
          </div>
          <p className="mb-3 font-mono text-meta text-foreground-subtle">{result.model}</p>

          <div className="space-y-3">
            {result.drafted.map((draft) => {
              const existing = (current[draft.field] ?? '').trim()
              const isApplied = applied.has(draft.field)

              return (
                <div key={draft.field} className="border border-border p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="label">{draft.label}</p>
                    {/* The citation is the review mechanism: invented prose cannot
                        name the heading it came from. */}
                    <p className="label text-foreground-subtle">{draft.evidence}</p>
                  </div>

                  {existing && (
                    <p className="mt-2 max-w-measure whitespace-pre-line text-meta text-foreground-subtle">
                      Now: {existing}
                    </p>
                  )}

                  <p className="mt-2 max-w-measure whitespace-pre-line text-meta text-foreground/85">
                    {draft.value}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      onApply(draft.field, draft.value)
                      setApplied((prev) => new Set(prev).add(draft.field))
                    }}
                    className={`${BTN_GHOST} mt-2`}
                  >
                    {isApplied ? 'Applied — use again' : existing ? 'Replace with this' : 'Use this'}
                  </button>
                </div>
              )
            })}
          </div>

          {result.declined.length > 0 && (
            <p className="mt-3 max-w-measure text-meta text-foreground-subtle">
              {/* Naming them matters: a silent gap reads as a bug, whereas
                  "the repository does not say" is a true and useful answer. */}
              Not drafted, because the repository does not support them:{' '}
              {result.declined.map((d) => d.label).join(', ')}.
            </p>
          )}

          {result.drafted.length === 0 && (
            <p className="max-w-measure text-meta text-warning">
              The model found nothing in {result.repo} it could support with a citation. That is a
              refusal rather than a failure — the README describes how to run it, not why it is
              built that way.
            </p>
          )}

          <p className="mt-3 max-w-measure text-meta text-foreground-subtle">
            Problem, Who it&rsquo;s for, My role, Responsibilities, Outcome and Lessons are never
            drafted. Nothing in a repository supports them, and they are yours to write.
          </p>
        </>
      )}
    </div>
  )
}
