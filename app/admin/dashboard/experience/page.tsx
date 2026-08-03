'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  BTN,
  BTN_DANGER,
  BTN_GHOST,
  FIELD,
  FIELD_MONO,
  LABEL,
  PAGE_TITLE,
  PANEL,
} from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import ListState from '@/components/admin/ListState'

interface Experience {
  id: string
  company: string
  role: string
  startDate: string
  endDate?: string | null
  location?: string | null
  summary?: string | null
  highlights?: string | null
  url?: string | null
  order: number
}

const EMPTY = {
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  location: '',
  summary: '',
  highlights: '',
  url: '',
  order: 0,
}

/** "2023-06" → "Jun 2023". Mirrors formatMonth in lib/content.ts. */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatMonth(value?: string | null) {
  if (!value) return 'Present'
  const m = /^(\d{4})-(\d{2})$/.exec(value)
  return m ? `${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`.trim() : value
}

export default function ExperiencePage() {
  const [entries, setEntries] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchEntries = useCallback(async () => {
    try {
      setEntries(await apiRequest<Experience[]>('/api/experience'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load experience'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const reset = () => {
    setFormData(EMPTY)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiRequest(
        editingId ? `/api/experience/${editingId}` : '/api/experience',
        { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(formData) }
      )
      toast.success(editingId ? 'Role updated' : 'Role added')
      await fetchEntries()
      reset()
    } catch (error) {
      // Real message now — "startDate: Use YYYY-MM" rather than a silent no-op.
      toast.error(errorMessage(error, 'Could not save'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, role: string) => {
    if (!confirm(`Delete "${role}"? This cannot be undone.`)) return
    try {
      await apiRequest(`/api/experience/${id}`, { method: 'DELETE' })
      toast.success('Role deleted')
      if (editingId === id) reset()
      await fetchEntries()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete'))
    }
  }

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-2`}>Experience</h1>
      <p className="mb-8 max-w-measure text-meta text-foreground-muted">
        The Experience section is hidden on the site until at least one role
        exists here. Nothing is pre-filled — this is your employment record and
        only you can state it.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className={`${PANEL} lg:sticky lg:top-8`}>
            <h2 className="mb-4 font-mono text-base font-medium">
              {editingId ? 'Edit role' : 'Add role'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="role" className={LABEL}>Role</label>
                <input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  placeholder="Backend Engineer"
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="company" className={LABEL}>Company</label>
                <input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  className={FIELD}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startDate" className={LABEL}>Started</label>
                  {/* type=month yields exactly the YYYY-MM the column expects,
                      with a native picker and no parsing layer. */}
                  <input
                    id="startDate"
                    type="month"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className={FIELD_MONO}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className={LABEL}>Ended</label>
                  <input
                    id="endDate"
                    type="month"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={FIELD_MONO}
                  />
                  <p className="mt-1 text-meta text-foreground-subtle">
                    Leave blank if current
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="location" className={LABEL}>Location</label>
                <input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Istanbul, Turkey"
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="summary" className={LABEL}>Summary</label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={3}
                  placeholder="What you owned, in a sentence or two."
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="highlights" className={LABEL}>Highlights</label>
                <textarea
                  id="highlights"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  rows={4}
                  placeholder={'One per line:\nBuilt the ingest pipeline\nCut deploy time from 20m to 4m'}
                  className={FIELD}
                />
                <p className="mt-1 text-meta text-foreground-subtle">One per line</p>
              </div>

              <div>
                <label htmlFor="url" className={LABEL}>Company URL</label>
                <input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://"
                  className={FIELD_MONO}
                />
              </div>

              <div>
                <label htmlFor="order" className={LABEL}>Order</label>
                <input
                  id="order"
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: Number(e.target.value) || 0 })
                  }
                  className={FIELD_MONO}
                />
              </div>

              <button type="submit" disabled={saving} className={`${BTN} w-full`}>
                {saving ? 'Saving…' : editingId ? 'Update role' : 'Add role'}
              </button>

              {editingId && (
                <button type="button" onClick={reset} className={`${BTN_GHOST} w-full`}>
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <ListState loading count={0} empty="" />
          ) : entries.length === 0 ? (
            <div className={PANEL}>
              <p className="text-meta text-foreground-muted">
                No roles yet. The Experience section stays hidden on the site
                until you add one.
              </p>
            </div>
          ) : (
            <ol className="space-y-4">
              {entries.map((entry) => (
                <li key={entry.id} className={PANEL}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-mono text-base font-medium">{entry.role}</h3>
                    <span className="label tnum">
                      {formatMonth(entry.startDate)} — {formatMonth(entry.endDate)}
                    </span>
                  </div>

                  <p className="mt-1 text-meta text-foreground-muted">
                    {entry.company}
                    {entry.location ? ` · ${entry.location}` : ''}
                  </p>

                  {entry.summary && (
                    <p className="mt-3 max-w-measure text-meta text-foreground/80">
                      {entry.summary}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(entry.id)
                        setFormData({
                          company: entry.company,
                          role: entry.role,
                          startDate: entry.startDate,
                          endDate: entry.endDate ?? '',
                          location: entry.location ?? '',
                          summary: entry.summary ?? '',
                          highlights: entry.highlights ?? '',
                          url: entry.url ?? '',
                          order: entry.order,
                        })
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={`${BTN_GHOST} flex-1`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id, entry.role)}
                      className={BTN_DANGER}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
