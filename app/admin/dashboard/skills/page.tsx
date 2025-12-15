'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

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
  const [formData, setFormData] = useState({ name: '', category: 'Frontend', icon: '', level: 75, order: 0 })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    const res = await fetch('/api/skills')
    const data = await res.json()
    setSkills(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/skills/${editingId}` : '/api/skills'
      const method = editingId ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast.success(editingId ? 'Skill updated!' : 'Skill created!')
      fetchSkills()
      setFormData({ name: '', category: 'Frontend', icon: '', level: 75, order: 0 })
      setEditingId(null)
    } catch (error) {
      toast.error('Failed to save skill')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    await fetch(`/api/skills/${id}`, { method: 'DELETE' })
    toast.success('Skill deleted!')
    fetchSkills()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Skills</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit' : 'Add'} Skill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Skill name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <div>
                <label className="block text-sm text-gray-300 mb-2">Level: {formData.level}%</label>
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button type="submit" className="w-full px-6 py-3 bg-primary hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg">
                {editingId ? 'Update' : 'Add'} Skill
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Frontend', icon: '', level: 75, order: 0 }) }}
                  className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{skill.icon} {skill.name}</h3>
                    <p className="text-sm text-gray-400">{skill.category}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${skill.level}%` }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingId(skill.id); setFormData(skill) }}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
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
