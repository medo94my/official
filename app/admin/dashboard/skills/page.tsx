'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BTN, BTN_DANGER, BTN_GHOST, FIELD, PAGE_TITLE, PANEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import ListState from '@/components/admin/ListState'

interface Skill {
  id: string
  name: string
  category: string
  icon?: string
  level: number
  order: number
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', category: 'Frontend', icon: '', level: 75, order: 0 })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Every call below went through a bare `fetch` with no `res.ok` check, so a
  // rejected save still toasted "Skill created!" and the row simply never
  // appeared. `apiRequest` surfaces the real status and message, which is how
  // the rest of the dashboard already behaves.
  const fetchSkills = useCallback(async () => {
    try {
      setSkills(await apiRequest<Skill[]>('/api/skills'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load skills'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiRequest(editingId ? `/api/skills/${editingId}` : '/api/skills', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(formData),
      })
      toast.success(editingId ? 'Skill updated' : 'Skill created')
      await fetchSkills()
      setFormData({ name: '', category: 'Frontend', icon: '', level: 75, order: 0 })
      setEditingId(null)
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save skill'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    try {
      await apiRequest(`/api/skills/${id}`, { method: 'DELETE' })
      toast.success('Skill deleted')
      await fetchSkills()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete skill'))
    }
  }

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-8`}>Skills</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className={`${PANEL} sticky top-8`}>
            <h2 className="text-xl font-bold text-foreground mb-4">{editingId ? 'Edit' : 'Add'} Skill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Skill name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className={`${FIELD}`}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`${FIELD}`}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Tools</option>
                <option>Other</option>
              </select>
              <input
                type="text"
                placeholder="Icon (emoji or class)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className={`${FIELD}`}
              />
              <div>
                <label className="block text-sm text-foreground mb-2">Level: {formData.level}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <input
                type="number"
                placeholder="Order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className={`${FIELD}`}
              />
              <button type="submit" className={`${BTN} w-full`}>
                {editingId ? 'Update' : 'Add'} Skill
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Frontend', icon: '', level: 75, order: 0 }) }}
                  className={`${BTN_GHOST} w-full`}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ListState
            loading={loading}
            count={skills.length}
            empty="No skills yet."
            consequence="The Stack section on the homepage stays hidden until at least one exists."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="bg-surface border border-border  p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{skill.icon} {skill.name}</h3>
                    <p className="text-sm text-foreground-muted">{skill.category}</p>
                  </div>
                </div>
                <div className="w-full bg-background-subtle h-2 mb-4">
                  <div className="bg-foreground h-2 rounded-full" style={{ width: `${skill.level}%` }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(skill.id)
                      setFormData({
                        name: skill.name,
                        category: skill.category,
                        icon: skill.icon ?? '',
                        level: skill.level,
                        order: skill.order,
                      })
                    }}
                    className={`${BTN_GHOST} flex-1`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className={`${BTN_DANGER}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
