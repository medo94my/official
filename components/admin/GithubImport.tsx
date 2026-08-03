'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BTN, BTN_GHOST, CHECKBOX, FIELD_MONO, PANEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import Modal from '@/components/ui/Modal'
import {
  diffRepoFields,
  repoIdentity,
  type FieldDiff,
  type RepoSummary,
} from '@/lib/repo-import'

type RepoListResult = {
  login: string | null
  authenticated: boolean
  truncated: boolean
  fetchedAt: string
  repos: RepoSummary[]
}

/**
 * Shared loader for both surfaces below.
 *
 * The picker and the comparison panel read the same list, so fetching once and
 * passing it around means opening Compare costs nothing after the picker has
 * been used, and neither needs a per-repository endpoint.
 */
function useRepos(active: boolean) {
  const [data, setData] = useState<RepoListResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (refresh = false) => {
    setLoading(true)
    setError(null)
    try {
      setData(await apiRequest<RepoListResult>(`/api/github/repos${refresh ? '?refresh=1' : ''}`))
    } catch (e) {
      // Into component state, not a toast: a toast that vanishes in four
      // seconds is the wrong surface for "here is what to configure".
      setError(errorMessage(e, 'Could not reach GitHub'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (active && !data && !loading && !error) void load()
  }, [active, data, loading, error, load])

  return { data, error, loading, load }
}

type PickerProps = {
  open: boolean
  /** Already-saved projects, so imported repos can be marked rather than re-offered. */
  projects: { id: string; title: string; githubUrl?: string | null }[]
  onSelect: (repo: RepoSummary) => void
  onEditExisting: (projectId: string) => void
  onClose: () => void
}

/**
 * Pick a repository to prefill the create form.
 *
 * A sibling of the project form modal rather than a step inside it: that form
 * is a single `<form>` with required inputs, and a step within it would mean
 * either intercepting the picker's Enter key or remounting and losing state.
 * The choice is logically before the form anyway.
 */
export function GithubRepoPicker({
  open,
  projects,
  onSelect,
  onEditExisting,
  onClose,
}: PickerProps) {
  const { data, error, loading, load } = useRepos(open)
  const [query, setQuery] = useState('')
  const [showForks, setShowForks] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open, data])

  /** owner/repo -> the project that already holds it. */
  const imported = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>()
    for (const project of projects) {
      const identity = repoIdentity(project.githubUrl)
      if (identity) map.set(identity, { id: project.id, title: project.title })
    }
    return map
  }, [projects])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (data?.repos ?? [])
      .filter((repo) => showForks || !repo.isFork)
      .filter((repo) =>
        !needle
          ? true
          : [repo.name, repo.description ?? '', repo.language ?? '', ...repo.topics]
              .join(' ')
              .toLowerCase()
              .includes(needle)
      )
  }, [data, query, showForks])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import from GitHub"
      description="Pick a repository to prefill a new project. Nothing is saved until you press Create."
    >
      <>
        {data && !data.authenticated && (
          <div className="mb-4 border border-warning/40 bg-background-subtle p-4">
            <p className="label text-warning">Public repositories only</p>
            <p className="mt-2 text-meta text-foreground/85">
              GitHub allows 60 unauthenticated requests an hour per host, shared with everything
              else running here, so this can stop working temporarily. Add a GitHub token in
              Settings to include private repositories and raise the limit to 5,000.
            </p>
          </div>
        )}

        {error && (
          <div className={`${PANEL} mb-4`}>
            <p className="text-meta text-error">{error}</p>
            <button onClick={() => void load(true)} className={`${BTN_GHOST} mt-3`}>
              Try again
            </button>
          </div>
        )}

        {loading && !data && <p className="text-meta text-foreground-muted">Loading repositories…</p>}

        {data && (
          <>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter repositories"
              aria-label="Filter repositories"
              className={FIELD_MONO}
            />

            <label className="mt-3 flex items-center gap-2 text-meta text-foreground-muted">
              <input
                type="checkbox"
                checked={showForks}
                onChange={(e) => setShowForks(e.target.checked)}
                className={CHECKBOX}
              />
              Show forks
            </label>

            <div className="mt-4 space-y-2">
              {visible.map((repo) => {
                const existing = imported.get(repoIdentity(repo.htmlUrl) ?? '')
                return (
                  <div key={repo.id} className="border border-border p-3">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-meta font-medium">{repo.name}</span>
                      {repo.isPrivate && <span className="label">Private</span>}
                      {repo.isFork && <span className="label text-foreground-subtle">Fork</span>}
                      {repo.isArchived && <span className="label text-warning">Archived</span>}
                      {existing && <span className="label text-success">In portfolio</span>}
                    </div>

                    {repo.description && (
                      <p className="mt-1 line-clamp-2 text-meta text-foreground-muted">
                        {repo.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="label tnum">
                        {[repo.language, `${repo.stars}★`, repo.pushedAt.slice(0, 10)]
                          .filter(Boolean)
                          .join('  ·  ')}
                      </p>
                      {existing ? (
                        <button onClick={() => onEditExisting(existing.id)} className={BTN_GHOST}>
                          Edit
                        </button>
                      ) : (
                        <button onClick={() => onSelect(repo)} className={BTN}>
                          Use this
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {visible.length === 0 && (
                <p className="text-meta text-foreground-muted">
                  {query
                    ? `No repository matches “${query}”.`
                    : data.repos.length === 0
                      ? 'This account has no repositories GitHub will show us.'
                      : 'Everything is filtered out — try showing forks.'}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <button onClick={() => void load(true)} disabled={loading} className={BTN_GHOST}>
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              <p className="label tnum">
                {visible.length} of {data.repos.length} · loaded {data.fetchedAt.slice(11, 16)}
              </p>
              {data.truncated && (
                <p className="text-meta text-foreground-subtle">
                  Showing the most recently updated only.
                </p>
              )}
            </div>
          </>
        )}
      </>
    </Modal>
  )
}

type CompareProps = {
  githubUrl: string
  current: { description: string; githubUrl: string; liveUrl: string; tags: string }
  onApply: (diff: FieldDiff) => void
}

/**
 * Field-by-field comparison with the repository, for a project already saved.
 *
 * Nothing is applied automatically. A one-shot "refresh from GitHub" would
 * overwrite hand-written descriptions with a repo's one-line blurb, silently —
 * and the prose on the public site is usually much the better of the two. So
 * the owner resolves each field, and the form is still not saved until they
 * press Update.
 */
export function GithubCompare({ githubUrl, current, onApply }: CompareProps) {
  const [active, setActive] = useState(false)
  const { data, error, loading } = useRepos(active)

  const identity = repoIdentity(githubUrl)
  const repo = data?.repos.find((r) => repoIdentity(r.htmlUrl) === identity)
  const diffs = repo ? diffRepoFields(current, repo) : []

  if (!identity) return null

  return (
    <div className="border-t border-border pt-4">
      {!active ? (
        <button type="button" onClick={() => setActive(true)} className={BTN_GHOST}>
          Compare with GitHub
        </button>
      ) : (
        <>
          <p className="label mb-2">Compared with {identity}</p>
          {loading && <p className="text-meta text-foreground-muted">Loading…</p>}
          {error && <p className="text-meta text-error">{error}</p>}
          {data && !repo && (
            <p className="text-meta text-foreground-muted">
              That repository is not in the list GitHub returned — it may be private, renamed, or
              owned by someone else.
            </p>
          )}
          {repo && diffs.length === 0 && (
            <p className="text-meta text-success">Everything matches GitHub.</p>
          )}

          <div className="space-y-3">
            {diffs.map((diff) => (
              <div key={diff.field} className="border border-border p-3">
                <p className="label">{diff.label}</p>
                <p className="mt-2 text-meta text-foreground-subtle">
                  Now: {diff.current || <em>empty</em>}
                </p>
                <p className="mt-1 text-meta text-foreground/85">GitHub: {diff.incoming}</p>
                <button
                  type="button"
                  onClick={() => onApply(diff)}
                  className={`${BTN_GHOST} mt-2`}
                >
                  Use GitHub&rsquo;s value
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
