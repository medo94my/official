'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BTN, BTN_DANGER, BTN_GHOST, FIELD, PAGE_TITLE, PANEL } from '@/app/admin/ui'

interface Stat {
  id: string
  label: string
  value: string
  order: number
}

const EMPTY = { label: '', value: '', order: 0 }

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [formData, setFormData] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const res = await fetch('/api/stats')
    if (!res.ok) {
      toast.error('Failed to load stats')
      return
    }
    setStats(await res.json())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/stats/${editingId}` : '/api/stats'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success(editingId ? 'Stat updated!' : 'Stat created!')
      fetchStats()
      setFormData(EMPTY)
      setEditingId(null)
    } catch (error) {
      toast.error('Failed to save stat')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stat?')) return
    const res = await fetch(`/api/stats/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to delete stat')
      return
    }
    toast.success('Stat deleted!')
    fetchStats()
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
            <p className="text-foreground-muted">No stats yet — the homepage strip is hidden.</p>
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
