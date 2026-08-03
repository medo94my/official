'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BTN, BTN_DANGER, BTN_GHOST, FIELD, PAGE_TITLE, PANEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import ListState from '@/components/admin/ListState'

interface Stat {
  id: string
  label: string
  value: string
  order: number
}

const EMPTY = { label: '', value: '', order: 0 }

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  // This page did check res.ok, but then threw the server's message away and
  // toasted a generic one — so a 409 on a duplicate label read the same as a
  // database being down. apiRequest keeps the message that says which.
  const fetchStats = useCallback(async () => {
    try {
      setStats(await apiRequest<Stat[]>('/api/stats'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load stats'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiRequest(editingId ? `/api/stats/${editingId}` : '/api/stats', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(formData),
      })
      toast.success(editingId ? 'Stat updated' : 'Stat created')
      await fetchStats()
      setFormData(EMPTY)
      setEditingId(null)
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save stat'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stat?')) return
    try {
      await apiRequest(`/api/stats/${id}`, { method: 'DELETE' })
      toast.success('Stat deleted')
      await fetchStats()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete stat'))
    }
  }

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-2`}>Stats</h1>
      <p className="text-foreground-muted mb-8">
        The metrics strip on the homepage. It stays hidden while this list is empty — add
        only figures you can stand behind.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className={`${PANEL} sticky top-8`}>
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingId ? 'Edit' : 'Add'} Stat
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Label (e.g. Years of Experience)"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
                className={`${FIELD}`}
              />
              <input
                type="text"
                placeholder="Value (e.g. 6+)"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                className={`${FIELD}`}
              />
              <input
                type="number"
                placeholder="Order"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                className={`${FIELD}`}
              />
              <button
                type="submit"
                className={`${BTN} w-full`}
              >
                {editingId ? 'Update' : 'Add'} Stat
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData(EMPTY)
                  }}
                  className={`${BTN_GHOST} w-full`}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {stats.length === 0 ? (
            <ListState
              loading={loading}
              count={stats.length}
              empty="No stats yet."
              consequence="The metrics strip on the homepage stays hidden until at least one exists."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className={`${PANEL}`}
                >
                  <p className="text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-meta text-foreground-muted mb-4">{stat.label}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(stat.id)
                        setFormData({
                          label: stat.label,
                          value: stat.value,
                          order: stat.order,
                        })
                      }}
                      className={`${BTN_GHOST} flex-1`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(stat.id)}
                      className={`${BTN_DANGER}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
